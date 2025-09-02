const { clerkClient } = require('@clerk/nextjs/server');

// This script fixes admin user roles in Clerk
async function fixAdminRoles() {
  try {
    console.log('🔧 Starting admin role fix...');
    
    const client = await clerkClient();
    
    // Get all users
    const users = await client.users.getUserList();
    console.log(`📊 Found ${users.length} users`);
    
    let adminCount = 0;
    let fixedCount = 0;
    
    for (const user of users) {
      const currentRole = user.publicMetadata?.role;
      const email = user.emailAddresses[0]?.emailAddress;
      
      console.log(`\n👤 User: ${email} (${user.id})`);
      console.log(`   Current role: ${currentRole}`);
      
      // Check if this should be an admin (you can customize this logic)
      if (email && (
        email.includes('admin') || 
        email.includes('administrator') ||
        email.includes('mbuguamuiruri12@gmail.com') // Your admin email
      )) {
        if (currentRole !== 'admin') {
          console.log(`   🔄 Fixing role from "${currentRole}" to "admin"`);
          
          await client.users.updateUser(user.id, {
            publicMetadata: { role: 'admin' }
          });
          
          fixedCount++;
          console.log(`   ✅ Role updated successfully`);
        } else {
          console.log(`   ✅ Already has admin role`);
        }
        adminCount++;
      }
    }
    
    console.log(`\n🎉 Admin role fix completed!`);
    console.log(`   Total admin users: ${adminCount}`);
    console.log(`   Fixed roles: ${fixedCount}`);
    
  } catch (error) {
    console.error('❌ Error fixing admin roles:', error);
  }
}

// Run the fix
fixAdminRoles();
