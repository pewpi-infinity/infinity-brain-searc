# GitHub Actions CI/CD Workflow for Azure Static Web Apps

This directory contains GitHub Actions workflow files for automated continuous integration and deployment.

## Quick Setup

1. Generate a workflow using the Azure tab in Infinity Brain
2. Save the generated file as `.github/workflows/azure-deploy.yml`
3. Configure the following secrets in your GitHub repository settings:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN` - Your Azure deployment token
   - Any other environment-specific secrets

## Workflow Features

The generated workflows include:

- **Automated Building**: Builds your React + Vite application on every push
- **Testing**: Runs test suites before deployment
- **Branch-Specific Deployments**: Different configurations for main/staging branches
- **Artifact Caching**: Speeds up builds by caching node_modules
- **Azure Integration**: Automatically deploys to Azure Static Web Apps
- **Environment Variables**: Proper handling of build-time environment variables
- **PR Previews**: Creates preview deployments for pull requests

## Manual Workflow Template

If you prefer to create the workflow manually, here's a basic template:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NODE_ENV: production

      - name: Deploy to Azure Static Web Apps
        id: deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "dist"

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

## Customization

You can customize the workflow by:

- Adding additional build steps
- Running tests before deployment
- Adding environment-specific configurations
- Integrating with other services (Slack notifications, etc.)
- Adding security scanning steps

## Troubleshooting

### Deployment fails with authentication error
- Verify your `AZURE_STATIC_WEB_APPS_API_TOKEN` secret is correctly set
- Check that the token hasn't expired
- Ensure the token has proper permissions

### Build fails
- Check that all dependencies are listed in `package.json`
- Verify Node.js version compatibility
- Review build logs for specific errors

### Environment variables not working
- Ensure environment variables are prefixed correctly for Vite (VITE_)
- Add them to the workflow file under the `env:` section
- Check that they're accessible during build time

## Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## Support

For issues with the Infinity Brain workflow generator, use the Azure tab's help section or consult the deployment history for error messages.
