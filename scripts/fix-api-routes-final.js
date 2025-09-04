#!/usr/bin/env node

/**
 * Final comprehensive fix for Next.js 15 API route parameter types
 * This version properly extracts params at function level and fixes all usage
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

console.log('🔧 Final comprehensive fix for Next.js 15 API route parameter types...\n');

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`📝 Fixing ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix parameter type
    content = content.replace(
      /{ params }: { params: { id: string } }/g,
      '{ params }: { params: Promise<{ id: string }> }'
    );
    
    // Extract params at the beginning of each function
    content = content.replace(
      /(export async function \w+\(\s*[^)]*\)\s*{[\s\S]*?)(const { userId } = await auth\(\);)/g,
      (match, beforeAuth, authLine) => {
        // Add params extraction right after auth
        return beforeAuth + authLine + '\n\n    const { id } = await params;';
      }
    );
    
    // Replace all instances of (await params).id with just id
    content = content.replace(/\(await params\)\.id/g, 'id');
    
    // Replace any remaining params.id with id
    content = content.replace(/params\.id/g, 'id');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log('\n🎉 All API routes comprehensively fixed for Next.js 15 compatibility!');
console.log('\n📋 Summary of changes:');
console.log('- Updated parameter types to Promise<{ id: string }>');
console.log('- Added params extraction at function level');
console.log('- Replaced all (await params).id and params.id with id variable');
console.log('- Fixed Next.js 15 compatibility issues');
