#!/usr/bin/env node

/**
 * Database Migration Script for Ihosi Healthcare Management System
 * 
 * This script helps migrate from local Docker PostgreSQL to deployed PostgreSQL
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Ihosi Healthcare Management System - Database Migration Script\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file from env.example...');
  
  if (fs.existsSync(envExamplePath)) {
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file');
  } else {
    console.log('❌ env.example not found. Please create .env.local manually.');
    process.exit(1);
  }
}

console.log('\n📋 Database Migration Steps:');
console.log('1. Choose a PostgreSQL provider:');
console.log('   - Railway (Recommended): https://railway.app');
console.log('   - Supabase: https://supabase.com');
console.log('   - Neon: https://neon.tech');
console.log('   - AWS RDS: https://aws.amazon.com/rds/');

console.log('\n2. Create your database and get the connection string');
console.log('   Format: postgresql://username:password@host:port/database?schema=public');

console.log('\n3. Update your .env.local file with the new DATABASE_URL');

console.log('\n4. Run the following commands:');
console.log('   npx prisma generate');
console.log('   npx prisma db push');
console.log('   npx prisma db seed (optional)');

console.log('\n5. Test your connection:');
console.log('   npx prisma studio');

console.log('\n🔧 Current Database Configuration:');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
  
  if (dbUrlMatch) {
    const dbUrl = dbUrlMatch[1];
    if (dbUrl.includes('localhost:5433')) {
      console.log('📍 Currently using: Local Docker PostgreSQL');
      console.log('🔗 Connection: ' + dbUrl);
      console.log('\n⚠️  You need to update DATABASE_URL in .env.local to your deployed database');
    } else {
      console.log('📍 Currently using: Deployed PostgreSQL');
      console.log('🔗 Connection: ' + dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    }
  } else {
    console.log('❌ DATABASE_URL not found in .env.local');
  }
} catch (error) {
  console.log('❌ Error reading .env.local:', error.message);
}

console.log('\n🛡️  Security Checklist:');
console.log('✅ Use strong passwords');
console.log('✅ Enable SSL connections');
console.log('✅ Restrict database access');
console.log('✅ Regular backups');
console.log('✅ Monitor connection logs');

console.log('\n📞 Need Help?');
console.log('- Check the deployment-guide.md file');
console.log('- Verify your database provider documentation');
console.log('- Test connection with: npx prisma studio');

console.log('\n🎯 Quick Commands:');
console.log('npm run db:generate  # Generate Prisma client');
console.log('npm run db:push      # Push schema to database');
console.log('npm run db:studio    # Open Prisma Studio');
console.log('npm run db:seed      # Seed database with sample data');
