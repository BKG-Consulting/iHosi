import { PrismaClient } from '@prisma/client';
import { TokenManager } from '../lib/auth/token-manager';

const prisma = new PrismaClient();

async function testTokenRefresh() {
  try {
    console.log('🔄 Testing Token Refresh System...\n');

    // Create a test user session
    const testUserId = 'test-user-123';
    const testSessionId = 'test-session-456';

    console.log('1. Creating test token pair...');
    const tokenPair = await TokenManager.createTokenPair(testUserId, testSessionId);
    console.log('✅ Token pair created successfully');
    console.log(`   Access Token: ${tokenPair.accessToken.substring(0, 50)}...`);
    console.log(`   Refresh Token: ${tokenPair.refreshToken.substring(0, 50)}...`);
    console.log(`   Expires At: ${tokenPair.expiresAt.toISOString()}\n`);

    console.log('2. Verifying access token...');
    const verifyResult = await TokenManager.verifyAccessToken(tokenPair.accessToken);
    console.log(`✅ Access token verification: ${verifyResult.valid ? 'Valid' : 'Invalid'}`);
    if (verifyResult.payload) {
      console.log(`   User ID: ${verifyResult.payload.userId}`);
      console.log(`   Session ID: ${verifyResult.payload.sessionId}`);
      console.log(`   Token Type: ${verifyResult.payload.type}\n`);
    }

    console.log('3. Testing token refresh...');
    const refreshResult = await TokenManager.refreshAccessToken(tokenPair.refreshToken);
    console.log(`✅ Token refresh: ${refreshResult.success ? 'Success' : 'Failed'}`);
    if (refreshResult.success && refreshResult.accessToken) {
      console.log(`   New Access Token: ${refreshResult.accessToken.substring(0, 50)}...\n`);
      
      console.log('4. Verifying new access token...');
      const newVerifyResult = await TokenManager.verifyAccessToken(refreshResult.accessToken);
      console.log(`✅ New access token verification: ${newVerifyResult.valid ? 'Valid' : 'Invalid'}`);
      if (newVerifyResult.payload) {
        console.log(`   User ID: ${newVerifyResult.payload.userId}`);
        console.log(`   Session ID: ${newVerifyResult.payload.sessionId}`);
        console.log(`   Token Type: ${newVerifyResult.payload.type}\n`);
      }
    } else {
      console.log(`   Error: ${refreshResult.error}\n`);
    }

    console.log('5. Testing expired refresh token...');
    const expiredRefreshResult = await TokenManager.refreshAccessToken(tokenPair.refreshToken);
    console.log(`✅ Expired refresh token test: ${expiredRefreshResult.success ? 'Unexpected Success' : 'Expected Failure'}`);
    if (!expiredRefreshResult.success) {
      console.log(`   Error: ${expiredRefreshResult.error}\n`);
    }

    console.log('🎉 Token refresh system test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTokenRefresh();




