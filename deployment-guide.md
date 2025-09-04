# Database Deployment Guide for Ihosi Healthcare Management System

## Current Setup
- **Local Docker PostgreSQL** on port 5433
- **Database**: healthcare_db
- **User**: healthcare_user
- **Password**: healthcare_pass

## Deployment Options

### 1. Railway (Recommended)
**Pros**: Easy setup, automatic backups, reasonable pricing
**Cons**: Limited free tier

**Steps**:
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → "Deploy from GitHub repo"
4. Add PostgreSQL service
5. Get connection string from Railway dashboard

**Pricing**: $5/month for 1GB storage, $0.10/GB additional

### 2. Supabase (PostgreSQL + Extras)
**Pros**: Free tier, built-in auth, real-time features
**Cons**: More complex than needed for basic PostgreSQL

**Steps**:
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string

**Pricing**: Free tier includes 500MB, $25/month for 8GB

### 3. Neon (Serverless PostgreSQL)
**Pros**: Serverless, auto-scaling, great for development
**Cons**: Newer service, less proven

**Steps**:
1. Go to [neon.tech](https://neon.tech)
2. Create account and project
3. Copy connection string from dashboard

**Pricing**: Free tier includes 3GB, $0.10/GB additional

### 4. AWS RDS (Enterprise)
**Pros**: Highly reliable, enterprise features
**Cons**: More complex setup, higher cost

**Steps**:
1. AWS Console → RDS → Create database
2. Choose PostgreSQL
3. Configure security groups
4. Get endpoint and credentials

**Pricing**: ~$15-30/month for small instance

## Migration Steps

### Step 1: Create Deployed Database
Choose one of the above options and create your database.

### Step 2: Update Environment Variables
Create `.env.local` file with your deployed database URL:

```bash
# Replace with your deployed database URL
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# Keep your existing Clerk and other settings
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZmFtb3VzLXdvb2Rjb2NrLTcxLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_TODd5TYPDO8FvMG9He8EuF54kFEBGLpq7UgUd9oWz3

# ... other existing variables
```

### Step 3: Run Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Push schema to deployed database
npx prisma db push

# Optional: Seed with initial data
npx prisma db seed
```

### Step 4: Test Connection
```bash
# Test database connection
npx prisma studio
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env.local` to version control
- Use different credentials for production
- Rotate passwords regularly

### 2. Database Security
- Enable SSL connections
- Use strong passwords
- Restrict IP access if possible
- Enable connection pooling

### 3. HIPAA Compliance
- Ensure your database provider is HIPAA compliant
- Enable encryption at rest
- Use encrypted connections
- Regular security audits

## Recommended Setup for Production

### Railway Configuration
```bash
# .env.local
DATABASE_URL="postgresql://postgres:your_strong_password@containers-us-west-xxx.railway.app:5432/railway?schema=public"

# Enable SSL
DATABASE_URL="postgresql://postgres:your_strong_password@containers-us-west-xxx.railway.app:5432/railway?schema=public&sslmode=require"
```

### Prisma Schema Updates
Add connection pooling and SSL configuration:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["connectionLimit"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations
}
```

## Backup Strategy

### 1. Automated Backups
Most cloud providers offer automated backups:
- **Railway**: Daily backups included
- **Supabase**: Point-in-time recovery
- **Neon**: Continuous backup

### 2. Manual Backups
```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql $DATABASE_URL < backup_file.sql
```

## Monitoring

### 1. Database Metrics
- Connection count
- Query performance
- Storage usage
- Error rates

### 2. Application Monitoring
- Database connection errors
- Query timeouts
- Failed migrations

## Cost Optimization

### 1. Connection Pooling
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

### 2. Query Optimization
- Use database indexes
- Optimize Prisma queries
- Implement caching where appropriate

## Next Steps

1. **Choose a provider** (Railway recommended)
2. **Create database** and get connection string
3. **Update environment variables**
4. **Run migrations**
5. **Test thoroughly**
6. **Set up monitoring**
7. **Configure backups**

## Support

If you encounter issues:
1. Check database provider documentation
2. Verify connection string format
3. Ensure firewall/security group settings
4. Check Prisma logs for detailed errors
