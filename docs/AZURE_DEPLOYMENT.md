# Azure Deployment Guide

## Overview

This Next.js application is configured for deployment to Azure Web App Service using GitHub Actions. The workflow automatically builds and deploys when code is pushed to the `prod` branch.

## Azure Web App Configuration

### App Service Settings

1. **Runtime Stack**: Node 22 LTS
2. **Build Configuration**: Next.js standalone output
3. **Startup Command**: `node server.js`

### Required Application Settings

Configure these in Azure Portal → App Service → Configuration → Application settings:

#### Supabase (Database & Auth)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Azure Computer Vision (OCR)
```
AZURE_COMPUTER_VISION_ENDPOINT=https://your-region.api.cognitive.microsoft.com/
AZURE_COMPUTER_VISION_KEY=your-key
AZURE_EDGE_VISION_ENDPOINT=https://your-region.api.cognitive.microsoft.com/
AZURE_EDGE_VISION_KEY=your-key
```

#### Azure Custom Vision (Classification)
```
AZURE_CUSTOM_VISION_ENDPOINT=https://your-region.api.cognitive.microsoft.com/
AZURE_CUSTOM_VISION_PREDICTION_KEY=your-key
AZURE_CUSTOM_VISION_PROJECT_ID=your-project-id
AZURE_CUSTOM_VISION_ITERATION_NAME=your-iteration-name
AZURE_CUSTOM_VISION_PREDICTION_URL=https://your-region.api.cognitive.microsoft.com/customvision/v3.0/Prediction/your-project-id/classify/iterations/your-iteration-name/image
```

#### Azure OpenAI (AI Features)
```
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-5-mini
AZURE_OPENAI_API_VERSION=2024-02-15-preview
ENABLE_AZURE_OPENAI_CHAT=true
```

#### Feature Flags
```
ENABLE_AZURE_VISION=true
ENABLE_VISION_CACHE=true
ENABLE_OCR_VERIFICATION=true
VISION_GENUINE_THRESHOLD=0.85
VISION_SUSPICIOUS_THRESHOLD=0.50
```

## GitHub Repository Secrets

Configure these in GitHub Repository → Settings → Secrets and variables → Actions:

### Required Secrets

1. **AZUREAPPSERVICE_PUBLISHPROFILE_32A61EB814734D868B8018803A615D13**
   - Download from Azure Portal → App Service → Get publish profile
   - Paste the entire XML content as the secret value

2. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Needed during build for client-side code

3. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous key
   - Needed during build for client-side code

### How to Add GitHub Secrets

```bash
# Navigate to your repository on GitHub
# Go to Settings → Secrets and variables → Actions → New repository secret
```

For each secret:
1. Click "New repository secret"
2. Enter the name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
3. Paste the value
4. Click "Add secret"

## Deployment Workflow

The GitHub Actions workflow (`.github/workflows/prod_seedanalyser-synergy.yml`) performs these steps:

### Build Job
1. ✅ Checkout code from `prod` branch
2. ✅ Set up Node.js 22.x with npm cache
3. ✅ Install dependencies with `npm ci`
4. ✅ Build Next.js with environment variables
5. ✅ Run tests (continues on error)
6. ✅ Prepare standalone deployment package
7. ✅ Upload artifact for deployment

### Deploy Job
1. ✅ Download build artifact
2. ✅ Deploy to Azure Web App using publish profile
3. ✅ Generate deployment summary

## Manual Deployment

To trigger a manual deployment:

1. Go to GitHub → Actions → "Build and deploy Node.js app to Azure Web App"
2. Click "Run workflow"
3. Select the `prod` branch
4. Click "Run workflow"

## Verifying Deployment

### Check Deployment Status

1. **GitHub Actions**: Monitor the workflow progress
2. **Azure Portal**: App Service → Deployment Center → Logs
3. **Application URL**: Visit https://seedanalyser-synergy.azurewebsites.net

### Health Check Endpoints

```bash
# Check if app is running
curl https://seedanalyser-synergy.azurewebsites.net

# Check API edge functions
curl https://seedanalyser-synergy.azurewebsites.net/api/edge/validate-image
```

## Troubleshooting

### Build Failures

**Issue**: "Missing Supabase environment variables"
```bash
# Solution: Verify GitHub secrets are set correctly
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Issue**: "npm ci failed"
```bash
# Solution: Ensure package-lock.json is committed
git add package-lock.json
git commit -m "Add package-lock.json"
git push origin prod
```

### Deployment Failures

**Issue**: "Startup Command Failed"
```bash
# Solution: Verify Azure App Service startup command
# Should be: node server.js
# Check in Azure Portal → Configuration → General settings
```

**Issue**: "Application Crashes on Startup"
```bash
# Solution: Check environment variables in Azure
# Verify all required variables are set
# Check App Service → Log stream for errors
```

### Runtime Issues

**Issue**: "Cannot connect to Supabase"
```bash
# Solution: Verify Supabase credentials in Azure App Settings
# Check network connectivity from Azure
```

**Issue**: "Azure Vision/OpenAI API errors"
```bash
# Solution: Verify Azure resource endpoints and keys
# Check Azure resource region matches endpoint
# Verify API quotas haven't been exceeded
```

## Monitoring & Logs

### View Logs in Azure Portal

1. App Service → Monitoring → Log stream
2. App Service → Monitoring → Application Insights (if configured)
3. App Service → Deployment Center → Logs

### Enable Application Insights (Recommended)

```bash
# In Azure Portal
1. Go to App Service → Application Insights
2. Click "Turn on Application Insights"
3. Create new or link existing resource
4. Select "Node.js" as framework
```

## CI/CD Best Practices

### Branch Strategy

- `main` or `dev`: Development branch
- `prod`: Production branch (triggers deployment)

### Pre-deployment Checklist

- [ ] All tests passing locally
- [ ] Environment variables configured in Azure
- [ ] GitHub secrets properly set
- [ ] Build succeeds with `npm run build`
- [ ] No security vulnerabilities (`npm audit`)

### Rollback Procedure

If deployment fails or issues are found:

1. **Quick Rollback** (Azure Portal):
   - App Service → Deployment Center
   - Select previous successful deployment
   - Click "Redeploy"

2. **Git Rollback**:
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push origin prod
   ```

## Performance Optimization

### Azure App Service Settings

```
# General Settings
Platform: Linux
Node Version: 22 LTS
Always On: Enabled (prevents cold starts)

# Scale Up
Tier: B1 or higher (for production)

# Scale Out
Instance Count: 2+ (for high availability)
```

### Next.js Optimizations

The application is configured with:
- ✅ Standalone output mode (smaller deployment)
- ✅ Edge runtime for validation API
- ✅ Dynamic routes for auth-protected pages
- ✅ Image optimization (Next.js built-in)

## Security Considerations

### Secrets Management

- ❌ Never commit `.env.local` to git
- ✅ Use Azure Key Vault for sensitive credentials (optional)
- ✅ Rotate API keys regularly
- ✅ Use Azure Managed Identity when possible

### Network Security

- Configure Azure App Service IP restrictions if needed
- Enable HTTPS only (enforced by Azure by default)
- Use Azure Front Door or CDN for additional protection

## Cost Optimization

### Recommended Azure Resources

**Development**:
- App Service: B1 Basic ($13/month)
- Supabase: Free tier
- Azure Cognitive Services: Free tier (5K transactions/month)

**Production**:
- App Service: P1V2 Premium ($73/month)
- Supabase: Pro tier ($25/month)
- Azure Cognitive Services: S1 tier (10 transactions/sec)

## Support & Documentation

- [Azure Web Apps Deploy Action](https://github.com/Azure/webapps-deploy)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- Project Documentation: [docs/](../docs/)

## Contact

For deployment issues or questions, check:
1. GitHub Actions workflow logs
2. Azure App Service logs
3. Project documentation in [docs/](../docs/)
