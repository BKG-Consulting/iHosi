#!/usr/bin/env node

/**
 * Railway Deployment Helper Script for Ihosi Healthcare Management System
 * 
 * This script helps prepare and deploy your Next.js app to Railway
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Ihosi Healthcare Management System - Railway Deployment Helper\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'next.config.mjs',
  'prisma/schema.prisma',
  'railway.json'
];

console.log('📋 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

console.log('\n🎯 Railway Deployment Steps:');
console.log('1. Push your code to GitHub');
console.log('2. Go to https://railway.app');
console.log('3. Sign up with GitHub');
console.log('4. Click "New Project" → "Deploy from GitHub repo"');
console.log('5. Select your repository');
console.log('6. Add PostgreSQL database service');
console.log('7. Configure environment variables');
console.log('8. Run database migrations');

console.log('\n🔧 Environment Variables to Set in Railway:');
console.log('Required variables:');
console.log('- DATABASE_URL (Railway will provide this)');
console.log('- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
console.log('- CLERK_SECRET_KEY');
console.log('- NEXT_PUBLIC_APP_URL');
console.log('- PHI_ENCRYPTION_KEY');
console.log('- PHI_ENCRYPTION_SALT');

console.log('\n📝 Production Environment Variables Template:');
console.log('Copy this to Railway dashboard → Variables:');
console.log(`
DATABASE_URL=postgresql://postgres:password@host:port/railway?schema=public
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
PHI_ENCRYPTION_KEY=your_32_byte_encryption_key_here_64_hex_characters
PHI_ENCRYPTION_SALT=healthcare-system-salt-change-in-production
SESSION_TIMEOUT_MINUTES=30
MAX_FAILED_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
`);

console.log('\n🗄️  Database Migration Commands:');
console.log('After deployment, run these in Railway console:');
console.log('1. railway run npx prisma generate');
console.log('2. railway run npx prisma db push');
console.log('3. railway run npx prisma db seed (optional)');

console.log('\n🔐 Clerk Production Setup:');
console.log('1. Go to https://clerk.com dashboard');
console.log('2. Create new application for production');
console.log('3. Update allowed origins:');
console.log('   - https://your-app.railway.app');
console.log('   - https://your-custom-domain.com (if using custom domain)');
console.log('4. Copy production keys to Railway environment variables');

console.log('\n🌐 Custom Domain Setup (Optional):');
console.log('1. In Railway dashboard → Settings → Domains');
console.log('2. Add custom domain');
console.log('3. Update DNS records as instructed');
console.log('4. Update NEXT_PUBLIC_APP_URL and Clerk settings');

console.log('\n📊 Railway Pricing:');
console.log('- Hobby Plan: $5/month (1GB RAM, 1GB storage, PostgreSQL included)');
console.log('- Pro Plan: $20/month (8GB RAM, 100GB storage)');
console.log('- Custom domains: Free');
console.log('- SSL certificates: Free');

console.log('\n🛡️  Security Checklist:');
console.log('✅ Use production Clerk keys');
console.log('✅ Enable HTTPS (Railway does this automatically)');
console.log('✅ Use strong encryption keys');
console.log('✅ Restrict database access');
console.log('✅ Regular security updates');

console.log('\n📞 Need Help?');
console.log('- Railway Documentation: https://docs.railway.app');
console.log('- Railway Discord: https://discord.gg/railway');
console.log('- Check railway-deployment-guide.md for detailed instructions');

console.log('\n🎯 Quick Commands After Deployment:');
console.log('railway login                    # Login to Railway CLI');
console.log('railway link                     # Link to your project');
console.log('railway run npm run db:push      # Run database migrations');
console.log('railway run npx prisma studio    # Open database studio');
console.log('railway logs                     # View application logs');

console.log('\n✨ Your app will be available at: https://your-app.railway.app');
console.log('🚀 Happy deploying!');
