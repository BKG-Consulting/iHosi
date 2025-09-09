#!/usr/bin/env node

/**
 * Test Notification System
 * This script tests the notification API endpoint
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const testNotifications = async () => {
  console.log('🧪 Testing Notification System');
  console.log('==============================\n');

  try {
    // Test the notification API
    const response = await fetch('http://localhost:3000/api/notifications', {
      method: 'GET',
      headers: {
        'Cookie': 'auth-token=your-test-token-here' // This would need a real token
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Notification API Response:');
      console.log(`   - Notifications: ${data.notifications.length}`);
      console.log(`   - Connected: ${data.isConnected}`);
      console.log(`   - Message: ${data.message}`);
      
      if (data.notifications.length > 0) {
        console.log('\n📋 Notifications:');
        data.notifications.forEach((notif, index) => {
          console.log(`   ${index + 1}. ${notif.title}: ${notif.message}`);
        });
      } else {
        console.log('\n💡 No notifications found. This could mean:');
        console.log('   - No new appointments since last check');
        console.log('   - User is not authenticated');
        console.log('   - No PENDING appointments for this doctor');
      }
    } else {
      console.log('❌ API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testNotifications();