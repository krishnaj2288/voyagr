# ═══════════════════════════════════════════════════════════════
#  Voyagr — AWS Infrastructure (Terraform)
#  Resources: S3, CloudFront, Route53, ACM, WAF
# ═══════════════════════════════════════════════════════════════

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state in S3 (create this bucket manually first)
  backend "s3" {
    bucket         = "voyagr-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "voyagr-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "Voyagr"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# ACM must be in us-east-1 for CloudFront
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# ───────────────────────────────────────────
# Variables
# ───────────────────────────────────────────
variable "aws_region" {
  description = "Primary AWS region"
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  default     = "production"
}

variable "domain_name" {
  description = "Primary domain name"
  default     = "voyagr.com"
}

variable "staging_domain" {
  description = "Staging subdomain"
  default     = "staging.voyagr.com"
}

# ───────────────────────────────────────────
# S3 Bucket — Production
# ───────────────────────────────────────────
resource "aws_s3_bucket" "website" {
  bucket = "voyagr-website-prod"
}

resource "aws_s3_bucket_public_access_block" "website" {
  bucket                  = aws_s3_bucket.website.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "website" {
  bucket = aws_s3_bucket.website.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "website" {
  bucket = aws_s3_bucket.website.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket Policy — allow CloudFront OAC only
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id
  policy = data.aws_iam_policy_document.s3_cloudfront.json
}

data "aws_iam_policy_document" "s3_cloudfront" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.website.arn}/*"]
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.website.arn]
    }
  }
}

# ───────────────────────────────────────────
# S3 Bucket — Staging
# ───────────────────────────────────────────
resource "aws_s3_bucket" "staging" {
  bucket = "voyagr-website-staging"
}

resource "aws_s3_bucket_public_access_block" "staging" {
  bucket                  = aws_s3_bucket.staging.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ───────────────────────────────────────────
# ACM Certificate
# ───────────────────────────────────────────
resource "aws_acm_certificate" "website" {
  provider          = aws.us_east_1
  domain_name       = var.domain_name
  validation_method = "DNS"
  subject_alternative_names = [
    "www.${var.domain_name}",
    var.staging_domain,
  ]

  lifecycle {
    create_before_destroy = true
  }
}

# ───────────────────────────────────────────
# CloudFront OAC
# ───────────────────────────────────────────
resource "aws_cloudfront_origin_access_control" "website" {
  name                              = "voyagr-oac"
  description                       = "OAC for Voyagr website S3"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ───────────────────────────────────────────
# CloudFront Distribution — Production
# ───────────────────────────────────────────
resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"  # US, Canada, Europe
  comment             = "Voyagr Production"
  aliases             = [var.domain_name, "www.${var.domain_name}"]

  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id                = "voyagr-s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id
  }

  # Default cache behavior
  default_cache_behavior {
    target_origin_id       = "voyagr-s3-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    # Default: moderate cache for HTML
    min_ttl     = 0
    default_ttl = 3600    # 1 hour
    max_ttl     = 86400   # 24 hours
  }

  # Cache behavior for static assets (hashed filenames — long TTL)
  ordered_cache_behavior {
    path_pattern           = "/static/*"
    target_origin_id       = "voyagr-s3-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 31536000
    default_ttl = 31536000   # 1 year
    max_ttl     = 31536000
  }

  # SPA routing — serve index.html for 403/404
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 300
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 300
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.website.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  # Response headers policy (security headers)
  web_acl_id = aws_wafv2_web_acl.website.arn
}

# ───────────────────────────────────────────
# CloudFront Distribution — Staging
# ───────────────────────────────────────────
resource "aws_cloudfront_distribution" "staging" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  comment             = "Voyagr Staging"
  aliases             = [var.staging_domain]

  origin {
    domain_name              = aws_s3_bucket.staging.bucket_regional_domain_name
    origin_id                = "voyagr-staging-s3"
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id
  }

  default_cache_behavior {
    target_origin_id       = "voyagr-staging-s3"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.website.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

# ───────────────────────────────────────────
# WAF — Basic rate limiting & protections
# ───────────────────────────────────────────
resource "aws_wafv2_web_acl" "website" {
  provider    = aws.us_east_1
  name        = "voyagr-waf"
  description = "WAF for Voyagr CloudFront"
  scope       = "CLOUDFRONT"

  default_action { allow {} }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "RateLimitRule"
    priority = 2
    action { block {} }
    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitMetric"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "VoyagrWAF"
    sampled_requests_enabled   = true
  }
}

# ───────────────────────────────────────────
# Route53 — DNS
# ───────────────────────────────────────────
data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false
}

resource "aws_route53_record" "website_apex" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "website_www" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "staging" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.staging_domain
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.staging.domain_name
    zone_id                = aws_cloudfront_distribution.staging.hosted_zone_id
    evaluate_target_health = false
  }
}

# ───────────────────────────────────────────
# IAM — GitHub Actions Deploy User
# ───────────────────────────────────────────
resource "aws_iam_user" "github_actions" {
  name = "voyagr-github-actions"
}

resource "aws_iam_access_key" "github_actions" {
  user = aws_iam_user.github_actions.name
}

resource "aws_iam_user_policy" "github_actions_deploy" {
  name = "voyagr-deploy-policy"
  user = aws_iam_user.github_actions.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3DeployProd"
        Effect = "Allow"
        Action = ["s3:PutObject", "s3:DeleteObject", "s3:GetObject", "s3:ListBucket", "s3:GetBucketLocation"]
        Resource = [
          aws_s3_bucket.website.arn,
          "${aws_s3_bucket.website.arn}/*",
          aws_s3_bucket.staging.arn,
          "${aws_s3_bucket.staging.arn}/*"
        ]
      },
      {
        Sid    = "CloudFrontInvalidate"
        Effect = "Allow"
        Action = ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation", "cloudfront:ListInvalidations"]
        Resource = [
          aws_cloudfront_distribution.website.arn,
          aws_cloudfront_distribution.staging.arn
        ]
      }
    ]
  })
}

# ───────────────────────────────────────────
# CloudWatch — Alarms
# ───────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "high_error_rate" {
  alarm_name          = "voyagr-high-4xx-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "4xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Average"
  threshold           = "5"
  alarm_description   = "4xx error rate > 5% for 10 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    DistributionId = aws_cloudfront_distribution.website.id
    Region         = "Global"
  }
}

# ───────────────────────────────────────────
# Outputs
# ───────────────────────────────────────────
output "cloudfront_domain" {
  value       = aws_cloudfront_distribution.website.domain_name
  description = "CloudFront distribution domain"
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.website.id
  description = "Add this to GitHub Secrets as CLOUDFRONT_DISTRIBUTION_ID"
}

output "s3_bucket_name" {
  value       = aws_s3_bucket.website.id
  description = "Add this to GitHub Secrets as S3_BUCKET_NAME"
}

output "github_actions_access_key_id" {
  value       = aws_iam_access_key.github_actions.id
  description = "Add this to GitHub Secrets as AWS_ACCESS_KEY_ID"
}

output "github_actions_secret_access_key" {
  value       = aws_iam_access_key.github_actions.secret
  sensitive   = true
  description = "Add this to GitHub Secrets as AWS_SECRET_ACCESS_KEY"
}
