# Clerk Authentication Setup Guide for Healthcare Management System

## 🔐 Authentication & Role System Overview

Based on the codebase analysis, here's how authentication and user roles work in the healthcare system:

### **Key Architecture Points**

1. **Clerk Integration**: Uses Clerk as the authentication provider
2. **Role-Based Access**: Roles stored in Clerk's `publicMetadata.role`
3. **Database Sync**: Clerk `userId` is used as primary key in database tables
4. **Default Role**: Users without a role default to "patient"
5. **Dual Creation**: Some users are created both in Clerk and database simultaneously

## 🏗️ Role System Structure

### **Available Roles** (from Prisma schema)
```typescript
enum Role {
  ADMIN
  NURSE  
  DOCTOR
  LAB_TECHNICIAN
  PATIENT
  CASHIER
}
```

### **Route Access Control** (from `lib/routes.ts`)
```typescript
export const routeAccess = {
  "/admin(.*)": ["admin"],
  "/patient(.*)": ["patient", "admin", "doctor", "nurse"],
  "/doctor(.*)": ["doctor"],
  "/staff(.*)": ["nurse", "lab_technician", "cashier"],
  "/record/users": ["admin"],
  "/record/doctors": ["admin"],
  "/record/doctors(.*)": ["admin", "doctor"],
  "/record/staffs": ["admin", "doctor"],
  "/record/patients": ["admin", "doctor", "nurse"],
};
```

## 🚀 Clerk Configuration Steps

### **Step 1: Create Clerk Application**

1. Go to [clerk.com](https://clerk.com) and sign up/login
2. Create a new application
3. Choose your authentication methods (Email, Phone, Social logins)
4. Copy your keys to `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

### **Step 2: Configure Clerk Dashboard Settings**

#### **A. Authentication Settings**
- **Email**: Enable email authentication
- **Password**: Enable password authentication
- **Social Logins**: Optional (Google, GitHub, etc.)

#### **B. User Management Settings**
- **Sign-up mode**: Public (allow anyone to sign up)
- **User profile**: Enable first name, last name, email
- **Phone numbers**: Optional but recommended for medical context

#### **C. Public Metadata Configuration**
In Clerk dashboard, you can set up custom fields for user metadata:
- Go to **User Management > Metadata**
- Add a `role` field to public metadata

### **Step 3: User Creation Workflows**

The system has **THREE** different user creation approaches:

#### **1. Patient Self-Registration** 
- **Flow**: User signs up via Clerk → Auto-redirected to `/patient/registration` → Fills patient form
- **Role Assignment**: Automatically set to "patient" in middleware
- **Database Creation**: Created when completing registration form

#### **2. Admin-Created Staff/Doctors**
- **Flow**: Admin creates user via admin panel → User created in both Clerk and database
- **Role Assignment**: Set during creation process
- **Database Creation**: Immediate

#### **3. Seeded Users** 
- **Flow**: Database-only users created via seed script
- **Role Assignment**: None (need manual Clerk setup)
- **Database Creation**: Immediate

## 👥 User Management Strategies

### **For Development/Testing**

#### **Option 1: Create Test Admin User**
1. Sign up through the normal flow at `/sign-up`
2. In Clerk dashboard, manually set the user's `publicMetadata.role` to `"admin"`
3. User will now have admin access

#### **Option 2: Use Seeded Data + Manual Role Assignment**
1. Run the seed script (creates database-only users)
2. For each seeded user you want to test:
   - Create corresponding Clerk user manually
   - Set appropriate role in `publicMetadata`
   - Use the same `id` from the seeded data

#### **Option 3: Create Users via Admin Panel**
1. First create an admin user (Option 1)
2. Use admin panel to create doctors, nurses, etc.
3. This automatically creates both Clerk and database records

### **For Production**

#### **Recommended Approach:**
1. **Admin Bootstrap**: Manually create first admin user in Clerk dashboard
2. **Role Assignment**: Use admin panel to create all other users
3. **Patient Registration**: Allow public patient registration with automatic role assignment

## 🔄 Authentication Flow Diagram

```
User Signs Up/In
        ↓
   Clerk Authentication
        ↓
   Middleware Checks Role
        ↓
Role from sessionClaims.metadata.role
        ↓
If no role → default to "patient"
        ↓
Route Access Control Check
        ↓
Redirect to appropriate dashboard
```

## 📝 Step-by-Step Setup for Testing

### **1. Start with Patient Flow**
```bash
# After setting up Clerk keys
npm run dev
# Go to http://localhost:3000
# Click "Sign Up" → Create account
# You'll be redirected to patient registration
# Fill the form to complete patient setup
```

### **2. Create Admin User**
```bash
# After patient signup, go to Clerk dashboard
# Find your user in Users section
# Edit user → Public metadata → Add:
# { "role": "admin" }
# Save and refresh your app
# You'll now have admin access
```

### **3. Create Other Users via Admin Panel**
```bash
# As admin, go to /admin
# Use "Create Doctor" or "Create Staff" forms
# These automatically create both Clerk + database records
```

## 🛠️ Code Examples

### **Check User Role**
```typescript
import { checkRole } from "@/utils/roles";

// Check if user is admin
const isAdmin = await checkRole("ADMIN");

// Get current user role
const role = await getRole();
```

### **Protect Routes**
```typescript
// In middleware.ts, routes are automatically protected
// Based on routeAccess configuration
```

### **Create User with Role**
```typescript
// Example from admin.ts
const user = await clerkClient().users.createUser({
  emailAddress: [email],
  password: password,
  firstName: firstName,
  lastName: lastName,
  publicMetadata: { role: "doctor" } // Key part!
});
```

## 🔍 Testing Authentication

### **Test Different User Types:**

1. **Patient**: 
   - Sign up normally
   - Should redirect to `/patient/registration`
   - After registration, access `/patient` dashboard

2. **Admin**:
   - Manually set role in Clerk dashboard
   - Should access `/admin` routes

3. **Doctor**:
   - Create via admin panel OR manually set role
   - Should access `/doctor` routes

4. **Staff** (Nurse, Lab Tech, Cashier):
   - Create via admin panel OR manually set role
   - Should access `/staff` routes

## 🚨 Common Issues & Solutions

### **Issue: User can't access expected routes**
- **Solution**: Check `publicMetadata.role` in Clerk dashboard
- **Verify**: Role matches exactly (case-sensitive)

### **Issue: Patient registration fails**
- **Solution**: Ensure database is running and migrated
- **Check**: Database connection string in `.env.local`

### **Issue: Infinite redirect loops**
- **Solution**: Ensure user has valid role set
- **Check**: Middleware logic in `middleware.ts`

### **Issue: Database/Clerk ID mismatch**
- **Solution**: Use same ID for both Clerk user and database record
- **Check**: User creation functions in `app/actions/`

## 🎯 Quick Start Commands

```bash
# 1. Setup environment
cp env.example .env.local
# Edit .env.local with your Clerk keys

# 2. Start database
docker-compose up -d

# 3. Setup database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# 4. Start application
npm run dev

# 5. Test authentication
# Go to http://localhost:3000
# Sign up as patient, then promote to admin in Clerk dashboard
```

This should give you a complete understanding of how to configure and test the authentication system!
