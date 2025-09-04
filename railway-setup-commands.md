# Railway Database Setup Commands

## After setting up environment variables, run these commands:

### 1. Connect to Railway CLI (if not already connected)
```bash
railway login
railway link
```

### 2. Run Database Migrations
```bash
railway run npx prisma db push
```

### 3. Generate Prisma Client
```bash
railway run npx prisma generate
```

### 4. Seed Database (Optional)
```bash
railway run npx prisma db seed
```

### 5. Verify Database Connection
```bash
railway run npx prisma studio
```

## Alternative: Use Railway Dashboard

1. Go to your Railway project
2. Click on your service
3. Go to "Deployments" tab
4. Click on the latest deployment
5. Go to "Logs" tab to see if migrations ran successfully

## Database Connection String Format

Railway provides the DATABASE_URL automatically, but if you need to set it manually:

```
postgresql://postgres:password@host:port/database?schema=public
```

Example:
```
postgresql://postgres:abc123@containers-us-west-123.railway.app:5432/railway?schema=public
```
