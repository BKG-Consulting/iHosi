#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 iHosi Doctor App Configuration Setup\n');

const questions = [
  {
    key: 'clerkPublishableKey',
    question: 'Enter your Clerk Publishable Key (pk_test_...): ',
    file: 'app.json',
    path: 'extra.clerkPublishableKey'
  },
  {
    key: 'apiBaseUrl',
    question: 'Enter your API Base URL (e.g., https://ihosi.com/api): ',
    file: 'src/config/constants.ts',
    path: 'API_CONFIG.BASE_URL'
  }
];

let config = {};

function askQuestion(index) {
  if (index >= questions.length) {
    updateConfigFiles();
    return;
  }

  const question = questions[index];
  rl.question(question.question, (answer) => {
    if (answer.trim()) {
      config[question.key] = answer.trim();
    }
    askQuestion(index + 1);
  });
}

function updateConfigFiles() {
  console.log('\n📝 Updating configuration files...\n');

  // Update app.json
  if (config.clerkPublishableKey) {
    try {
      const appJsonPath = path.join(__dirname, 'app.json');
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      appJson.extra.clerkPublishableKey = config.clerkPublishableKey;
      fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
      console.log('✅ Updated app.json with Clerk publishable key');
    } catch (error) {
      console.error('❌ Error updating app.json:', error.message);
    }
  }

  // Update constants.ts
  if (config.apiBaseUrl) {
    try {
      const constantsPath = path.join(__dirname, 'src/config/constants.ts');
      let constantsContent = fs.readFileSync(constantsPath, 'utf8');
      
      // Replace the BASE_URL
      constantsContent = constantsContent.replace(
        /BASE_URL:\s*'[^']*'/,
        `BASE_URL: '${config.apiBaseUrl}'`
      );
      
      fs.writeFileSync(constantsPath, constantsContent);
      console.log('✅ Updated constants.ts with API base URL');
    } catch (error) {
      console.error('❌ Error updating constants.ts:', error.message);
    }
  }

  console.log('\n🎉 Configuration setup complete!');
  console.log('\nNext steps:');
  console.log('1. Make sure your Android emulator is running');
  console.log('2. Run: npm run android');
  console.log('3. Test the login with your doctor credentials');
  
  rl.close();
}

// Start the configuration process
askQuestion(0);

