# 🚀 iHosi Mobile App - React Native Implementation Plan

## 🎯 **Vision Statement**

Create a **native mobile application** (iOS & Android) that provides patients and doctors with on-the-go access to core healthcare management functionality, leveraging the existing backend infrastructure.

---

## ✅ **Requirements Understanding**

### **Patient Mobile App Features:**
```
✅ Authentication (Login/Logout)
✅ Patient Portal/Dashboard
   ├─ Profile management
   ├─ Appointment booking
   ├─ View appointments (upcoming & past)
   ├─ View medical records
   ├─ View prescriptions
   ├─ View vitals
   ├─ Billing & payments
   └─ Notifications

✅ Booking System
   ├─ Browse available doctors
   ├─ View doctor availability
   ├─ Select time slots
   ├─ Book appointments
   └─ Receive confirmations

✅ Appointment Management
   ├─ View upcoming appointments
   ├─ View past consultations
   ├─ View consultation details
   ├─ Download prescriptions
   └─ Receive reminders
```

### **Doctor Mobile App Features:**
```
✅ Authentication (Login/Logout)
✅ Doctor Dashboard
   ├─ Today's schedule
   ├─ Pending appointment requests
   ├─ Patient statistics
   └─ Quick actions

✅ Scheduling & Availability
   ├─ Set weekly schedule (visual painter)
   ├─ Toggle availability (AVAILABLE/BUSY)
   ├─ View calendar (month/week/day)
   └─ Accept/reject appointments

✅ Appointment Management
   ├─ View upcoming appointments
   ├─ Start consultation
   ├─ Record vitals
   ├─ Add diagnosis
   ├─ Write prescriptions
   └─ Complete consultation

✅ Clinical Tools
   ├─ Note taking (SOAP notes)
   ├─ Patient profile access
   ├─ Medical history review
   └─ Clinical documentation

✅ Tasks & Reminders
   ├─ Appointment reminders
   ├─ Follow-up tasks
   ├─ Pending actions
   └─ Notifications

✅ Payment Integration
   ├─ View invoices
   ├─ Payment history
   └─ Financial summary
```

---

## 🏗️ **Architecture Overview**

### **Technology Stack:**

```
Mobile Frontend:
├─ React Native (iOS & Android)
├─ Expo (for faster development & deployment)
├─ TypeScript (type safety)
├─ React Navigation (routing)
├─ React Query / TanStack Query (API state management)
├─ Zustand or Redux (global state)
├─ React Native Paper (UI components)
└─ Axios (API calls)

Backend:
├─ Existing Next.js API routes (REUSE!)
├─ PostgreSQL database (SAME!)
├─ Prisma ORM (SAME!)
└─ Authentication system (SAME!)
```

### **Key Principle: API-First Approach**

```
┌─────────────────────────────────────────────────────────┐
│              React Native Mobile App                     │
│  ┌─────────────┐         ┌──────────────┐             │
│  │ Patient App │         │  Doctor App  │             │
│  └─────────────┘         └──────────────┘             │
└─────────────────────────────────────────────────────────┘
                          │
                     HTTP/HTTPS
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│           Existing Backend (Next.js + API)              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  /api/auth/*          - Authentication           │  │
│  │  /api/appointments/*  - Appointment management   │  │
│  │  /api/scheduling/*    - Scheduling & availability│  │
│  │  /api/doctors/*       - Doctor operations        │  │
│  │  /api/patients/*      - Patient operations       │  │
│  │  /api/medical/*       - Clinical data            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Shared)               │
└─────────────────────────────────────────────────────────┘
```

**Advantage:** 
- ✅ No backend changes needed!
- ✅ Reuse all existing APIs
- ✅ Shared database
- ✅ Consistent business logic
- ✅ Easier maintenance

---

## 📱 **Mobile App Structure**

### **Project Structure:**
```
iHosi-mobile/
├── app/                          # Main app code
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   │
│   ├── (patient)/                # Patient app screens
│   │   ├── dashboard.tsx
│   │   ├── appointments/
│   │   │   ├── index.tsx         # List appointments
│   │   │   ├── [id].tsx          # Appointment details
│   │   │   └── book.tsx          # Book new appointment
│   │   ├── booking/
│   │   │   ├── select-doctor.tsx
│   │   │   ├── select-time.tsx
│   │   │   └── confirm.tsx
│   │   ├── medical-records/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── prescriptions/
│   │   │   └── index.tsx
│   │   ├── billing/
│   │   │   ├── invoices.tsx
│   │   │   └── payments.tsx
│   │   └── profile.tsx
│   │
│   ├── (doctor)/                 # Doctor app screens
│   │   ├── dashboard.tsx
│   │   ├── schedule/
│   │   │   ├── calendar.tsx      # Calendar view
│   │   │   └── setup.tsx         # Availability setup
│   │   ├── appointments/
│   │   │   ├── index.tsx         # List appointments
│   │   │   ├── [id].tsx          # Appointment details
│   │   │   ├── pending.tsx       # Pending requests
│   │   │   └── consultation.tsx  # Active consultation
│   │   ├── patients/
│   │   │   ├── index.tsx         # Patient list
│   │   │   └── [id].tsx          # Patient profile
│   │   ├── tasks/
│   │   │   └── index.tsx         # Tasks & reminders
│   │   └── profile.tsx
│   │
│   └── _layout.tsx               # Root layout
│
├── components/                   # Reusable components
│   ├── ui/                       # UI primitives
│   ├── patient/                  # Patient-specific
│   ├── doctor/                   # Doctor-specific
│   └── shared/                   # Shared components
│
├── services/                     # API services
│   ├── api.ts                    # API client
│   ├── auth.service.ts
│   ├── appointment.service.ts
│   ├── scheduling.service.ts
│   ├── medical.service.ts
│   └── payment.service.ts
│
├── hooks/                        # Custom hooks
│   ├── useAuth.ts
│   ├── useAppointments.ts
│   ├── useSchedule.ts
│   └── useMedicalRecords.ts
│
├── store/                        # State management
│   ├── authStore.ts
│   ├── appointmentStore.ts
│   └── scheduleStore.ts
│
├── types/                        # TypeScript types
│   ├── patient.types.ts
│   ├── doctor.types.ts
│   ├── appointment.types.ts
│   └── medical.types.ts
│
├── utils/                        # Utilities
│   ├── api-client.ts
│   ├── date-helpers.ts
│   └── validators.ts
│
└── config/
    ├── api-config.ts             # API endpoints
    └── app-config.ts             # App configuration
```

---

## 📊 **Screen Mapping: Web → Mobile**

### **Patient Screens:**

| Web Page | Mobile Screen | Priority |
|----------|---------------|----------|
| `/patient` | `dashboard.tsx` | 🔴 P1 |
| `/record/appointments` | `appointments/index.tsx` | 🔴 P1 |
| `/record/appointments/[id]` | `appointments/[id].tsx` | 🔴 P1 |
| Book appointment flow | `booking/*` (3 screens) | 🔴 P1 |
| `/record/medical-records` | `medical-records/index.tsx` | 🟡 P2 |
| Prescriptions view | `prescriptions/index.tsx` | 🟡 P2 |
| Billing | `billing/invoices.tsx` | 🟡 P2 |
| Payments | `billing/payments.tsx` | 🟡 P2 |
| Profile | `profile.tsx` | 🟢 P3 |

**Total:** 8-10 core screens

---

### **Doctor Screens:**

| Web Feature | Mobile Screen | Priority |
|-------------|---------------|----------|
| `/doctor` dashboard | `dashboard.tsx` | 🔴 P1 |
| Modern scheduling calendar | `schedule/calendar.tsx` | 🔴 P1 |
| Availability setup | `schedule/setup.tsx` | 🔴 P1 |
| Appointments list | `appointments/index.tsx` | 🔴 P1 |
| Pending requests | `appointments/pending.tsx` | 🔴 P1 |
| Appointment details | `appointments/[id].tsx` | 🔴 P1 |
| Consultation interface | `appointments/consultation.tsx` | 🔴 P1 |
| Patient list | `patients/index.tsx` | 🟡 P2 |
| Patient profile | `patients/[id].tsx` | 🟡 P2 |
| Tasks & reminders | `tasks/index.tsx` | 🟡 P2 |
| Profile & settings | `profile.tsx` | 🟢 P3 |

**Total:** 11-13 core screens

---

## 🔌 **API Integration Strategy**

### **Existing APIs to Leverage:**

```typescript
Authentication:
✅ POST /api/auth/login
✅ POST /api/auth/logout
✅ POST /api/auth/refresh-token
✅ GET /api/auth/verify

Patient APIs:
✅ GET /api/patients/dashboard
✅ GET /api/appointments (filtered by patient)
✅ POST /api/scheduling/appointments (book appointment)
✅ GET /api/doctors (available doctors)
✅ POST /api/scheduling/availability/slots (get time slots)
✅ GET /api/medical-records
✅ GET /api/prescriptions
✅ GET /api/billing/invoices
✅ GET /api/billing/payments

Doctor APIs:
✅ GET /api/doctors/[id]/schedule (get schedule)
✅ PUT /api/doctors/[id]/schedule (update schedule)
✅ PATCH /api/doctors/availability (toggle availability)
✅ GET /api/appointments (filtered by doctor)
✅ POST /api/appointments/action (accept/reject)
✅ POST /api/consultation/start (start consultation)
✅ POST /api/consultation/complete (complete consultation)
✅ POST /api/vitals (add vital signs)
✅ POST /api/diagnosis (add diagnosis)
✅ GET /api/patients/[id] (patient profile)

Scheduling APIs:
✅ GET /api/scheduling/availability
✅ POST /api/scheduling/availability/slots
✅ GET /api/doctors/available-times
```

**API Client Setup:**
```typescript
// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-url.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try refresh or logout
      await handleTokenRefresh();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 📱 **Mobile App Features Breakdown**

### **Phase 1: Core Patient Features** (3-4 weeks)

#### **1.1 Authentication (Week 1)**
```
Screens:
├─ LoginScreen
├─ RegisterScreen (if self-registration allowed)
└─ ForgotPasswordScreen

Features:
✅ Email/password login
✅ Token storage (AsyncStorage)
✅ Biometric authentication (Face ID/Touch ID)
✅ Auto-login on app open
✅ Secure token handling

APIs:
- POST /api/auth/login
- POST /api/auth/refresh-token
- POST /api/auth/logout
```

#### **1.2 Patient Dashboard (Week 1)**
```
Components:
├─ Header (welcome message)
├─ Quick Stats Cards
│   ├─ Upcoming appointments
│   ├─ Total appointments
│   └─ Pending bills
├─ Recent Vitals Widget
├─ Upcoming Appointments List
├─ Quick Actions
│   ├─ Book Appointment
│   ├─ View Records
│   └─ Pay Bills
└─ Available Doctors

APIs:
- GET /api/patients/dashboard
- GET /api/appointments?patientId=X
- GET /api/vitals/recent?patientId=X
```

#### **1.3 Appointment Booking (Week 2)**
```
Screens (3-step wizard):
├─ 1. SelectDoctorScreen
│   └─ Search, filter by specialization
├─ 2. SelectTimeSlotScreen
│   └─ Calendar picker + time slots
└─ 3. ConfirmBookingScreen
    └─ Review and confirm

Features:
✅ Doctor search and filtering
✅ View doctor availability
✅ Visual time slot picker
✅ Appointment type selection
✅ Add notes/reason
✅ Confirmation screen

APIs:
- GET /api/doctors
- POST /api/scheduling/availability/slots
- POST /api/scheduling/appointments
```

#### **1.4 View Appointments (Week 2)**
```
Screens:
├─ AppointmentsListScreen
│   ├─ Tabs: Upcoming | Past | Cancelled
│   └─ Search and filter
└─ AppointmentDetailsScreen
    ├─ Appointment info
    ├─ Doctor details
    ├─ Status tracking
    ├─ Vitals (if completed)
    ├─ Diagnosis (if completed)
    └─ Billing

Features:
✅ List view with status badges
✅ Pull to refresh
✅ Status-based filtering
✅ Swipe actions (cancel, reschedule)
✅ Detailed appointment view

APIs:
- GET /api/appointments?patientId=X&status=Y
- GET /api/appointments/[id]
- POST /api/appointments/cancel
```

#### **1.5 Medical Records & Billing (Week 3)**
```
Screens:
├─ MedicalRecordsScreen
├─ PrescriptionsScreen
├─ InvoicesScreen
└─ PaymentsScreen

Features:
✅ View medical history
✅ Download prescriptions
✅ View invoices
✅ Payment integration
✅ PDF viewer for documents

APIs:
- GET /api/medical-records?patientId=X
- GET /api/prescriptions?patientId=X
- GET /api/billing/invoices?patientId=X
- POST /api/billing/payments
```

#### **1.6 Notifications & Profile (Week 3-4)**
```
Screens:
├─ NotificationsScreen
└─ ProfileScreen

Features:
✅ Push notifications
✅ In-app notifications
✅ Profile management
✅ Settings
✅ Privacy controls

APIs:
- GET /api/notifications
- PUT /api/patients/profile
- GET /api/patients/settings
```

---

### **Phase 2: Core Doctor Features** (4-5 weeks)

#### **2.1 Doctor Dashboard (Week 4)**
```
Components:
├─ Header with availability toggle
├─ Today's Schedule
├─ Pending Requests Badge
├─ Quick Stats
│   ├─ Today's appointments
│   ├─ Pending requests
│   └─ Completion rate
├─ Next Appointment Card
└─ Quick Actions
    ├─ View Calendar
    ├─ Set Schedule
    └─ View Patients

APIs:
- GET /api/doctors/dashboard
- GET /api/appointments?doctorId=X&date=today
- PATCH /api/doctors/availability
```

#### **2.2 Scheduling & Availability (Week 5)**
```
Screens:
├─ CalendarScreen
│   ├─ Month/Week/Day views
│   └─ Time slot visualization
└─ AvailabilitySetupScreen
    ├─ Visual painter (mobile-optimized)
    └─ Quick presets

Features:
✅ Mobile-optimized calendar
✅ Touch-friendly time picker
✅ Swipe between dates
✅ Paint availability (touch & drag)
✅ Quick preset buttons
✅ Save schedule

APIs:
- GET /api/doctors/[id]/schedule
- PUT /api/doctors/[id]/schedule
- GET /api/scheduling/availability
```

#### **2.3 Appointment Management (Week 6)**
```
Screens:
├─ AppointmentsListScreen
│   ├─ Tabs: Pending | Today | Upcoming | Past
│   └─ Quick accept/reject
├─ AppointmentDetailsScreen
│   └─ Full details with actions
└─ PendingRequestsScreen
    └─ Swipe to accept/reject

Features:
✅ Pending appointment list
✅ Quick accept/reject (swipe gestures)
✅ View appointment details
✅ Start consultation button
✅ Complete consultation button

APIs:
- GET /api/appointments?doctorId=X&status=PENDING
- POST /api/appointments/action (ACCEPT/REJECT)
- POST /api/consultation/start
- POST /api/consultation/complete
```

#### **2.4 Clinical Tools (Week 7-8)**
```
Screens:
├─ ConsultationScreen
│   ├─ Patient info sidebar
│   ├─ Vital signs form
│   ├─ SOAP notes editor
│   ├─ Diagnosis entry
│   └─ Prescription pad
├─ PatientProfileScreen
│   ├─ Medical history
│   ├─ Allergies
│   └─ Previous consultations
└─ NoteTakingScreen
    └─ Voice-to-text support

Features:
✅ Record vital signs
✅ Add diagnosis
✅ Write prescriptions
✅ SOAP notes
✅ Voice dictation
✅ Quick templates

APIs:
- POST /api/vitals
- POST /api/diagnosis
- POST /api/prescriptions
- GET /api/patients/[id]
- GET /api/medical-records?patientId=X
```

#### **2.5 Tasks & Reminders (Week 8)**
```
Screens:
├─ TasksScreen
│   ├─ Today's tasks
│   ├─ Overdue tasks
│   └─ Completed tasks
└─ RemindersScreen
    └─ Appointment reminders

Features:
✅ Task list
✅ Task completion
✅ Reminder notifications
✅ Push notifications

APIs:
- GET /api/tasks?doctorId=X
- PUT /api/tasks/[id]
- GET /api/reminders
```

---

## 🔐 **Authentication Flow**

```
Mobile App Launch
  ↓
Check AsyncStorage for token
  ├─ Token exists? → Verify with backend
  │   ├─ Valid? → Auto-login → Dashboard
  │   └─ Invalid? → Show login screen
  └─ No token? → Show login screen
  
Login Screen
  ↓
User enters credentials
  ↓
POST /api/auth/login
  ↓
Receive:
├─ Access token
├─ Refresh token
├─ User data (role, name, etc.)
└─ Session info
  ↓
Store in AsyncStorage:
├─ auth-token
├─ refresh-token
├─ user-data
└─ user-role
  ↓
Navigate based on role:
├─ PATIENT → Patient Dashboard
└─ DOCTOR → Doctor Dashboard
```

**Token Refresh Strategy:**
```typescript
// Auto-refresh before expiry
setInterval(async () => {
  const token = await getStoredToken();
  if (isTokenExpiringSoon(token)) {
    await refreshToken();
  }
}, 5 * 60 * 1000); // Check every 5 minutes
```

---

## 🎨 **Mobile UI/UX Considerations**

### **Design Principles:**

1. **Touch-First Design**
   - Large touch targets (min 44x44 points)
   - Swipe gestures for common actions
   - Bottom navigation for main tabs
   - Pull-to-refresh everywhere

2. **Mobile-Optimized Layouts**
   - Single column layouts
   - Collapsible sections
   - Bottom sheets for forms
   - Native date/time pickers

3. **Offline Support (Future)**
   - Cache recent data
   - Queue actions when offline
   - Sync when online
   - Clear offline indicators

4. **Performance**
   - Lazy loading
   - Image optimization
   - List virtualization
   - Efficient re-renders

5. **Accessibility**
   - Screen reader support
   - High contrast mode
   - Large text support
   - Voice control ready

---

## 📦 **Key Mobile Components**

### **Shared Components:**

```typescript
// AppointmentCard.tsx
- Compact appointment display
- Status badge
- Swipe actions (accept/reject for doctors)
- Tap to view details

// DoctorCard.tsx
- Doctor photo, name, specialization
- Availability indicator
- Rating display
- Tap to select

// TimeSlotPicker.tsx
- Mobile-friendly time slot grid
- Touch-optimized selection
- Visual availability
- Disabled past slots

// VitalSignsForm.tsx
- Number pad optimized
- Quick fill buttons (Normal, High, Low)
- Units displayed clearly
- Save/cancel actions

// CalendarView.tsx
- Native calendar picker
- Month/Week/Day views
- Appointment indicators
- Touch navigation
```

---

## 🔄 **Data Synchronization**

### **Real-time Updates:**

```typescript
// Using React Query for caching and auto-refresh
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Example: Appointments list
function useAppointments(patientId: string) {
  return useQuery({
    queryKey: ['appointments', patientId],
    queryFn: () => appointmentService.getAppointments(patientId),
    refetchInterval: 30000, // Refetch every 30s
    staleTime: 10000, // Consider data stale after 10s
  });
}

// Example: Book appointment with optimistic update
function useBookAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: appointmentService.bookAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      queryClient.invalidateQueries(['doctors']);
    },
  });
}
```

---

## 📲 **Push Notifications**

### **Setup:**
```typescript
// Using Expo Notifications or Firebase Cloud Messaging

Notification Types:
├─ Appointment accepted/rejected
├─ Appointment reminders (24h, 1h)
├─ Consultation completed
├─ New prescription available
├─ Payment due
├─ New pending appointment (for doctors)
└─ Emergency alerts

Implementation:
1. Register device for push notifications
2. Send device token to backend
3. Backend sends notifications via FCM/APNs
4. App receives and displays
5. Tap notification → Navigate to relevant screen
```

---

## 🗓️ **Implementation Timeline**

### **Phase 1: Patient Mobile App (3-4 weeks)**

**Week 1: Foundation**
- [ ] Project setup (Expo + React Native)
- [ ] Authentication screens
- [ ] API client configuration
- [ ] Navigation structure
- [ ] Basic dashboard

**Week 2: Core Booking**
- [ ] Doctor list screen
- [ ] Time slot picker
- [ ] Booking flow (3 screens)
- [ ] Booking confirmation
- [ ] Push notification setup

**Week 3: Appointments & Records**
- [ ] Appointments list
- [ ] Appointment details
- [ ] Medical records view
- [ ] Prescriptions view
- [ ] Recent vitals widget

**Week 4: Billing & Polish**
- [ ] Invoices screen
- [ ] Payments screen
- [ ] Profile management
- [ ] Settings
- [ ] Testing & bug fixes

---

### **Phase 2: Doctor Mobile App (4-5 weeks)**

**Week 5: Foundation**
- [ ] Doctor dashboard
- [ ] Availability toggle
- [ ] Stats cards
- [ ] Today's schedule
- [ ] Navigation

**Week 6: Scheduling**
- [ ] Visual availability setup (mobile-optimized)
- [ ] Calendar views (month/week/day)
- [ ] Quick preset buttons
- [ ] Touch-friendly painter
- [ ] Schedule saving

**Week 7: Appointments**
- [ ] Pending requests screen
- [ ] Appointments list
- [ ] Accept/reject flow
- [ ] Appointment details
- [ ] Start consultation button

**Week 8: Clinical Tools**
- [ ] Consultation screen
- [ ] Vital signs recorder
- [ ] Diagnosis entry
- [ ] Prescription pad
- [ ] Complete consultation flow

**Week 9: Advanced Features**
- [ ] Patient profile view
- [ ] Medical history access
- [ ] Tasks & reminders
- [ ] Voice dictation
- [ ] Testing & polish

---

## 💰 **Payment Integration**

### **Mobile Payment Options:**

```typescript
Payment Methods:
├─ Credit/Debit Card (Stripe)
├─ Mobile Wallets
│   ├─ Apple Pay
│   ├─ Google Pay
│   └─ Samsung Pay
├─ Insurance claim submission
└─ Cash (mark as paid)

Implementation:
- Stripe SDK for React Native
- Apple Pay / Google Pay native modules
- Payment confirmation screens
- Receipt generation
- Payment history
```

---

## 🔧 **Technical Specifications**

### **Development Tools:**

```
Framework: React Native + Expo
├─ Expo SDK 50+
├─ Expo Router (file-based routing)
├─ Expo notifications
├─ Expo SecureStore (token storage)
└─ Expo Camera (for future features)

State Management:
├─ React Query (server state)
├─ Zustand (client state)
└─ React Context (auth, theme)

UI Library:
├─ React Native Paper (Material Design)
├─ React Native Elements (alternative)
└─ Custom components (matching web theme)

Navigation:
├─ Expo Router or React Navigation
├─ Stack navigation (main flow)
├─ Tab navigation (bottom tabs)
└─ Drawer navigation (side menu)

Utilities:
├─ date-fns (date handling)
├─ yup or zod (validation)
├─ react-hook-form (forms)
└─ axios (API calls)
```

---

## 📁 **Recommended File Structure**

```
iHosi-mobile/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   │
│   ├── (patient)/
│   │   ├── _layout.tsx           # Bottom tabs
│   │   ├── index.tsx              # Dashboard
│   │   ├── appointments.tsx
│   │   ├── booking/
│   │   │   ├── step1-doctor.tsx
│   │   │   ├── step2-time.tsx
│   │   │   └── step3-confirm.tsx
│   │   ├── records.tsx
│   │   ├── billing.tsx
│   │   └── profile.tsx
│   │
│   ├── (doctor)/
│   │   ├── _layout.tsx           # Bottom tabs
│   │   ├── index.tsx              # Dashboard
│   │   ├── schedule.tsx
│   │   ├── appointments.tsx
│   │   ├── patients.tsx
│   │   └── tasks.tsx
│   │
│   └── _layout.tsx                # Root layout
│
├── src/
│   ├── components/
│   │   ├── ui/                    # Base components
│   │   ├── patient/
│   │   ├── doctor/
│   │   └── shared/
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── auth.ts
│   │   │   ├── appointments.ts
│   │   │   ├── scheduling.ts
│   │   │   └── medical.ts
│   │   └── notifications.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useAppointments.ts
│   │   └── useSchedule.ts
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   └── appStore.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   └── utils/
│       ├── api-client.ts
│       └── helpers.ts
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── app.json                       # Expo config
├── package.json
└── tsconfig.json
```

---

## 🎯 **Feature Comparison: Web vs Mobile**

| Feature | Web | Mobile | Notes |
|---------|-----|--------|-------|
| Patient booking | ✅ Full | ✅ Full | Mobile: 3-step wizard |
| Doctor scheduling | ✅ Desktop | ✅ Touch | Mobile: Touch painter |
| Calendar views | ✅ 3 views | ✅ 3 views | Mobile: Swipe navigation |
| Vital signs entry | ✅ Form | ✅ Form | Mobile: Number pad optimized |
| Diagnosis entry | ✅ Form | ✅ Form | Mobile: Voice-to-text option |
| Payment | ✅ Stripe | ✅ Stripe + Wallets | Mobile: Apple/Google Pay |
| Offline mode | ❌ No | 🟡 Future | Mobile advantage |
| Push notifications | ❌ No | ✅ Yes | Mobile advantage |
| Biometric auth | ❌ No | ✅ Yes | Mobile advantage |
| Camera access | ❌ No | ✅ Yes | Mobile: Scan documents |

---

## 📊 **Development Estimates**

| Phase | Features | Screens | Time | Team Size |
|-------|----------|---------|------|-----------|
| Phase 1 | Patient App | 10-12 | 3-4 weeks | 1-2 devs |
| Phase 2 | Doctor App | 12-15 | 4-5 weeks | 1-2 devs |
| Phase 3 | Polish & Testing | N/A | 1-2 weeks | 2 devs |
| **Total** | **Complete Mobile App** | **22-27** | **8-11 weeks** | **1-2 devs** |

**With 2 developers working in parallel:**
- Patient app: 2-3 weeks
- Doctor app: 3-4 weeks
- **Total: 5-7 weeks**

---

## 🎯 **Mobile-Specific Features**

### **What Mobile Adds:**

1. **Push Notifications**
   - Real-time appointment updates
   - Reminder notifications
   - Emergency alerts

2. **Biometric Authentication**
   - Face ID / Touch ID
   - Faster login
   - More secure

3. **Camera Integration**
   - Scan insurance cards
   - Upload documents
   - Profile photos

4. **Offline Support** (Future)
   - View cached appointments
   - Queue actions
   - Sync when online

5. **Location Services** (Future)
   - Find nearby facilities
   - Navigate to appointment
   - Check-in on arrival

6. **Voice Features**
   - Voice-to-text for notes
   - Voice commands
   - Accessibility

---

## 🚀 **Getting Started**

### **Step 1: Project Initialization**
```bash
# Create Expo app with TypeScript
npx create-expo-app iHosi-mobile --template expo-template-blank-typescript

cd iHosi-mobile

# Install core dependencies
npx expo install expo-router
npx expo install @react-native-async-storage/async-storage
npx expo install expo-secure-store
npx expo install expo-notifications

# Install UI libraries
npm install react-native-paper
npm install @react-navigation/native
npm install @react-navigation/stack
npm install @react-navigation/bottom-tabs

# Install API & state management
npm install axios
npm install @tanstack/react-query
npm install zustand

# Install utilities
npm install date-fns
npm install react-hook-form
npm install zod
npm install @hookform/resolvers
```

### **Step 2: Configure API Base URL**
```typescript
// config/api-config.ts
export const API_CONFIG = {
  baseURL: __DEV__ 
    ? 'http://localhost:3000/api'  // Development
    : 'https://your-backend.onrender.com/api', // Production
  timeout: 10000,
};
```

### **Step 3: Setup Authentication Service**
```typescript
// services/auth.service.ts
import apiClient from './api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password });
    
    // Store tokens
    await AsyncStorage.setItem('auth-token', response.data.accessToken);
    await AsyncStorage.setItem('refresh-token', response.data.refreshToken);
    await AsyncStorage.setItem('user-data', JSON.stringify(response.data.user));
    
    return response.data;
  },
  
  async logout() {
    await AsyncStorage.multiRemove(['auth-token', 'refresh-token', 'user-data']);
  },
  
  async getStoredUser() {
    const userData = await AsyncStorage.getItem('user-data');
    return userData ? JSON.parse(userData) : null;
  }
};
```

---

## 📋 **Implementation Checklist**

### **Pre-Development:**
- [ ] Confirm backend APIs are accessible externally
- [ ] Setup CORS for mobile app
- [ ] Test APIs with Postman/Insomnia
- [ ] Decide: Expo or bare React Native
- [ ] Choose UI library (React Native Paper recommended)
- [ ] Setup development environment

### **Phase 1: Patient App (P1 Features):**
- [ ] Authentication (login, logout, token management)
- [ ] Patient dashboard with stats
- [ ] Booking flow (3-step wizard)
- [ ] Appointments list
- [ ] Appointment details
- [ ] Basic push notifications

### **Phase 2: Doctor App (P1 Features):**
- [ ] Doctor dashboard
- [ ] Availability setup (mobile painter)
- [ ] Calendar views
- [ ] Pending requests
- [ ] Accept/reject appointments
- [ ] Start/complete consultation

### **Phase 3: Clinical Features:**
- [ ] Vital signs entry
- [ ] Diagnosis entry
- [ ] SOAP notes
- [ ] Prescription writing
- [ ] Patient profile access

### **Phase 4: Polish:**
- [ ] Offline support
- [ ] Biometric auth
- [ ] Push notifications refinement
- [ ] Error handling
- [ ] Loading states
- [ ] Testing

---

## 🎯 **Critical Success Factors**

### **Must Haves:**
1. ✅ Reuse existing backend APIs (don't rebuild!)
2. ✅ Mobile-optimized UI/UX
3. ✅ Touch-friendly interactions
4. ✅ Role-based navigation
5. ✅ Secure authentication
6. ✅ Push notifications
7. ✅ Offline-first architecture (future)

### **Nice to Haves:**
- Voice dictation for doctors
- Camera integration
- Biometric authentication
- Location services
- Calendar integration (Google/Apple)
- Telemedicine (video calls)

---

## 📝 **Next Steps**

### **Option 1: I Create the Mobile App Foundation**
I can set up:
1. Project structure
2. Authentication flow
3. API integration
4. Basic screens for both patient and doctor
5. Navigation setup

**Timeline:** 2-3 days for foundation

### **Option 2: Detailed Design First**
I can create:
1. Screen mockups (ASCII/description)
2. Navigation flow diagrams
3. API endpoint mapping
4. Component specifications
5. Technical architecture document

**Then build after approval**

---

## 🎉 **Summary**

**What You Want:**
- ✅ React Native mobile app
- ✅ Patient features (booking, appointments, records, payments)
- ✅ Doctor features (scheduling, appointments, clinical tools, tasks)
- ✅ Leverages existing backend

**What I Recommend:**
- ✅ Use Expo for faster development
- ✅ Reuse ALL existing APIs (no backend changes)
- ✅ Mobile-first UI/UX design
- ✅ Phased rollout (patients first, then doctors)
- ✅ 8-11 weeks total timeline

**Key Advantage:**
- Your backend is **API-ready** ✅
- Database is **perfect** ✅
- Business logic is **solid** ✅
- Just need mobile UI layer! ✅

---

**Ready to proceed?** 

**Would you like me to:**
1. 🚀 Start building the mobile app foundation?
2. 📐 Create detailed screen designs first?
3. 🗺️ Create navigation flow diagrams?
4. 📱 Setup the initial Expo project structure?

Your backend is **perfect** for mobile - let's build on it! 🎯


