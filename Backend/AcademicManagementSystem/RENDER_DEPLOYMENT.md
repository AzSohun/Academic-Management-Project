# Render Deployment Guide for AMS Backend

## Prerequisites
1. GitHub account with your repository pushed
2. Render account (https://render.com)
3. PostgreSQL database (either Render or external)
4. Cloudinary account for file uploads

## Step-by-Step Deployment

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2. Create PostgreSQL Database on Render
- Go to Render Dashboard → New → PostgreSQL
- Choose a name: `ams-db`
- Region: Choose closest to you
- PostgreSQL Version: 15+
- Copy the connection string after it's created

### 3. Deploy the Application

#### Option A: Using render.yaml (Recommended)
1. Go to Render Dashboard → New → Blueprint
2. Connect your GitHub repository
3. Render will detect and deploy using render.yaml
4. Review and confirm settings

#### Option B: Manual Deployment
1. Go to Render Dashboard → New → Web Service
2. Connect GitHub repository
3. Choose repository
4. Settings:
   - **Name**: `ams-api`
   - **Environment**: Docker
   - **Region**: oregon (or your choice)
   - **Branch**: main
   - **Dockerfile**: ./Dockerfile (if in root) or ./AcademicManagementSystem/Dockerfile

### 4. Configure Environment Variables

Add these to your Render service (Settings → Environment Variables):

```
ASPNETCORE_ENVIRONMENT=Production
PORT=8080

# Database Connection (from PostgreSQL service)
DATABASE_URL=postgresql://user:password@hostname:5432/database_name

# JWT Configuration (generate a strong secret key)
JWT_SECRET_KEY=your-very-long-secret-key-here

# Frontend URL (your deployed frontend)
FRONTEND_URL=https://your-frontend-domain.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 5. Update appsettings.Production.json

Modify [appsettings.Production.json](appsettings.Production.json) to read from environment variables:

```csharp
// In Program.cs, this is already configured to read:
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") ?? 
                      builder.Configuration.GetConnectionString("DefaultConnection");
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? 
               builder.Configuration["Jwt:SecretKey"];
```

### 6. Database Migrations

After first deployment, run migrations via Render Shell:
```bash
# Connect to your service shell in Render Dashboard
dotnet ef database update --project AcademicManagementSystem.csproj
```

Or add a migration step to your deployment:
Create a `.render/startup.sh`:
```bash
#!/bin/bash
dotnet ef database update --project AcademicManagementSystem.csproj
dotnet AcademicManagementSystem.dll
```

Update Render settings to use this script.

## Troubleshooting

### Port Issues
- Render assigns a dynamic PORT environment variable
- Our Dockerfile uses: `ENV ASPNETCORE_URLS=http://+:${PORT:-8080}`
- This automatically uses Render's PORT or defaults to 8080

### HTTPS/HTTPS Redirection
- Set `IsBehindProxy=true` in appsettings.Production.json
- This prevents double-redirect issues when behind Render's proxy

### Database Connection
- Ensure database URL format: `postgresql://user:password@host:port/database`
- Connection pooling is configured via EntityFrameworkCore

### CORS Issues
- Update `FRONTEND_URL` environment variable with your frontend domain
- Multiple URLs can be separated by semicolons: `https://app.com;https://www.app.com`

### Deployment Logs
- View logs in Render Dashboard → Logs
- Check for missing environment variables
- Verify Docker build succeeds

## Monitoring

1. **Logs**: Dashboard → Logs tab
2. **Metrics**: Dashboard → Metrics (if on paid plan)
3. **Health Checks**: Configure health endpoint in future updates

## Redeploy

Push to your GitHub repository and Render will automatically redeploy (if autoDeploy is enabled in render.yaml).

Manual redeploy: Dashboard → Manual Deploy → Deploy Latest Commit

## Security Notes

- Never commit secrets to GitHub
- Always use environment variables for sensitive data
- Regenerate `JWT_SECRET_KEY` in production
- Use strong passwords for database and API keys
- Enable HTTPS only (Render handles this)
