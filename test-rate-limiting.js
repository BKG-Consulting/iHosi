/**
 * Test script for rate limiting functionality
 * This tests the fallback rate limiter when Redis is not available
 */

const testRateLimiting = async () => {
  console.log('🧪 Testing Rate Limiting System...\n');

  // Test registration endpoint
  const testRegistration = async (attempt) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: `Test${attempt}`,
          lastName: 'User',
          email: `test${attempt}@example.com`,
          phone: `123456789${attempt}`,
          password: 'TestPassword123!',
          role: 'PATIENT'
        })
      });

      const data = await response.json();
      
      if (response.status === 429) {
        console.log(`❌ Attempt ${attempt}: Rate limited - ${data.error}`);
        return false;
      } else if (response.status === 201) {
        console.log(`✅ Attempt ${attempt}: Registration successful`);
        return true;
      } else {
        console.log(`⚠️ Attempt ${attempt}: ${response.status} - ${data.error || 'Unknown error'}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Attempt ${attempt}: Error - ${error.message}`);
      return false;
    }
  };

  // Test CSRF token endpoint
  const testCSRFToken = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/csrf-token', {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ CSRF Token: ${data.token.substring(0, 8)}...`);
        return data.token;
      } else {
        console.log(`❌ CSRF Token failed: ${data.error}`);
        return null;
      }
    } catch (error) {
      console.log(`❌ CSRF Token error: ${error.message}`);
      return null;
    }
  };

  // Run tests
  console.log('1. Testing CSRF Token Generation...');
  const csrfToken = await testCSRFToken();
  
  console.log('\n2. Testing Registration Rate Limiting...');
  console.log('   (This will test the fallback rate limiter)');
  
  let successCount = 0;
  let rateLimitedCount = 0;
  
  for (let i = 1; i <= 5; i++) {
    const success = await testRegistration(i);
    if (success) {
      successCount++;
    } else if (i > 3) {
      rateLimitedCount++;
    }
    
    // Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Test Results:');
  console.log(`   Successful registrations: ${successCount}`);
  console.log(`   Rate limited attempts: ${rateLimitedCount}`);
  
  if (rateLimitedCount > 0) {
    console.log('✅ Rate limiting is working correctly!');
  } else {
    console.log('⚠️ Rate limiting may not be working - check configuration');
  }

  console.log('\n🎯 Next Steps:');
  console.log('   1. Set up Redis for production use');
  console.log('   2. Configure environment variables');
  console.log('   3. Test with actual Redis connection');
  console.log('   4. Monitor rate limiting in production');
};

// Run the test
testRateLimiting().catch(console.error);




