# Azure Static Web Apps Deployment Guide

Complete guide for deploying Infinity Brain to Azure Static Web Apps with automated CI/CD.

## Overview

Azure Static Web Apps provides:
- **Global CDN**: Fast content delivery worldwide
- **Free SSL/HTTPS**: Automatic certificate management
- **Custom Domains**: Use your own domain names
- **Staging Environments**: Preview deployments for pull requests
- **Serverless APIs**: Optional Azure Functions integration
- **Authentication**: Built-in authentication providers

## Prerequisites

1. **Azure Account**: Create a free account at [portal.azure.com](https://portal.azure.com)
2. **GitHub Account**: Repository hosting for CI/CD
3. **Azure CLI** (optional): For command-line deployment

## Setup Steps

### 1. Create Azure Static Web App

#### Via Azure Portal (Manual):

1. Go to [portal.azure.com](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Static Web Apps"
4. Click "Create"
5. Fill in the form:
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new or use existing
   - **Name**: Your app name (e.g., "infinity-brain")
   - **Region**: Choose closest to your users
   - **Deployment source**: Choose GitHub or Azure DevOps
6. Click "Review + create"
7. Click "Create"

#### Via Infinity Brain Interface (Recommended):

1. Navigate to the **Azure** tab in Infinity Brain
2. Enter your Azure configuration:
   - Subscription ID (find in Azure portal)
   - Resource Group name
   - Static Web App name
   - Azure region (e.g., "eastus", "westus2", "eastasia")
3. Click "Deploy to Azure Static Web Apps"
4. Wait for deployment to complete
5. Access your site at: `https://[your-app-name].azurestaticapps.net`

### 2. Configure GitHub Actions (Automated CI/CD)

#### Generate Workflow with Infinity Brain:

1. Navigate to **Azure** tab → **GitHub Actions** section
2. Click "Generate GitHub Actions Workflow"
3. Download the generated YAML file
4. In your repository, create the directory structure: `.github/workflows/`
5. Save the downloaded file as `azure-deploy.yml`
6. Commit and push to GitHub

#### Manual Workflow Setup:

See `.github/README.md` for a complete workflow template.

### 3. Configure Secrets

In your GitHub repository settings:

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add the following secrets:
   - **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Value**: Get from Azure portal → Your Static Web App → Manage deployment token

### 4. Verify Deployment

1. Push changes to your repository
2. Go to the "Actions" tab in GitHub
3. Watch the workflow run
4. Once complete, visit your site URL
5. Check the deployment history in Infinity Brain's Azure tab

## Configuration Options

### Environment Variables

Add environment variables in Azure portal:

1. Go to your Static Web App
2. Select "Configuration" in the left menu
3. Click "Application settings"
4. Add your variables (prefix with `VITE_` for Vite apps)
5. Save changes

### Custom Domains

1. In Azure portal, go to your Static Web App
2. Select "Custom domains"
3. Click "Add"
4. Follow the DNS configuration instructions
5. Wait for DNS propagation (can take 24-48 hours)

### Staging Environments

Azure automatically creates staging environments for pull requests:
- Each PR gets a unique URL
- Test changes before merging
- Staging environments are automatically cleaned up when PR is closed

## Pricing

**Free Tier** includes:
- 100 GB bandwidth per month
- 2 custom domains
- 500 MB storage
- Free SSL certificates
- Unlimited staging environments

**Standard Tier** adds:
- 100 GB bandwidth included
- Additional bandwidth available
- More custom domains
- Enhanced performance
- SLA guarantees

See [Azure pricing](https://azure.microsoft.com/en-us/pricing/details/app-service/static/) for current rates.

## Troubleshooting

### Deployment Fails

**Issue**: Workflow fails with authentication error
- **Solution**: Verify `AZURE_STATIC_WEB_APPS_API_TOKEN` secret is correct
- **Solution**: Regenerate token in Azure portal if expired

**Issue**: Build fails during workflow
- **Solution**: Check Node.js version compatibility (use Node 18+)
- **Solution**: Verify all dependencies are in `package.json`
- **Solution**: Review GitHub Actions logs for specific errors

### Site Not Loading

**Issue**: 404 errors after deployment
- **Solution**: Verify `output_location` in workflow is set to `"dist"` for Vite
- **Solution**: Check that build completed successfully
- **Solution**: Review build logs in Azure portal

**Issue**: Blank page loads
- **Solution**: Check browser console for JavaScript errors
- **Solution**: Verify environment variables are set correctly
- **Solution**: Ensure base path is configured correctly in Vite config

### Performance Issues

**Issue**: Slow loading times
- **Solution**: Enable CDN in Azure portal
- **Solution**: Optimize build output (code splitting, tree shaking)
- **Solution**: Choose Azure region closer to your users

## Best Practices

1. **Use GitHub Actions**: Automate deployments on every push
2. **Environment Variables**: Store sensitive data in Azure configuration, not in code
3. **Custom Domains**: Use custom domains for production sites
4. **Monitoring**: Enable Application Insights for performance monitoring
5. **Staging**: Test all changes in staging environments before merging
6. **Security**: Enable authentication if your app contains sensitive data
7. **Backup**: Keep deployment tokens secure and backed up
8. **Updates**: Regularly update dependencies and review security advisories

## Advanced Configuration

### Add Azure Functions API

1. Create `/api` directory in your repository
2. Add Azure Functions (Node.js)
3. Update workflow to include API deployment
4. Access at `https://[your-app].azurestaticapps.net/api/[function-name]`

### Custom Routing

Create `staticwebapp.config.json` in your repository root:

```json
{
  "routes": [
    {
      "route": "/profile",
      "allowedRoles": ["authenticated"]
    },
    {
      "route": "/admin/*",
      "allowedRoles": ["administrator"]
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif}", "/css/*"]
  }
}
```

### Authentication

Enable built-in authentication:

1. In Azure portal, go to Authentication
2. Add identity providers (GitHub, Twitter, etc.)
3. Configure allowed roles
4. Restrict routes by role

## Monitoring and Analytics

### Application Insights

1. Create Application Insights resource in Azure
2. Link to your Static Web App
3. View metrics:
   - Page views
   - Performance
   - User demographics
   - Error tracking

### Custom Analytics

Integrate with your preferred analytics:
- Google Analytics
- Mixpanel
- Amplitude
- Custom tracking solutions

## Migration from Other Platforms

### From Netlify:
- Export site configuration
- Update build commands in GitHub Actions
- Migrate environment variables to Azure
- Update DNS records to Azure

### From Vercel:
- Similar process to Netlify
- Update `vercel.json` settings to Azure config
- Migrate serverless functions to Azure Functions
- Update deployment webhooks

## Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [GitHub Actions for Azure](https://github.com/Azure/actions)
- [Azure CLI Documentation](https://docs.microsoft.com/en-us/cli/azure/)
- [Static Web Apps Pricing](https://azure.microsoft.com/en-us/pricing/details/app-service/static/)
- [Community Support](https://docs.microsoft.com/en-us/answers/topics/azure-static-web-apps.html)

## Support

For issues specific to Infinity Brain's Azure integration:
- Check the deployment history in the Azure tab
- Review error messages in deployment logs
- Consult the Azure troubleshooting guide above
- Use the Help Legend in the main interface

For Azure-specific issues:
- [Azure Support](https://azure.microsoft.com/en-us/support/)
- [Stack Overflow - Azure Tag](https://stackoverflow.com/questions/tagged/azure)
- [Microsoft Q&A](https://docs.microsoft.com/en-us/answers/)
