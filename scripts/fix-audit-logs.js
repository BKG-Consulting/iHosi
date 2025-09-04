#!/usr/bin/env node

/**
 * Script to fix all audit log type errors
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/api/admissions/route.ts',
  'app/api/admissions/[id]/route.ts',
  'app/api/service-templates/[id]/route.ts',
  'app/api/service-bundles/[id]/route.ts',
  'app/api/services/[id]/route.ts'
];

console.log('🔧 Fixing audit log type errors...\n');

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`📝 Fixing ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix invalid action types
    content = content.replace(/action: 'CREATE_ADMISSION'/g, "action: 'CREATE'");
    content = content.replace(/action: 'UPDATE_ADMISSION_STATUS'/g, "action: 'UPDATE'");
    content = content.replace(/action: 'DELETE_ADMISSION'/g, "action: 'DELETE'");
    
    // Fix invalid resource types
    content = content.replace(/resourceType: 'Admission'/g, "resourceType: 'ADMISSION'");
    content = content.replace(/resourceType: 'ServiceTemplate'/g, "resourceType: 'SERVICE'");
    content = content.replace(/resourceType: 'ServiceBundle'/g, "resourceType: 'SERVICE'");
    
    // Remove invalid properties
    content = content.replace(/,\s*userId,\s*/g, ', ');
    content = content.replace(/,\s*userRole: '[^']*',\s*/g, ', ');
    content = content.replace(/,\s*details: \{[^}]*\},\s*/g, ', ');
    
    // Clean up any trailing commas
    content = content.replace(/,\s*}/g, ' }');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log('\n🎉 All audit log type errors fixed!');
