# 🏥 Multi-Facility Scheduling & Multi-Tenant Architecture
## Complete Design & Implementation Guide

**Version:** 2.0
**Date:** 2024
**Status:** Architecture Design

---

## 📋 Executive Summary

This document addresses **three critical architectural needs**:

1. **🗓️ Enhanced Scheduling System** - Robust, enterprise-grade scheduling for doctors across multiple facilities
2. **🏢 Multi-Facility Support** - Unified doctor schedules across multiple healthcare facilities
3. **🏗️ Multi-Tenant Architecture** - Subdomain-based facility isolation with custom branding

### Current Limitations Identified:
- ❌ Basic scheduling requiring heavy manual setup
- ❌ No multi-facility support for doctors
- ❌ Tenant management exists but not fully implemented
- ❌ No subdomain-based facility routing
- ❌ No facility-specific branding

### Target Architecture:
- ✅ **Intelligent scheduling** with templates, rules, and automation
- ✅ **Multi-facility doctor management** with unified calendar
- ✅ **Full multi-tenant system** with subdomain isolation
- ✅ **Facility branding** per subdomain
- ✅ **Role hierarchy**: Super Admin → Facility Admin → Staff/Doctors

---

## 🔍 Part 1: Industry Research - Best-in-Class Scheduling

### Leading Healthcare Scheduling Systems Analysis

#### **1. Zocdoc (Healthcare-specific)**
**Key Features:**
- Instant online booking
- Real-time availability
- Provider matching based on insurance, location, specialty
- Automated reminders (email, SMS)
- Waitlist management
- Multi-location support per provider
- Patient reviews and ratings

**What Makes It Great:**
- Zero manual setup for patients
- Intelligent slot recommendations
- Automatic conflict resolution
- Cross-location calendar view

#### **2. Epic Systems (Enterprise EHR)**
**Scheduling Features:**
- Template-based scheduling
- Resource pooling (rooms, equipment)
- Multi-provider scheduling
- Block scheduling for procedures
- Recurring appointment patterns
- Smart slot suggestions based on:
  - Appointment type
  - Provider availability
  - Room availability
  - Required equipment
- Integration with clinical workflows

**What Makes It Epic:**
- Rules engine for complex scheduling logic
- Predictive no-show algorithms
- Automatic overbooking based on patterns
- Multi-facility coordination

#### **3. Athenahealth**
**Scheduling Intelligence:**
- Demand-based scheduling
- Provider preference learning
- Patient preference learning
- Automated waitlist filling
- Dynamic time slots (adjusts based on appointment type)
- Multi-location provider management
- Cross-facility scheduling

**What Makes It Smart:**
- AI-powered slot optimization
- Patient flow prediction
- Automatic schedule smoothing
- Revenue optimization algorithms

#### **4. Calendly (General Purpose - Excellent UX)**
**UX Excellence:**
- Dead-simple booking flow (3 clicks)
- Embedded scheduling widgets
- Round-robin assignment
- Team availability pooling
- Buffer times between meetings
- Time zone intelligence
- Custom branding per user

**What Makes It Simple:**
- No training required
- Beautiful mobile experience
- Intuitive setup wizards
- Smart defaults

---

## 🎯 Part 2: Enhanced Scheduling System Design

### 2.1 Core Requirements

Based on industry analysis and your needs:

#### **Must-Have Features:**

1. **Template-Based Scheduling**
   - Save common weekly patterns
   - Quick apply templates
   - Templates per facility
   - Seasonal templates (summer vs. winter hours)

2. **Intelligent Time Slot Management**
   - Dynamic slot duration based on appointment type
   - Automatic buffer times
   - Break time management
   - Lunch blocks
   - Meeting blocks

3. **Multi-Facility Scheduling**
   - Unified calendar view across all facilities
   - Per-facility availability
   - Facility-specific patients
   - Cross-facility conflict detection

4. **Smart Scheduling Rules**
   - Appointment type → Duration mapping
   - First appointment of day (extra time)
   - Follow-up appointments (shorter duration)
   - Emergency slots (reserved slots)
   - VIP patient prioritization

5. **Automated Schedule Management**
   - Auto-fill from waitlist
   - Predictive no-show handling
   - Automatic overbooking (based on history)
   - Schedule optimization suggestions

6. **Patient Self-Scheduling**
   - Real-time availability
   - Intelligent slot suggestions
   - Reason-based filtering
   - Insurance verification
   - Automatic reminders

7. **Recurring Appointments**
   - Weekly/monthly patterns
   - Series management
   - Bulk rescheduling
   - Exception handling

### 2.2 Enhanced Data Model

```prisma
// ===============================================
// FACILITY MODEL (NEW)
// ===============================================
model Facility {
  id                String   @id @default(cuid())
  
  // Identification
  name              String
  slug              String   @unique  // For subdomain: "mayo-clinic" → mayo-clinic.ihosi.com
  legal_name        String
  facility_code     String   @unique  // Internal code: "FAC001"
  
  // Contact & Location
  address           String
  city              String
  state             String
  zip_code          String
  country           String @default("USA")
  phone             String
  email             String
  website           String?
  
  // Branding
  logo_url          String?
  primary_color     String   @default("#3b82f6")
  secondary_color   String   @default("#8b5cf6")
  accent_color      String   @default("#10b981")
  custom_css        String?  // For advanced branding
  favicon_url       String?
  
  // Settings
  timezone          String   @default("America/New_York")
  language          String   @default("en")
  currency          String   @default("USD")
  
  // Business Hours (default for facility)
  default_open_time  String  @default("08:00")
  default_close_time String  @default("17:00")
  
  // Features & Limits
  max_doctors       Int      @default(50)
  max_patients      Int      @default(10000)
  features_enabled  Json     @default("[]") // ["telemedicine", "lab_integration", etc.]
  
  // Multi-tenant fields
  tenant_id         String?  // Links to tenant for billing/licensing
  subscription_tier String   @default("basic") // basic, professional, enterprise
  subscription_status String @default("active") // active, suspended, cancelled
  
  // Status
  status            FacilityStatus @default(ACTIVE)
  is_verified       Boolean  @default(false)
  
  // Relations
  doctors           DoctorFacility[]
  staff             StaffFacility[]
  patients          PatientFacility[]
  departments       Department[]
  appointments      Appointment[]
  schedule_templates FacilityScheduleTemplate[]
  facility_admins   FacilityAdmin[]
  
  // Metadata
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  created_by        String?
  
  @@index([slug])
  @@index([status])
  @@index([tenant_id])
}

enum FacilityStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING_APPROVAL
}

// ===============================================
// FACILITY ADMIN (NEW)
// ===============================================
model FacilityAdmin {
  id          String   @id @default(cuid())
  user_id     String   // References Admin table
  facility_id String
  role        FacilityAdminRole @default(ADMIN)
  permissions Json     @default("[]")
  
  facility    Facility @relation(fields: [facility_id], references: [id], onDelete: Cascade)
  
  created_at  DateTime @default(now())
  
  @@unique([user_id, facility_id])
  @@index([facility_id])
}

enum FacilityAdminRole {
  ADMIN           // Full facility access
  MANAGER         // Operational management
  SCHEDULER       // Scheduling only
  BILLING         // Billing & finance
  REPORTS         // Reports & analytics
}

// ===============================================
// DOCTOR-FACILITY RELATIONSHIP (NEW)
// ===============================================
model DoctorFacility {
  id                String   @id @default(cuid())
  doctor_id         String
  facility_id       String
  
  // Employment details
  employment_type   EmploymentType @default(FULL_TIME)
  start_date        DateTime
  end_date          DateTime?
  
  // Facility-specific info
  office_number     String?
  department_id     String?
  
  // Scheduling preferences at THIS facility
  default_appointment_duration Int @default(30)
  default_buffer_time Int @default(5)
  accepts_new_patients Boolean @default(true)
  online_booking_enabled Boolean @default(true)
  
  // Status
  status            DoctorFacilityStatus @default(ACTIVE)
  is_primary_facility Boolean @default(false) // Doctor's main facility
  
  // Relations
  doctor            Doctor   @relation(fields: [doctor_id], references: [id], onDelete: Cascade)
  facility          Facility @relation(fields: [facility_id], references: [id], onDelete: Cascade)
  department        Department? @relation(fields: [department_id], references: [id])
  
  // Facility-specific working days
  working_days      FacilityWorkingDays[]
  
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  @@unique([doctor_id, facility_id])
  @@index([doctor_id])
  @@index([facility_id])
  @@index([status])
}

enum EmploymentType {
  FULL_TIME
  PART_TIME
  CONTRACT
  VISITING
  LOCUM_TENENS
}

enum DoctorFacilityStatus {
  ACTIVE
  ON_LEAVE
  INACTIVE
  TERMINATED
}

// ===============================================
// FACILITY-SPECIFIC WORKING DAYS (ENHANCED)
// ===============================================
model FacilityWorkingDays {
  id                  Int      @id @default(autoincrement())
  doctor_facility_id  String
  day_of_week         String
  
  // Time slots
  start_time          String
  end_time            String
  
  // Breaks
  break_start_time    String?
  break_end_time      String?
  
  // Capacity
  max_appointments    Int      @default(20)
  emergency_slots     Int      @default(2) // Reserved emergency slots
  
  // Slot configuration
  appointment_duration Int     @default(30) // Default minutes per appointment
  buffer_time         Int      @default(5)  // Minutes between appointments
  
  // Appointment types allowed
  allowed_appointment_types Json @default("[]") // ["consultation", "follow_up", "emergency"]
  
  // Special flags
  is_working          Boolean  @default(true)
  is_template         Boolean  @default(false) // Is this a template?
  
  // Recurrence
  effective_from      DateTime?
  effective_until     DateTime?
  recurrence_pattern  Json?    // For complex patterns
  
  // Relations
  doctor_facility     DoctorFacility @relation(fields: [doctor_facility_id], references: [id], onDelete: Cascade)
  
  created_at          DateTime @default(now())
  updated_at          DateTime @updatedAt
  
  @@unique([doctor_facility_id, day_of_week, effective_from])
  @@index([doctor_facility_id])
  @@index([day_of_week])
  @@index([effective_from, effective_until])
}

// ===============================================
// SCHEDULE TEMPLATES (ENHANCED)
// ===============================================
model FacilityScheduleTemplate {
  id                String   @id @default(cuid())
  name              String   // "Summer Hours", "Winter Hours", "Holiday Schedule"
  description       String?
  
  // Ownership
  facility_id       String?  // Facility-wide template
  doctor_id         String?  // Doctor-specific template
  
  // Template data
  schedule_config   Json     // Complete schedule configuration
  
  // Template metadata
  is_public         Boolean  @default(false) // Can other doctors use this?
  usage_count       Int      @default(0)
  
  // Seasonal/Temporary
  valid_from        DateTime?
  valid_until       DateTime?
  
  // Relations
  facility          Facility? @relation(fields: [facility_id], references: [id], onDelete: Cascade)
  
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  created_by        String
  
  @@index([facility_id])
  @@index([doctor_id])
  @@index([valid_from, valid_until])
}

// ===============================================
// SMART SCHEDULING RULES (NEW)
// ===============================================
model SchedulingRule {
  id                String   @id @default(cuid())
  name              String
  description       String?
  
  // Scope
  facility_id       String?  // Facility-wide rule
  doctor_id         String?  // Doctor-specific rule
  
  // Rule type
  rule_type         SchedulingRuleType
  
  // Conditions (JSON format)
  conditions        Json     // When to apply this rule
  
  // Actions (JSON format)
  actions           Json     // What to do when conditions met
  
  // Priority & Status
  priority          Int      @default(0) // Higher = applied first
  is_active         Boolean  @default(true)
  
  // Analytics
  times_applied     Int      @default(0)
  last_applied_at   DateTime?
  
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  @@index([facility_id])
  @@index([doctor_id])
  @@index([rule_type])
  @@index([is_active])
}

enum SchedulingRuleType {
  APPOINTMENT_DURATION   // Adjust duration based on type
  BUFFER_TIME           // Adjust buffer based on conditions
  SLOT_BLOCKING         // Block certain time slots
  AUTO_APPROVAL         // Auto-approve certain appointment types
  PRIORITY_SCHEDULING   // Priority for certain patients
  CAPACITY_MANAGEMENT   // Manage max appointments per day
  OVERBOOKING          // Allow overbooking under conditions
  WAITLIST_FILLING     // Auto-fill from waitlist
}

// ===============================================
// APPOINTMENT TYPE DEFINITIONS (NEW)
// ===============================================
model AppointmentType {
  id                String   @id @default(cuid())
  name              String   // "New Patient Consultation", "Follow-up", "Emergency"
  code              String   // "NEW_PATIENT", "FOLLOW_UP", "EMERGENCY"
  description       String?
  
  // Scope
  facility_id       String?  // Facility-specific
  is_global         Boolean  @default(false) // Available across all facilities
  
  // Timing
  default_duration  Int      // Minutes
  minimum_duration  Int?
  maximum_duration  Int?
  buffer_time       Int      @default(5)
  
  // Booking rules
  requires_approval Boolean  @default(false)
  advance_booking_days Int   @default(30) // How far ahead can patients book?
  min_notice_hours  Int      @default(24) // Minimum notice required
  
  // Pricing
  base_price        Float?
  insurance_covered Boolean  @default(true)
  
  // Colors & UI
  color_code        String   @default("#3b82f6")
  icon              String?
  
  // Status
  is_active         Boolean  @default(true)
  display_order     Int      @default(0)
  
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  @@unique([facility_id, code])
  @@index([facility_id])
  @@index([is_active])
}

// ===============================================
// APPOINTMENT ENHANCEMENTS (Update existing model)
// ===============================================
// Add these fields to your existing Appointment model:
/*
model Appointment {
  // ... existing fields ...
  
  // Multi-facility support
  facility_id       String
  facility          Facility @relation(fields: [facility_id], references: [id])
  
  // Enhanced scheduling
  appointment_type_id String?
  appointment_type  AppointmentType? @relation(fields: [appointment_type_id], references: [id])
  
  // Slot management
  actual_duration   Int?     // Actual time taken (for analytics)
  check_in_time     DateTime?
  check_out_time    DateTime?
  
  // Waitlist
  is_from_waitlist  Boolean  @default(false)
  waitlist_priority Int?
  
  // Recurrence
  recurrence_id     String?  // Groups recurring appointments
  recurrence_rule   Json?
  is_recurring      Boolean  @default(false)
  
  // Conflicts
  has_conflict      Boolean  @default(false)
  conflict_resolved Boolean  @default(false)
  conflict_notes    String?
  
  // Analytics
  booking_source    String?  // "online", "phone", "walkin", "system"
  booking_lead_time Int?     // Days between booking and appointment
  
  @@index([facility_id])
  @@index([appointment_type_id])
  @@index([recurrence_id])
}
*/

// ===============================================
// WAITLIST MANAGEMENT (NEW)
// ===============================================
model Waitlist {
  id                String   @id @default(cuid())
  
  // Patient & Doctor
  patient_id        String
  doctor_id         String
  facility_id       String
  
  // Preferences
  preferred_dates   Json     // Array of preferred date ranges
  preferred_times   Json     // Array of time preferences
  appointment_type_id String?
  
  // Priority
  priority          WaitlistPriority @default(NORMAL)
  urgency_level     Int      @default(3) // 1-5 scale
  
  // Flexibility
  accept_other_doctors Boolean @default(false)
  accept_other_facilities Boolean @default(false)
  max_wait_days     Int?
  
  // Status
  status            WaitlistStatus @default(ACTIVE)
  notified_count    Int      @default(0) // How many times notified
  last_notified_at  DateTime?
  
  // Notes
  reason            String?
  notes             String?
  
  // Auto-booking
  auto_book         Boolean  @default(false) // Auto-book when slot available
  
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  expires_at        DateTime?
  
  @@index([doctor_id, facility_id])
  @@index([status])
  @@index([priority])
}

enum WaitlistPriority {
  LOW
  NORMAL
  HIGH
  URGENT
  EMERGENCY
}

enum WaitlistStatus {
  ACTIVE
  NOTIFIED
  BOOKED
  EXPIRED
  CANCELLED
}

// ===============================================
// PATIENT-FACILITY RELATIONSHIP (NEW)
// ===============================================
model PatientFacility {
  id                String   @id @default(cuid())
  patient_id        String
  facility_id       String
  
  // Registration
  registration_date DateTime @default(now())
  patient_number    String   // Facility-specific patient ID
  
  // Status
  status            PatientStatus @default(ACTIVE)
  is_new_patient    Boolean  @default(true)
  
  // Preferences
  preferred_doctor_id String?
  preferred_contact_method String @default("email") // email, sms, phone
  
  // Relations
  patient           Patient  @relation(fields: [patient_id], references: [id], onDelete: Cascade)
  facility          Facility @relation(fields: [facility_id], references: [id], onDelete: Cascade)
  
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  @@unique([patient_id, facility_id])
  @@unique([facility_id, patient_number])
  @@index([facility_id])
  @@index([patient_id])
}

enum PatientStatus {
  ACTIVE
  INACTIVE
  DECEASED
  TRANSFERRED
}

// ===============================================
// STAFF-FACILITY RELATIONSHIP (NEW)
// ===============================================
model StaffFacility {
  id          String   @id @default(cuid())
  staff_id    String
  facility_id String
  
  role        String   // Role at this specific facility
  department_id String?
  
  employment_type EmploymentType @default(FULL_TIME)
  start_date  DateTime
  end_date    DateTime?
  
  status      StaffFacilityStatus @default(ACTIVE)
  
  staff       Staff    @relation(fields: [staff_id], references: [id], onDelete: Cascade)
  facility    Facility @relation(fields: [facility_id], references: [id], onDelete: Cascade)
  
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  
  @@unique([staff_id, facility_id])
  @@index([facility_id])
  @@index([staff_id])
}

enum StaffFacilityStatus {
  ACTIVE
  ON_LEAVE
  INACTIVE
  TERMINATED
}
```

---

## 🏗️ Part 3: Multi-Tenant Architecture with Subdomain Support

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     DNS & Load Balancer                      │
│  *.ihosi.com → Routes to Next.js App                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Middleware                         │
│  1. Extract subdomain from request                           │
│  2. Resolve facility from subdomain                          │
│  3. Load facility branding config                            │
│  4. Inject into request context                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  - Facility context available in all components              │
│  - Facility-specific styling applied                         │
│  - Data queries filtered by facility_id                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Database Layer                           │
│  Shared PostgreSQL with facility_id columns                  │
│  OR Separate databases per facility                          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 URL Structure

```
# Super Admin Portal
https://admin.ihosi.com
→ Super admin manages all facilities
→ Can create new facilities
→ System-wide analytics

# Facility-Specific Portals
https://mayo-clinic.ihosi.com
https://stanford-medical.ihosi.com
https://johns-hopkins.ihosi.com
→ Facility admin logs in
→ Sees only their facility's data
→ Custom branding applied

# Main App (Optional)
https://app.ihosi.com or https://ihosi.com
→ Generic login
→ User redirects to their facility
```

### 3.3 Role Hierarchy

```
┌──────────────────────────────────────────────────────┐
│             SUPER ADMIN (admin.ihosi.com)            │
│  - Create/manage facilities                          │
│  - Assign facility admins                            │
│  - System-wide analytics                             │
│  - Billing & licensing management                    │
└──────────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────┐
│      FACILITY ADMIN (facility-name.ihosi.com)        │
│  - Manage facility users (doctors, staff)            │
│  - Configure facility settings                       │
│  - Facility branding                                 │
│  - Facility-level analytics                          │
│  - Cannot see other facilities' data                 │
└──────────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────┐
│            DOCTORS / STAFF / PATIENTS                │
│  - Access their assigned facility                    │
│  - Doctors can be in multiple facilities             │
│  - See unified schedule across facilities            │
└──────────────────────────────────────────────────────┘
```

### 3.4 Database Strategy

#### **Option A: Shared Database with Facility Isolation (Recommended)**

**Pros:**
- Easier to manage
- Better for analytics across facilities
- Cost-effective
- Simpler backups

**Cons:**
- Must ensure perfect data isolation
- Requires careful query filtering

**Implementation:**
```typescript
// Every query automatically filtered by facility_id
const appointments = await db.appointment.findMany({
  where: {
    facility_id: currentFacility.id,
    // ... other conditions
  }
});
```

#### **Option B: Separate Database Per Facility**

**Pros:**
- Complete data isolation
- Better for regulatory compliance
- Easier to migrate individual facilities

**Cons:**
- Complex connection management
- Harder to do cross-facility analytics
- Higher operational overhead

**Implementation:**
```typescript
// Dynamic database connection
const facilityDb = await getFacilityConnection(facilityId);
const appointments = await facilityDb.appointment.findMany({...});
```

**Recommendation:** Start with **Option A** (Shared DB), migrate to Option B if specific facilities require it.

---

## 🛠️ Part 4: Implementation Guide

### 4.1 Tenant Resolution Middleware

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFacilityBySubdomain } from '@/lib/facilities';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Extract subdomain
  const subdomain = extractSubdomain(hostname);
  
  // Skip middleware for certain paths
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/public') ||
    request.nextUrl.pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }
  
  // Handle super admin portal
  if (subdomain === 'admin') {
    return handleSuperAdmin(request);
  }
  
  // Handle main app (no subdomain or www)
  if (!subdomain || subdomain === 'www' || subdomain === 'app') {
    return handleMainApp(request);
  }
  
  // Handle facility-specific subdomain
  return handleFacilitySubdomain(request, subdomain);
}

function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0];
  
  // Split by dots
  const parts = host.split('.');
  
  // For localhost:3000 or single domain
  if (parts.length <= 2) {
    return null;
  }
  
  // Return subdomain (first part)
  return parts[0];
}

async function handleFacilitySubdomain(
  request: NextRequest,
  subdomain: string
): Promise<NextResponse> {
  try {
    // Look up facility by subdomain
    const facility = await getFacilityBySubdomain(subdomain);
    
    if (!facility) {
      // Facility not found - redirect to main app or show error
      return NextResponse.redirect(new URL('/facility-not-found', request.url));
    }
    
    if (facility.status !== 'ACTIVE') {
      return NextResponse.redirect(new URL('/facility-suspended', request.url));
    }
    
    // Create response
    const response = NextResponse.next();
    
    // Inject facility context into headers (accessible in app)
    response.headers.set('x-facility-id', facility.id);
    response.headers.set('x-facility-name', facility.name);
    response.headers.set('x-facility-slug', facility.slug);
    
    // Set cookie for client-side access
    response.cookies.set('facility-context', JSON.stringify({
      id: facility.id,
      name: facility.name,
      slug: facility.slug,
      branding: {
        primaryColor: facility.primary_color,
        secondaryColor: facility.secondary_color,
        accentColor: facility.accent_color,
        logoUrl: facility.logo_url,
      }
    }), {
      httpOnly: false, // Allow client-side access for branding
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    
    return response;
  } catch (error) {
    console.error('Error in facility middleware:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}

async function handleSuperAdmin(request: NextRequest): Promise<NextResponse> {
  // Verify user is super admin
  const authResult = await verifyAuth();
  
  if (!authResult.isValid || authResult.user?.role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  const response = NextResponse.next();
  response.headers.set('x-admin-portal', 'true');
  return response;
}

async function handleMainApp(request: NextRequest): Promise<NextResponse> {
  // Main app logic - could redirect to facility selection
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

### 4.2 Facility Context Provider

```typescript
// lib/facility-context.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface FacilityBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
}

interface FacilityContext {
  id: string;
  name: string;
  slug: string;
  branding: FacilityBranding;
}

const FacilityContext = createContext<FacilityContext | null>(null);

export function FacilityProvider({ children }: { children: React.ReactNode }) {
  const [facility, setFacility] = useState<FacilityContext | null>(null);
  
  useEffect(() => {
    // Read facility context from cookie (set by middleware)
    const facilityContext = document.cookie
      .split('; ')
      .find(row => row.startsWith('facility-context='))
      ?.split('=')[1];
    
    if (facilityContext) {
      try {
        const parsed = JSON.parse(decodeURIComponent(facilityContext));
        setFacility(parsed);
        
        // Apply branding dynamically
        applyBranding(parsed.branding);
      } catch (error) {
        console.error('Failed to parse facility context:', error);
      }
    }
  }, []);
  
  return (
    <FacilityContext.Provider value={facility}>
      {children}
    </FacilityContext.Provider>
  );
}

export function useFacility() {
  const context = useContext(FacilityContext);
  if (!context) {
    throw new Error('useFacility must be used within FacilityProvider');
  }
  return context;
}

function applyBranding(branding: FacilityBranding) {
  // Set CSS custom properties for theming
  document.documentElement.style.setProperty('--color-primary', branding.primaryColor);
  document.documentElement.style.setProperty('--color-secondary', branding.secondaryColor);
  document.documentElement.style.setProperty('--color-accent', branding.accentColor);
  
  // Update favicon if provided
  if (branding.logoUrl) {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = branding.logoUrl;
    }
  }
}
```

### 4.3 Facility-Aware Data Fetching

```typescript
// lib/facility-db.ts
import db from './db';
import { headers } from 'next/headers';

/**
 * Get current facility ID from request headers
 * (Set by middleware)
 */
export async function getCurrentFacilityId(): Promise<string | null> {
  const headersList = headers();
  return headersList.get('x-facility-id');
}

/**
 * Facility-aware query wrapper
 * Automatically filters by facility_id
 */
export async function facilityQuery<T>(
  query: (facilityId: string) => Promise<T>
): Promise<T> {
  const facilityId = await getCurrentFacilityId();
  
  if (!facilityId) {
    throw new Error('No facility context available');
  }
  
  return query(facilityId);
}

// Usage examples:

// Get appointments for current facility
export async function getFacilityAppointments() {
  return facilityQuery(async (facilityId) => {
    return db.appointment.findMany({
      where: { facility_id: facilityId },
      include: {
        patient: true,
        doctor: true,
      },
    });
  });
}

// Get doctors for current facility
export async function getFacilityDoctors() {
  return facilityQuery(async (facilityId) => {
    return db.doctorFacility.findMany({
      where: { 
        facility_id: facilityId,
        status: 'ACTIVE',
      },
      include: {
        doctor: true,
        working_days: true,
      },
    });
  });
}
```

### 4.4 Multi-Facility Doctor Schedule View

```typescript
// components/doctor/multi-facility-schedule.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar } from 'lucide-react';

interface Facility {
  id: string;
  name: string;
  slug: string;
}

interface Appointment {
  id: number;
  facility: Facility;
  patient_name: string;
  time: string;
  date: Date;
  type: string;
  status: string;
}

export function MultiFacilitySchedule({ doctorId }: { doctorId: string }) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedView, setSelectedView] = useState<'unified' | 'per-facility'>('unified');
  
  useEffect(() => {
    loadDoctorFacilities();
    loadAllAppointments();
  }, [doctorId]);
  
  const loadDoctorFacilities = async () => {
    const response = await fetch(`/api/doctors/${doctorId}/facilities`);
    const data = await response.json();
    setFacilities(data.facilities);
  };
  
  const loadAllAppointments = async () => {
    const response = await fetch(`/api/doctors/${doctorId}/appointments/all-facilities`);
    const data = await response.json();
    setAppointments(data.appointments);
  };
  
  // Unified view - all appointments across facilities
  const renderUnifiedView = () => {
    const today = new Date().toDateString();
    const todayAppointments = appointments.filter(
      apt => new Date(apt.date).toDateString() === today
    );
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Today's Schedule - All Facilities</h3>
        {todayAppointments.length === 0 ? (
          <p className="text-gray-500">No appointments today</p>
        ) : (
          todayAppointments.map(appointment => (
            <Card key={appointment.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      <Building2 className="h-3 w-3 mr-1" />
                      {appointment.facility.name}
                    </Badge>
                    <Badge variant="secondary">{appointment.time}</Badge>
                  </div>
                  <h4 className="font-medium">{appointment.patient_name}</h4>
                  <p className="text-sm text-gray-600">{appointment.type}</p>
                </div>
                <Badge className={getStatusColor(appointment.status)}>
                  {appointment.status}
                </Badge>
              </div>
            </Card>
          ))
        )}
      </div>
    );
  };
  
  // Per-facility view - tabs for each facility
  const renderPerFacilityView = () => {
    return (
      <Tabs defaultValue={facilities[0]?.id}>
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${facilities.length}, 1fr)` }}>
          {facilities.map(facility => (
            <TabsTrigger key={facility.id} value={facility.id}>
              {facility.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {facilities.map(facility => {
          const facilityAppointments = appointments.filter(
            apt => apt.facility.id === facility.id
          );
          
          return (
            <TabsContent key={facility.id} value={facility.id}>
              <div className="space-y-4">
                {facilityAppointments.map(appointment => (
                  <Card key={appointment.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{appointment.time}</Badge>
                        </div>
                        <h4 className="font-medium">{appointment.patient_name}</h4>
                        <p className="text-sm text-gray-600">{appointment.type}</p>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedView('unified')}
          className={`px-4 py-2 rounded-md ${
            selectedView === 'unified' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100'
          }`}
        >
          <Calendar className="h-4 w-4 inline mr-2" />
          Unified View
        </button>
        <button
          onClick={() => setSelectedView('per-facility')}
          className={`px-4 py-2 rounded-md ${
            selectedView === 'per-facility' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100'
          }`}
        >
          <Building2 className="h-4 w-4 inline mr-2" />
          Per Facility
        </button>
      </div>
      
      {/* Render selected view */}
      {selectedView === 'unified' ? renderUnifiedView() : renderPerFacilityView()}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
    case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
    case 'COMPLETED': return 'bg-green-100 text-green-800';
    case 'CANCELLED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}
```

### 4.5 Intelligent Scheduling API

```typescript
// app/api/v2/scheduling/suggest-slots/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';

const requestSchema = z.object({
  doctorId: z.string(),
  facilityId: z.string(),
  appointmentTypeId: z.string(),
  patientPreferences: z.object({
    preferredDates: z.array(z.string()).optional(),
    preferredTimes: z.array(z.string()).optional(),
    maxWaitDays: z.number().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = requestSchema.parse(body);
    
    // Get appointment type configuration
    const appointmentType = await db.appointmentType.findUnique({
      where: { id: validated.appointmentTypeId },
    });
    
    if (!appointmentType) {
      return NextResponse.json(
        { error: 'Appointment type not found' },
        { status: 404 }
      );
    }
    
    // Get doctor's schedule at this facility
    const doctorFacility = await db.doctorFacility.findUnique({
      where: {
        doctor_id_facility_id: {
          doctor_id: validated.doctorId,
          facility_id: validated.facilityId,
        },
      },
      include: {
        working_days: true,
      },
    });
    
    if (!doctorFacility) {
      return NextResponse.json(
        { error: 'Doctor not found at this facility' },
        { status: 404 }
      );
    }
    
    // Get existing appointments
    const existingAppointments = await db.appointment.findMany({
      where: {
        doctor_id: validated.doctorId,
        facility_id: validated.facilityId,
        appointment_date: {
          gte: new Date(),
        },
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS'],
        },
      },
    });
    
    // Generate available slots
    const availableSlots = await generateIntelligentSlots({
      workingDays: doctorFacility.working_days,
      appointmentType,
      existingAppointments,
      patientPreferences: validated.patientPreferences,
      doctorConfig: {
        bufferTime: doctorFacility.default_buffer_time,
        defaultDuration: doctorFacility.default_appointment_duration,
      },
    });
    
    return NextResponse.json({
      success: true,
      slots: availableSlots,
      metadata: {
        totalSlots: availableSlots.length,
        firstAvailable: availableSlots[0]?.datetime,
        appointmentType: appointmentType.name,
      },
    });
  } catch (error) {
    console.error('Error suggesting slots:', error);
    return NextResponse.json(
      { error: 'Failed to suggest slots' },
      { status: 500 }
    );
  }
}

interface SlotGenerationParams {
  workingDays: any[];
  appointmentType: any;
  existingAppointments: any[];
  patientPreferences?: any;
  doctorConfig: {
    bufferTime: number;
    defaultDuration: number;
  };
}

async function generateIntelligentSlots(params: SlotGenerationParams) {
  const slots = [];
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + (params.patientPreferences?.maxWaitDays || 30));
  
  // Iterate through dates
  for (let date = new Date(today); date <= maxDate; date.setDate(date.getDate() + 1)) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find working day config
    const workingDay = params.workingDays.find(
      wd => wd.day_of_week === dayName && wd.is_working
    );
    
    if (!workingDay) continue;
    
    // Generate time slots for this day
    const daySlots = generateDaySlots(
      date,
      workingDay,
      params.appointmentType.default_duration,
      params.doctorConfig.bufferTime,
      params.existingAppointments
    );
    
    slots.push(...daySlots);
  }
  
  // Filter by patient preferences
  let filteredSlots = slots;
  
  if (params.patientPreferences?.preferredTimes) {
    filteredSlots = filteredSlots.filter(slot => {
      const slotHour = new Date(slot.datetime).getHours();
      return params.patientPreferences.preferredTimes.some((prefTime: string) => {
        const [hour] = prefTime.split(':').map(Number);
        return Math.abs(slotHour - hour) <= 1; // Within 1 hour of preference
      });
    });
  }
  
  return filteredSlots.slice(0, 20); // Return top 20 slots
}

function generateDaySlots(
  date: Date,
  workingDay: any,
  duration: number,
  bufferTime: number,
  existingAppointments: any[]
) {
  const slots = [];
  const [startHour, startMin] = workingDay.start_time.split(':').map(Number);
  const [endHour, endMin] = workingDay.end_time.split(':').map(Number);
  
  let currentTime = new Date(date);
  currentTime.setHours(startHour, startMin, 0, 0);
  
  const endTime = new Date(date);
  endTime.setHours(endHour, endMin, 0, 0);
  
  while (currentTime < endTime) {
    // Check if slot conflicts with existing appointment
    const hasConflict = existingAppointments.some(apt => {
      const aptDate = new Date(apt.appointment_date);
      const [aptHour, aptMin] = apt.time.split(':').map(Number);
      const aptTime = new Date(aptDate);
      aptTime.setHours(aptHour, aptMin, 0, 0);
      
      return (
        aptDate.toDateString() === date.toDateString() &&
        Math.abs(currentTime.getTime() - aptTime.getTime()) < duration * 60 * 1000
      );
    });
    
    if (!hasConflict) {
      slots.push({
        datetime: new Date(currentTime),
        duration,
        available: true,
      });
    }
    
    // Move to next slot
    currentTime.setMinutes(currentTime.getMinutes() + duration + bufferTime);
  }
  
  return slots;
}
```

---

## 📊 Part 5: Feature Comparison & Implementation Priority

### 5.1 Scheduling Features - Priority Matrix

| Feature | Priority | Complexity | Impact | Timeline |
|---------|----------|------------|--------|----------|
| **Schedule Templates** | 🔴 CRITICAL | Medium | Very High | Week 1-2 |
| **Multi-Facility Support** | 🔴 CRITICAL | High | Very High | Week 2-4 |
| **Intelligent Slot Suggestions** | 🟡 HIGH | Medium | High | Week 3-4 |
| **Appointment Type Management** | 🟡 HIGH | Low | High | Week 1 |
| **Recurring Appointments** | 🟡 HIGH | Medium | Medium | Week 4-5 |
| **Waitlist Management** | 🟢 MEDIUM | Medium | Medium | Week 5-6 |
| **Smart Scheduling Rules** | 🟢 MEDIUM | High | High | Week 6-8 |
| **Cross-Facility Conflict Detection** | 🟡 HIGH | Medium | High | Week 3-4 |
| **Auto-fill from Waitlist** | 🟢 MEDIUM | Medium | Medium | Week 7 |
| **Predictive No-show Handling** | 🔵 LOW | High | Medium | Week 10+ |
| **AI-Powered Optimization** | 🔵 LOW | Very High | High | Week 12+ |

### 5.2 Multi-Tenant Features - Priority Matrix

| Feature | Priority | Complexity | Impact | Timeline |
|---------|----------|------------|--------|----------|
| **Subdomain Routing** | 🔴 CRITICAL | Medium | Very High | Week 1 |
| **Facility Model & DB** | 🔴 CRITICAL | Low | Very High | Week 1 |
| **Facility Context Provider** | 🔴 CRITICAL | Low | Very High | Week 1 |
| **Dynamic Branding** | 🟡 HIGH | Medium | High | Week 2 |
| **Facility Admin Portal** | 🟡 HIGH | Medium | High | Week 3-4 |
| **Super Admin Portal** | 🟡 HIGH | Medium | High | Week 3-4 |
| **Multi-Facility Data Isolation** | 🔴 CRITICAL | High | Very High | Week 2-3 |
| **Facility-Specific Analytics** | 🟢 MEDIUM | Medium | Medium | Week 5-6 |
| **Custom Domain Support** | 🔵 LOW | High | Low | Week 10+ |

---

## 🚀 Part 6: 8-Week Implementation Roadmap

### **Week 1: Foundation - Multi-Tenant Setup**
**Goals:** Get subdomain routing and facility isolation working

- [ ] Create Facility model in Prisma schema
- [ ] Create FacilityAdmin, DoctorFacility, PatientFacility models
- [ ] Run database migrations
- [ ] Implement subdomain extraction middleware
- [ ] Create facility context provider
- [ ] Test subdomain routing locally (test.localhost:3000)
- [ ] Build facility-aware database utilities
- [ ] Update authentication to support facility context

**Deliverable:** Subdomain routing works, facilities can be created

---

### **Week 2: Multi-Facility Doctor Support**
**Goals:** Doctors can work at multiple facilities

- [ ] Implement DoctorFacility relationship
- [ ] Create API: `/api/doctors/[id]/facilities` (list, add, remove)
- [ ] Create FacilityWorkingDays model
- [ ] Build multi-facility schedule setup UI
- [ ] Implement facility switcher component
- [ ] Update appointment model to include facility_id
- [ ] Test doctor with multiple facilities

**Deliverable:** Doctors can be added to multiple facilities

---

### **Week 3: Enhanced Scheduling - Templates & Types**
**Goals:** Make scheduling setup easier

- [ ] Create AppointmentType model
- [ ] Build appointment type management UI
- [ ] Create ScheduleTemplate model
- [ ] Build schedule template creator
- [ ] Implement "Apply Template" functionality
- [ ] Build scheduling rule engine foundation
- [ ] Test template system

**Deliverable:** Doctors can create and apply schedule templates

---

### **Week 4: Intelligent Scheduling**
**Goals:** Smart slot suggestions and conflict detection

- [ ] Implement `/api/v2/scheduling/suggest-slots` endpoint
- [ ] Build intelligent slot generation algorithm
- [ ] Implement cross-facility conflict detection
- [ ] Create unified calendar view component
- [ ] Build per-facility schedule view
- [ ] Implement scheduling rules (basic)
- [ ] Test smart scheduling

**Deliverable:** System suggests optimal appointment slots

---

### **Week 5: Recurring Appointments & Waitlist**
**Goals:** Support recurring appointments and waitlist

- [ ] Add recurrence fields to Appointment model
- [ ] Build recurring appointment creation UI
- [ ] Implement recurrence logic
- [ ] Create Waitlist model
- [ ] Build waitlist management UI
- [ ] Implement waitlist notification system
- [ ] Test recurring appointments and waitlist

**Deliverable:** Patients can book recurring appointments, waitlist works

---

### **Week 6: Facility Admin Portal**
**Goals:** Facility admins can manage their facility

- [ ] Create facility admin role and permissions
- [ ] Build facility admin dashboard
- [ ] Implement facility settings page
- [ ] Build branding customization UI
- [ ] Create facility user management (add/remove doctors, staff)
- [ ] Implement facility analytics dashboard
- [ ] Test facility admin workflows

**Deliverable:** Facility admins have full facility management

---

### **Week 7: Super Admin Portal**
**Goals:** Super admin can manage all facilities

- [ ] Build super admin dashboard (admin.ihosi.com)
- [ ] Create facility creation wizard
- [ ] Implement facility admin assignment
- [ ] Build system-wide analytics
- [ ] Create facility billing management (if needed)
- [ ] Implement facility status management (active/suspended)
- [ ] Test super admin workflows

**Deliverable:** Super admin can create and manage facilities

---

### **Week 8: Polish, Testing & Deployment**
**Goals:** Production-ready system

- [ ] Comprehensive testing (unit, integration, e2e)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation updates
- [ ] Deployment preparation
- [ ] DNS configuration for subdomains
- [ ] Staging environment testing
- [ ] Production deployment
- [ ] User training materials

**Deliverable:** System is production-ready

---

## 🎯 Part 7: Quick Start - Immediate Next Steps

### Step 1: Update Prisma Schema (Today)

```bash
# Add new models to prisma/schema.prisma
# Copy the schema from Part 2 above

# Generate migration
npx prisma migrate dev --name add_multi_facility_support

# Push to database
npx prisma generate
```

### Step 2: Create Middleware (Today)

```bash
# Create middleware.ts in project root
# Copy code from Part 4.1 above
```

### Step 3: Create Facility Context (Today)

```bash
# Create lib/facility-context.tsx
# Copy code from Part 4.2 above

# Update app/layout.tsx to wrap with FacilityProvider
```

### Step 4: Test Locally (Tomorrow)

```bash
# Add to /etc/hosts (Mac/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1 test.localhost
127.0.0.1 admin.localhost

# Run app
npm run dev

# Test:
# http://test.localhost:3000 → should show facility-specific view
# http://admin.localhost:3000 → should show super admin
```

### Step 5: Create First Facility (Tomorrow)

```sql
-- Manually insert test facility
INSERT INTO "Facility" (
  id, name, slug, facility_code, 
  address, city, state, zip_code, 
  phone, email, status
) VALUES (
  'fac_001', 
  'Test Medical Center', 
  'test', 
  'TMC001',
  '123 Medical Dr', 
  'Boston', 
  'MA', 
  '02101',
  '555-0100', 
  'admin@test.ihosi.com',
  'ACTIVE'
);
```

---

## 📚 Part 8: Additional Resources

### Recommended Reading:
1. **Multi-Tenant Architecture Patterns** - AWS Well-Architected Framework
2. **Healthcare Scheduling Optimization** - NCBI Research Papers
3. **HIPAA Compliance for Multi-Tenant Systems** - HHS.gov Guidelines

### Tools to Explore:
1. **Vercel Multi-Zone** - For subdomain routing (if using Vercel)
2. **Clerk** - Multi-tenant auth (alternative to current system)
3. **Supabase Row Level Security** - For database-level tenant isolation
4. **Segment** - Multi-tenant analytics

### Reference Systems:
1. **Zocdoc** - Study their scheduling UX
2. **Epic MyChart** - Enterprise scheduling features
3. **Calendly** - Excellent UX patterns
4. **Athenahealth** - Multi-facility workflows

---

## ❓ Part 9: FAQ

### **Q: Should I use shared database or separate databases per facility?**
**A:** Start with shared database (easier to build, maintain, and allows cross-facility analytics). Only move to separate databases if:
- Specific facilities have strict data residency requirements
- Very large facilities need dedicated resources
- Regulatory requirements mandate separation

### **Q: How do I handle a doctor working at facilities on different continents?**
**A:** Store timezone per facility. In the unified calendar view, convert all times to doctor's preferred timezone or show times in each facility's local timezone with clear labels.

### **Q: What if two facilities book the same doctor at the same time?**
**A:** Implement real-time conflict detection:
1. When booking, check all facilities for conflicts
2. If conflict found, show warning and suggest alternative times
3. Optionally, implement a "lock" mechanism during booking process

### **Q: How do I migrate existing data to multi-facility structure?**
**A:** Create a default "Main Facility" and migrate all existing data to it. Then gradually add new facilities.

### **Q: Can a patient be registered at multiple facilities?**
**A:** Yes! PatientFacility allows many-to-many relationship. Patient has different patient numbers at each facility but unified medical history.

---

## 🏁 Conclusion

You now have a **complete architecture** for:

1. ✅ **Enterprise-grade scheduling** with templates, rules, and intelligence
2. ✅ **Multi-facility support** with unified doctor schedules
3. ✅ **Multi-tenant system** with subdomain-based isolation
4. ✅ **Facility branding** and customization
5. ✅ **Clear role hierarchy** and permissions

**Next Step:** Review this document with your team, prioritize features, and start with Week 1 tasks.

---

**Document Status:** Ready for Implementation
**Estimated Development Time:** 8-12 weeks (depending on team size)
**Risk Level:** Medium (requires careful database design and testing)
**Recommended Team:** 2-3 developers

---

**END OF DOCUMENT**

