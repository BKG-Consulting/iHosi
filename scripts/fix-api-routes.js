#!/usr/bin/env node

/**
 * Script to fix Next.js 15 API route parameter types
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/api/service-templates/[id]/route.ts',
  'app/api/service-bundles/[id]/route.ts',
  'app/api/services/[id]/route.ts',
  'app/api/departments/[id]/resources/route.ts',
  'app/api/departments/[id]/actions/route.ts',
  'app/api/departments/[id]/patient-flow/route.ts',
  'app/api/departments/[id]/analytics/route.ts'
];

console.log('🔧 Fixing Next.js 15 API route parameter types...\n');

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`📝 Fixing ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix parameter type
    content = content.replace(
      /{ params }: { params: { id: string } }/g,
      '{ params }: { params: Promise<{ id: string }> }'
    );
    
    // Fix parameter usage - need to await params
    content = content.replace(
      /params\.id/g,
      '(await params).id'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log('\n🎉 All API routes fixed for Next.js 15 compatibility!');
console.log('\n📋 Summary of changes:');
console.log('- Updated parameter types to Promise<{ id: string }>');
console.log('- Added await for params access');
console.log('- Fixed Next.js 15 compatibility issues');
