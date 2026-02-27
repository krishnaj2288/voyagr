# Voyagr — AWS Deployment & CI/CD Guide

> **Stack:** React SPA → S3 + CloudFront + Route53 + ACM + WAF  
> **CI/CD:** GitHub Actions → Auto-deploy on push

---

## Architecture Overview

```
Developer → GitHub → GitHub Actions
                          │
               ┌──────────┼──────────┐
           develop       main
               │           │
          Staging       Production
           S3 Bucket    S3 Bucket
               │           │
         CloudFront   CloudFront (WAF)
               │           │
        staging.voyagr.com  voyagr.com
```

---

## Prerequisites

| Tool | Min Version | Install |
|------|------------|---------|
| AWS CLI | v2.x | `brew install awscli` |
| Terraform | v1.5+ | `brew install terraform` |
| Node.js | v18+ | `brew install node` |
| Git | any | — |

---

## Part 1 — AWS Account Setup (One-Time)

### Step 1: Create AWS Account & IAM Admin

```bash
# 1. Sign up at https://aws.amazon.com

# 2. Create an admin IAM user (never use root)
aws iam create-user --user-name voyagr-admin
aws iam attach-user-policy \
  --user-name voyagr-admin \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# 3. Create access keys for local use
aws iam create-access-key --user-name voyagr-admin

# 4. Configure CLI
aws configure
# AWS Access Key ID: <your-key>
# AWS Secret Access Key: <your-secret>
# Default region: us-east-1
# Default output format: json
```

### Step 2: Create Terraform State Backend (Manual, One-Time)

```bash
# Create state bucket (versioned, encrypted)
aws s3api create-bucket \
  --bucket voyagr-terraform-state \
  --region us-east-1

aws s3api put-bucket-versioning \
  --bucket voyagr-terraform-state \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
  --bucket voyagr-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}
    }]
  }'

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name voyagr-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Step 3: Register Domain in Route53

```bash
# Register domain (or transfer existing)
# Do this via AWS Console: Route53 → Register Domain
# Or via CLI:
aws route53domains register-domain \
  --domain-name voyagr.com \
  --duration-in-years 1 \
  --admin-contact file://contact.json \
  --registrant-contact file://contact.json \
  --tech-contact file://contact.json \
  --privacy-protect-admin-contact \
  --privacy-protect-registrant-contact \
  --region us-east-1
```

---

## Part 2 — Infrastructure Provisioning (Terraform)

### Step 4: Initialize & Apply Terraform

```bash
cd infrastructure/

# Initialize (downloads providers, configures backend)
terraform init

# Preview what will be created
terraform plan -out=tfplan

# Review the plan, then apply
terraform apply tfplan

# ⏱ This takes ~15 min (ACM cert validation is the bottleneck)
```

**Resources created:**
- S3 bucket (prod + staging)
- CloudFront distributions (prod + staging)  
- ACM TLS certificate (us-east-1)
- Route53 DNS records
- WAF Web ACL (rate limiting + AWS managed rules)
- IAM user for GitHub Actions
- CloudWatch alarm

### Step 5: Capture Terraform Outputs

```bash
# Get all outputs
terraform output

# Get specific sensitive output
terraform output -raw github_actions_secret_access_key
```

Save these values — you'll add them to GitHub Secrets next.

---

## Part 3 — GitHub Repository Setup

### Step 6: Create GitHub Repository

```bash
# Initialize git and push
cd /path/to/voyagr
git init
git add .
git commit -m "feat: initial commit"

# Create repo on GitHub (or use CLI)
gh repo create voyagr --private --push --source=.

# Set up branches
git checkout -b develop
git push origin develop
```

### Step 7: Add GitHub Secrets

Go to: **GitHub Repo → Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Value (from Terraform output) |
|-------------|-------------------------------|
| `AWS_ACCESS_KEY_ID` | `terraform output github_actions_access_key_id` |
| `AWS_SECRET_ACCESS_KEY` | `terraform output -raw github_actions_secret_access_key` |
| `S3_BUCKET_NAME` | `terraform output s3_bucket_name` |
| `S3_BUCKET_STAGING` | `voyagr-website-staging` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `terraform output cloudfront_distribution_id` |
| `CLOUDFRONT_DISTRIBUTION_ID_STAGING` | *(staging distribution ID)* |

```bash
# Or set secrets via GitHub CLI:
gh secret set AWS_ACCESS_KEY_ID --body "AKIA..."
gh secret set AWS_SECRET_ACCESS_KEY --body "abc123..."
gh secret set S3_BUCKET_NAME --body "voyagr-website-prod"
gh secret set CLOUDFRONT_DISTRIBUTION_ID --body "E1234ABCDEF"
```

### Step 8: Configure Branch Protection

```bash
# Via GitHub CLI
gh api repos/:owner/voyagr/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["🧪 Test & Lint","🔨 Build"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}'
```

---

## Part 4 — Local Development

### Step 9: Run Locally

```bash
cd /path/to/voyagr

# Install dependencies
npm install

# Start development server (hot reload)
npm start
# Opens http://localhost:3000

# Build for production
npm run build

# Serve production build locally
npx serve -s build
```

---

## Part 5 — CI/CD Workflow in Action

### Workflow Triggers

| Event | Branch | Action |
|-------|--------|--------|
| Push | `develop` | Test → Build → Deploy to Staging |
| Push | `main` | Test → Build → Deploy to Production |
| Pull Request | `main` | Test → Build (no deploy) |

### Typical Developer Flow

```bash
# 1. Create feature branch
git checkout -b feat/price-alerts

# 2. Make changes, commit
git add .
git commit -m "feat: add price alert notifications"

# 3. Push to GitHub → opens PR
git push origin feat/price-alerts
gh pr create --base develop --title "feat: price alerts"

# 4. CI runs tests automatically on PR
# → GitHub Actions: Test ✅ Build ✅

# 5. Merge PR to develop → auto-deploys to staging
gh pr merge --squash

# 6. QA staging.voyagr.com, approve for production

# 7. Merge develop to main → auto-deploys to production
git checkout main
git merge develop
git push origin main
# → GitHub Actions: Test ✅ Build ✅ Deploy ✅
```

---

## Part 6 — Manual Deployment (Emergency)

```bash
# If CI/CD is unavailable, deploy manually:

# 1. Build
npm run build

# 2. Sync to S3
aws s3 sync build/ s3://voyagr-website-prod/ \
  --delete \
  --cache-control "no-cache" \
  --exclude "static/*"

aws s3 sync build/static/ s3://voyagr-website-prod/static/ \
  --cache-control "public, max-age=31536000, immutable"

# 3. Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id E1234ABCDEF \
  --paths "/*"
```

---

## Part 7 — Monitoring & Observability

### CloudWatch Dashboard

```bash
# Create dashboard
aws cloudwatch put-dashboard \
  --dashboard-name "Voyagr-Production" \
  --dashboard-body file://cloudwatch-dashboard.json
```

### Key Metrics to Monitor

| Metric | Namespace | Alert Threshold |
|--------|-----------|----------------|
| 4xx Error Rate | AWS/CloudFront | > 5% |
| 5xx Error Rate | AWS/CloudFront | > 1% |
| Requests | AWS/CloudFront | Anomaly |
| WAF Blocked Requests | AWS/WAFV2 | > 100/min |

### View Logs

```bash
# CloudFront access logs (enable in console first)
aws s3 ls s3://voyagr-cf-logs/ --recursive | tail -20

# View recent WAF blocked requests
aws wafv2 get-sampled-requests \
  --web-acl-arn "arn:aws:wafv2:us-east-1:123456789:global/webacl/voyagr-waf/abc" \
  --rule-metric-name "RateLimitMetric" \
  --scope CLOUDFRONT \
  --time-window "StartTime=$(date -u -d '1 hour ago' +%s),EndTime=$(date -u +%s)" \
  --max-items 100
```

---

## Part 8 — Cost Estimate

| Service | Usage | Est. Monthly |
|---------|-------|-------------|
| S3 Storage | 50MB site | $0.01 |
| S3 Requests | 100K PUT/GET | $0.05 |
| CloudFront | 10GB transfer | $0.85 |
| CloudFront Requests | 1M requests | $0.75 |
| Route53 | 1 hosted zone | $0.50 |
| ACM Certificate | 1 cert | Free |
| WAF | 1 ACL + 2 rules | $6.00 |
| **Total** | | **~$8–10/month** |

> Scales to millions of users — CloudFront caches aggressively.

---

## Part 9 — Rollback Procedure

### Rollback via S3 Versioning

```bash
# List previous versions
aws s3api list-object-versions \
  --bucket voyagr-website-prod \
  --prefix index.html

# Restore specific version
aws s3api copy-object \
  --bucket voyagr-website-prod \
  --copy-source "voyagr-website-prod/index.html?versionId=abc123" \
  --key index.html

# Invalidate CDN
aws cloudfront create-invalidation \
  --distribution-id E1234ABCDEF \
  --paths "/*"
```

### Rollback via GitHub

```bash
# Find previous good commit
git log --oneline main | head -10

# Revert to previous commit
git revert HEAD --no-edit
git push origin main
# → CI/CD automatically re-deploys the reverted version
```

---

## Part 10 — Security Checklist

- [x] S3 bucket is private (no public access)
- [x] CloudFront uses HTTPS only (TLS 1.2+)
- [x] ACM certificate auto-renews
- [x] WAF rate limiting enabled
- [x] AWS Managed Rules active
- [x] IAM user has least-privilege (S3 + CF only)
- [x] Terraform state encrypted in S3
- [x] No AWS credentials in code (GitHub Secrets only)
- [x] Branch protection requires PR reviews
- [x] CloudWatch alarms for error spikes

---

## Quick Reference

```bash
# Deploy to staging manually
git push origin develop

# Deploy to production
git push origin main

# Check deployment status
gh run list --repo your-org/voyagr

# View live logs
gh run watch

# Terraform: preview infrastructure changes
cd infrastructure && terraform plan

# Emergency cache clear
aws cloudfront create-invalidation \
  --distribution-id $CF_ID --paths "/*"
```
