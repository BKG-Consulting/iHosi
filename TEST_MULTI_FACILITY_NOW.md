# 🧪 Test Multi-Facility System - Quick Guide

## ⚡ Quick Test (No Subdomain Setup Needed)

Since the dev server is already running, let's test the core functionality:

### Test 1: Verify Facilities in Database

```bash
# Open Prisma Studio (already running)
# Visit: http://localhost:5555
# Click on "Facility" table
# Verify 10 facilities exist
```

### Test 2: Test API Endpoint

```bash
# Test facility lookup
curl http://localhost:3000/api/facilities
```

### Test 3: Setup Subdomain Testing

```bash
# Run this command (will ask for your password):
sudo bash setup-local-hosts.sh
```

**Or manually add to /etc/hosts:**

```bash
sudo nano /etc/hosts

# Add these lines:
127.0.0.1 mayo-clinic.localhost
127.0.0.1 cleveland-clinic.localhost
127.0.0.1 stanford-medical.localhost
127.0.0.1 johns-hopkins.localhost
127.0.0.1 mass-general.localhost
127.0.0.1 ucla-medical.localhost
127.0.0.1 ucsf-medical.localhost
127.0.0.1 newyork-presbyterian.localhost
127.0.0.1 cedars-sinai.localhost
127.0.0.1 duke-university.localhost
127.0.0.1 admin.localhost

# Save: Ctrl+X, Y, Enter
```

### Test 4: Test Subdomain After Setup

```bash
# Visit in browser:
http://mayo-clinic.localhost:3000
```

**Expected:**
- Page loads (might redirect to login)
- Browser console shows: "✅ Facility context loaded: Mayo Clinic"
- Terminal shows: "✅ Facility resolved"

---

## 🔧 Current Issue Fix

The MIME type error you saw is because the server wasn't fully started. Since we cleared the cache and restarted:

```bash
# Dev server is now running on port 3000
# Wait ~30 seconds for first build
# Then test again
```

---

## ✅ What's Working Right Now

Even without subdomain setup, the system is working:

1. ✅ Database has all multi-facility models
2. ✅ 10 facilities seeded
3. ✅ Middleware is ready
4. ✅ Context providers integrated
5. ✅ Build succeeds

---

## 🎯 Full Testing Steps

### Step 1: Setup Hosts File

```bash
sudo bash setup-local-hosts.sh
# Enter your password when prompted
```

### Step 2: Verify Hosts File

```bash
cat /etc/hosts | grep ".localhost"
```

Should show:
```
127.0.0.1 mayo-clinic.localhost
127.0.0.1 cleveland-clinic.localhost
...
```

### Step 3: Test Each Facility

Open in browser:
```
http://mayo-clinic.localhost:3000
http://cleveland-clinic.localhost:3000  
http://stanford-medical.localhost:3000
```

### Step 4: Check Browser Console

Press F12 (DevTools), check Console tab for:
```
✅ Facility context loaded: {
  id: "...",
  name: "Mayo Clinic",
  slug: "mayo-clinic",
  branding: {
    primaryColor: "#0051C3",
    ...
  }
}
```

### Step 5: Check Terminal Logs

In your terminal where `npm run dev` is running, look for:
```
🔍 Middleware: { pathname: '/', hostname: 'mayo-clinic.localhost:3000', subdomain: 'mayo-clinic' }
✅ Facility resolved: { id: '...', name: 'Mayo Clinic', ... }
```

---

## 🎨 Testing Branding

### Check CSS Variables

In browser DevTools:
1. Press F12
2. Go to Elements/Inspector tab
3. Select `<html>` element
4. Check Computed styles
5. Look for:
   ```css
   --facility-primary: #0051C3 (Mayo Clinic blue)
   --facility-secondary: #7B8794
   --facility-accent: #00A3E0
   ```

### Test Different Facilities

Visit different subdomains and watch colors change:
- Mayo Clinic: Blue (#0051C3)
- Cleveland Clinic: Navy (#003366)
- Stanford Medical: Cardinal (#8C1515)
- Johns Hopkins: Blue (#002D72)

---

## 🐛 If Still Having Issues

### Issue: "Connection refused"
```bash
# Check if dev server is running
lsof -i :3000

# If not, restart:
npm run dev
```

### Issue: "Subdomain not working"
```bash
# Verify /etc/hosts
cat /etc/hosts | grep localhost

# Ping subdomain
ping mayo-clinic.localhost

# Should show: 127.0.0.1
```

### Issue: "MIME type error"
```bash
# Clear cache and rebuild
rm -rf .next
npm run dev

# Wait 30-60 seconds for first build
# Then try again
```

### Issue: "Facility context not found"
```bash
# Check terminal for middleware logs
# Should see: "✅ Facility resolved"

# If not, check:
npx prisma studio
# Verify facilities exist in database
```

---

## 📊 Verification Checklist

- [ ] Dev server running (check: `lsof -i :3000`)
- [ ] 10 facilities in database (check: Prisma Studio)
- [ ] /etc/hosts configured (check: `cat /etc/hosts`)
- [ ] Can ping subdomain (check: `ping mayo-clinic.localhost`)
- [ ] Browser loads page (even if redirects to login)
- [ ] Browser console shows facility context
- [ ] Terminal shows middleware logs
- [ ] CSS variables are set
- [ ] Colors change per facility

---

## 🚀 Quick Win Test (No /etc/hosts needed)

If you want to test without subdomain setup:

### Create API Route to Test

```bash
# Create test endpoint
cat > app/api/test-facility/route.ts << 'EOF'
import { NextResponse } from 'next/server';
import { getAllActiveFacilities } from '@/lib/facility-helpers';

export async function GET() {
  const facilities = await getAllActiveFacilities();
  return NextResponse.json({
    success: true,
    count: facilities.length,
    facilities: facilities.map(f => ({
      name: f.name,
      slug: f.slug,
      primaryColor: f.primary_color,
    })),
  });
}
EOF

# Test it
curl http://localhost:3000/api/test-facility
```

This should return all 10 facilities without needing subdomain setup!

---

## ✅ Next Steps After Successful Test

Once subdomain routing works:

1. **Login with test credentials:**
   - Email: `doctor@test.com`
   - Password: `Test123!`
   
2. **Assign doctor to facilities:**
   - Create doctor-facility relationships
   
3. **Create per-facility schedules:**
   - Different hours at different facilities
   
4. **View unified calendar:**
   - See all appointments across facilities

---

## 🎯 Expected Behavior

### Without Subdomain (localhost:3000)
- ✅ App loads normally
- ✅ No facility context
- ✅ Works as before

### With Subdomain (mayo-clinic.localhost:3000)
- ✅ Middleware extracts "mayo-clinic"
- ✅ Looks up facility in database
- ✅ Injects context into headers + cookies
- ✅ FacilityProvider reads cookie
- ✅ Applies branding (CSS variables)
- ✅ Components can access facility via `useFacility()`

---

**Current Status:**
- Dev Server: ✅ RUNNING (port 3000)
- Database: ✅ SEEDED (10 facilities)
- Code: ✅ BUILT SUCCESSFULLY
- Next: Setup /etc/hosts and test!


