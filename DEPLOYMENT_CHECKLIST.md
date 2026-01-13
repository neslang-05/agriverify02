# Azure Deployment Checklist

Use this checklist to ensure a smooth deployment to Azure App Service.

## Pre-Deployment Setup

### 1. Azure Resources ✅

- [ ] Azure Web App Service created (`SeedAnalyser-Synergy`)
- [ ] App Service configured with Node.js 22 LTS
- [ ] Supabase project created and configured
- [ ] Azure Computer Vision resource created
- [ ] Azure Custom Vision project trained and published
- [ ] Azure OpenAI resource created with deployments

### 2. GitHub Repository Configuration ✅

- [ ] Repository secrets configured:
  - [ ] `AZUREAPPSERVICE_PUBLISHPROFILE_32A61EB814734D868B8018803A615D13`
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Azure App Service Settings ✅

Configure in Azure Portal → App Service → Configuration:

#### General Settings
- [ ] Runtime: Node 22 LTS
- [ ] Startup Command: `node server.js` or `sh startup.sh`
- [ ] Always On: Enabled
- [ ] HTTPS Only: Enabled

#### Application Settings (Environment Variables)
- [ ] Supabase credentials (2 variables)
- [ ] Azure Computer Vision credentials (2-4 variables)
- [ ] Azure Custom Vision credentials (5 variables)
- [ ] Azure OpenAI credentials (5 variables)
- [ ] Feature flags (4 variables)
- [ ] Confidence thresholds (2 variables)

**Quick Setup**: Copy settings from [.env.azure](.env.azure) file

## Deployment Process

### Manual Deployment (First Time)

```bash
# 1. Ensure you're on the prod branch
git checkout prod

# 2. Pull latest changes
git pull origin prod

# 3. Merge your changes
git merge main
# or
git merge dev

# 4. Push to trigger deployment
git push origin prod

# 5. Monitor deployment
# GitHub → Actions → Watch workflow progress
```

### Automatic Deployment (Ongoing)

Every push to the `prod` branch will automatically:
1. ✅ Build the application
2. ✅ Run tests
3. ✅ Create standalone package
4. ✅ Deploy to Azure
5. ✅ Generate deployment summary

## Post-Deployment Verification

### 1. Check Deployment Status ✅

- [ ] GitHub Actions workflow completed successfully
- [ ] Azure Portal shows deployment succeeded
- [ ] Application URL is accessible: https://seedanalyser-synergy.azurewebsites.net

### 2. Test Core Features ✅

- [ ] Home page loads correctly
- [ ] User registration/login works
- [ ] Image upload and verification works
- [ ] OCR extraction functions
- [ ] AI chat assistant responds
- [ ] Complaints system accessible
- [ ] Dashboard displays data

### 3. Verify Integrations ✅

- [ ] Supabase database connection working
- [ ] Azure Computer Vision OCR processing images
- [ ] Azure Custom Vision classifying seeds
- [ ] Azure OpenAI chat responding
- [ ] User authentication persists across pages

### 4. Monitor Performance ✅

- [ ] Check App Service metrics (CPU, Memory)
- [ ] Review Application Insights (if configured)
- [ ] Check response times for API calls
- [ ] Monitor error logs

## Troubleshooting Commands

### View Azure Logs

```bash
# Using Azure CLI
az webapp log tail --name SeedAnalyser-Synergy --resource-group <your-resource-group>

# Or in Azure Portal
# App Service → Monitoring → Log stream
```

### Check Environment Variables

```bash
# Using Azure CLI
az webapp config appsettings list --name SeedAnalyser-Synergy --resource-group <your-resource-group>
```

### Restart Application

```bash
# Using Azure CLI
az webapp restart --name SeedAnalyser-Synergy --resource-group <your-resource-group>

# Or in Azure Portal
# App Service → Overview → Restart
```

## Common Issues & Solutions

### Issue: Build fails in GitHub Actions

**Check:**
- [ ] GitHub secrets are correctly configured
- [ ] `package-lock.json` is committed
- [ ] All dependencies are in `package.json`

**Fix:**
```bash
# Regenerate package-lock.json
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push origin prod
```

### Issue: App crashes on startup

**Check:**
- [ ] Startup command is correct: `node server.js`
- [ ] Environment variables are set in Azure
- [ ] Next.js build completed successfully

**View logs:**
```
Azure Portal → App Service → Log stream
```

### Issue: API calls failing

**Check:**
- [ ] Azure resource endpoints are correct
- [ ] API keys are valid and not expired
- [ ] Network connectivity from Azure App Service
- [ ] API quotas haven't been exceeded

**Test API connectivity:**
```bash
# From App Service console
curl https://your-vision-endpoint.api.cognitive.microsoft.com/
```

### Issue: Environment variables not loading

**Fix:**
```
1. Azure Portal → App Service → Configuration
2. Verify all required variables are present
3. Click "Save" to restart the app
4. Check Log stream for confirmation
```

## Rollback Procedure

If deployment causes issues:

### Option 1: Quick Rollback (Azure Portal)
1. Go to: App Service → Deployment Center
2. Find the previous successful deployment
3. Click "Redeploy"

### Option 2: Git Rollback
```bash
# Revert the problematic commit
git revert HEAD
git push origin prod

# Or reset to a specific commit
git reset --hard <previous-commit-sha>
git push --force origin prod
```

### Option 3: Redeploy Previous Version
```bash
# GitHub → Actions → Select successful workflow
# Click "Re-run jobs"
```

## Performance Optimization

### After Initial Deployment

- [ ] Enable Application Insights for monitoring
- [ ] Configure Azure CDN for static assets (optional)
- [ ] Set up auto-scaling rules
- [ ] Configure backup schedules
- [ ] Review and optimize slow API calls
- [ ] Enable caching where appropriate

### Recommended Azure Settings for Production

```
Plan: P1V2 Premium or higher
Instances: 2+ (for high availability)
Always On: Enabled
ARR Affinity: Disabled (for better load distribution)
HTTPS Only: Enabled
TLS Version: 1.2 minimum
```

## Security Checklist

- [ ] HTTPS enforced (Azure default)
- [ ] API keys stored as App Settings (not in code)
- [ ] Supabase RLS policies configured
- [ ] CORS properly configured
- [ ] No sensitive data in logs
- [ ] Regular security updates applied
- [ ] Consider Azure Key Vault for secrets

## Monitoring & Alerts

### Set Up Alerts (Recommended)

- [ ] High CPU usage (>80%)
- [ ] High memory usage (>80%)
- [ ] HTTP 5xx errors
- [ ] Slow response times (>5s)
- [ ] Failed authentication attempts

### Regular Checks

- [ ] Review Application Insights weekly
- [ ] Check error logs daily
- [ ] Monitor API quota usage
- [ ] Review cost and billing

## Documentation References

- [Main Deployment Guide](AZURE_DEPLOYMENT.md)
- [Build Setup Guide](BUILD_SETUP.md)
- [Azure Vision Integration](AZURE_VISION_INTEGRATION.md)
- [Azure OCR Setup](AZURE_OCR_SETUP.md)

---

**Last Updated**: January 13, 2026
**Deployment URL**: https://seedanalyser-synergy.azurewebsites.net
**GitHub Workflow**: [.github/workflows/prod_seedanalyser-synergy.yml](../.github/workflows/prod_seedanalyser-synergy.yml)
