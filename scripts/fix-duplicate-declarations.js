#!/usr/bin/env node

/**
 * Script to fix duplicate const { id } = await params; declarations
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

console.log('🔧 Fixing duplicate const { id } = await params; declarations...\n');

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`📝 Fixing ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove duplicate const { id } = await params; declarations
    // This regex matches the pattern and removes duplicates
    content = content.replace(
      /(\s*const { id } = await params;\s*\n\s*const { id } = await params;\s*)/g,
      '\n    const { id } = await params;\n'
    );
    
    // Also fix any remaining (await params).id references
    content = content.replace(/\(await params\)\.id/g, 'id');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log('\n🎉 All duplicate declarations fixed!');
