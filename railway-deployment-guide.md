# Railway Deployment Guide for Ihosi Healthcare Management System

## Overview
Railway is perfect for deploying your Next.js application with PostgreSQL. It offers:
- **Easy deployment** from GitHub
- **Automatic builds** and deployments
- **Built-in PostgreSQL** database
- **Environment variable management**
- **Custom domains** support
- **Reasonable pricing** ($5/month for hobby plan)

## Prerequisites
- GitHub repository with your code
- Railway account (free to start)
- Your application ready for production

## Step 1: Prepare Your Application

### 1.1 Update package.json Scripts
Ensure your `package.json` has the correct build scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 1.2 Create Railway Configuration
Create `railway.json` in your project root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 1.3 Environment Variables Setup
Create `.env.example` with all required variables:

```bash
# Database (Railway will provide this)
DATABASE_URL="postgresql://postgres:password@host:port/railway?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_secret

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Application Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.railway.app

# HIPAA Compliance - PHI Encryption
PHI_ENCRYPTION_KEY=your_32_byte_encryption_key_here_64_hex_characters
PHI_ENCRYPTION_SALT=healthcare-system-salt-change-in-production

# Session Security
SESSION_TIMEOUT_MINUTES=30
MAX_FAILED_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15

# Email Configuration (if using SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

## Step 2: Deploy to Railway

### 2.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Authorize Railway to access your repositories

### 2.2 Deploy Your Application
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `fullstack-healthcare` repository
4. Railway will automatically detect it's a Next.js app

### 2.3 Add PostgreSQL Database
1. In your project dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will create a PostgreSQL database
4. Copy the connection string from the database service

### 2.4 Configure Environment Variables
1. Go to your app service → "Variables" tab
2. Add all environment variables from your `.env.example`
3. Update `DATABASE_URL` with Railway's PostgreSQL connection string
4. Update `NEXT_PUBLIC_APP_URL` with your Railway app URL

## Step 3: Database Migration

### 3.1 Connect to Railway Database
Railway provides a connection string like:
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

### 3.2 Run Database Migration
You can run migrations in several ways:

#### Option A: Railway CLI (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run migrations
railway run npx prisma db push
railway run npx prisma db seed
```

#### Option B: Railway Console
1. Go to your database service
2. Click "Query" tab
3. Run your SQL migrations manually

#### Option C: Local Migration
```bash
# Set DATABASE_URL to Railway's connection string
export DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"

# Run migrations
npx prisma db push
npx prisma db seed
```

## Step 4: Configure Production Settings

### 4.1 Update Clerk for Production
1. Go to [clerk.com](https://clerk.com) dashboard
2. Create a new application for production
3. Update environment variables with production keys
4. Configure allowed origins:
   - `https://your-app.railway.app`
   - `https://your-custom-domain.com` (if using custom domain)

### 4.2 Update Next.js Configuration
Create/update `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  images: {
    domains: ['images.clerk.dev', 'img.clerk.com']
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
}

export default nextConfig
```

### 4.3 Update Prisma Schema for Production
Ensure your `prisma/schema.prisma` is optimized:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain
1. Go to your app service → "Settings" → "Domains"
2. Click "Custom Domain"
3. Add your domain (e.g., `ihosi.com`)
4. Follow Railway's DNS instructions

### 5.2 Update Environment Variables
Update `NEXT_PUBLIC_APP_URL` and Clerk settings with your custom domain.

## Step 6: Monitoring and Maintenance

### 6.1 Railway Dashboard
- Monitor app performance
- View logs and errors
- Check database metrics
- Manage environment variables

### 6.2 Health Checks
Railway automatically monitors your app health. Ensure your app responds to `/` endpoint.

### 6.3 Database Backups
Railway provides automatic backups for PostgreSQL:
- Daily backups included
- Point-in-time recovery available
- Manual backup downloads

## Step 7: Security Considerations

### 7.1 Environment Variables
- Never commit sensitive data to GitHub
- Use Railway's environment variable management
- Rotate keys regularly
- Use different keys for production

### 7.2 Database Security
- Railway PostgreSQL is secure by default
- SSL connections enabled
- Access restricted to your app
- Regular security updates

### 7.3 HIPAA Compliance
- Ensure Railway meets your compliance requirements
- Enable audit logging
- Use encrypted connections
- Regular security assessments

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs in Railway dashboard
# Common fixes:
# 1. Ensure all dependencies are in package.json
# 2. Check Node.js version compatibility
# 3. Verify build scripts are correct
```

#### Database Connection Issues
```bash
# Verify DATABASE_URL format
# Check if database service is running
# Ensure environment variables are set correctly
```

#### Environment Variable Issues
```bash
# Check Railway dashboard → Variables tab
# Ensure all required variables are set
# Verify variable names match your code
```

### Useful Commands

```bash
# Railway CLI commands
railway login
railway link
railway status
railway logs
railway run npm run db:push
railway run npx prisma studio

# Local development with Railway database
railway run npm run dev
```

## Cost Estimation

### Railway Pricing (as of 2024)
- **Hobby Plan**: $5/month
  - 1GB RAM
  - 1GB storage
  - 100GB bandwidth
  - PostgreSQL included

- **Pro Plan**: $20/month
  - 8GB RAM
  - 100GB storage
  - 1TB bandwidth
  - Multiple services

### Additional Costs
- **Custom Domain**: Free (you pay for domain registration)
- **SSL Certificate**: Free (Railway provides)
- **Database Backups**: Included
- **Monitoring**: Basic monitoring included

## Next Steps After Deployment

1. **Test thoroughly** - Verify all features work
2. **Set up monitoring** - Use Railway's built-in monitoring
3. **Configure backups** - Ensure database backups are working
4. **Update DNS** - If using custom domain
5. **Security audit** - Review security settings
6. **Performance optimization** - Monitor and optimize as needed

## Support Resources

- **Railway Documentation**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment

## Quick Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Railway account created
- [ ] Project deployed from GitHub
- [ ] PostgreSQL database added
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Clerk configured for production
- [ ] Custom domain added (optional)
- [ ] Health checks passing
- [ ] Application tested thoroughly
