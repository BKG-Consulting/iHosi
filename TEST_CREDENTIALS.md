# 🧪 Test Credentials & Availability Testing Guide

## 📋 Test Accounts (After Running Updated Seed)

### 👨‍⚕️ **Doctor Accounts** (10 doctors)
```
Email:    doctor1@hospital.com to doctor10@hospital.com
Password: Doctor@123

Specializations (rotating):
- Cardiology
- Dermatology  
- Pediatrics
- Orthopedics
- Neurology

Availability Status:
- doctor1, doctor4, doctor7, doctor10: BUSY
- Others (doctor2, 3, 5, 6, 8, 9): AVAILABLE

Working Hours (All doctors):
- Monday to Friday: 9:00 AM - 5:00 PM
- Lunch Break: 12:00 PM - 1:00 PM
- Saturday & Sunday: OFF
- Appointment Duration: 30 minutes
- Buffer Time: 5 minutes
```

### 👤 **Patient Accounts** (20 patients)
```
Email:    patient1@email.com to patient20@email.com
Password: Patient@123
```

---

## 🔄 How to Re-Seed Database

### Step 1: Reset Database
```bash
# Option A: Reset everything
npx prisma migrate reset

# Option B: Just clear data
npx prisma db push --force-reset
```

### Step 2: Run Updated Seed
```bash
npm run seed
# OR
npx ts-node prisma/seed.ts
```

### Expected Output:
```
Seeding data...
Created doctor: Dr. John Smith (doctor1@hospital.com) - AVAILABLE
Created doctor: Dr. Jane Doe (doctor2@hospital.com) - AVAILABLE
Created doctor: Dr. Mike Johnson (doctor3@hospital.com) - AVAILABLE
Created doctor: Dr. Sarah Wilson (doctor4@hospital.com) - BUSY
...
Created patient: Alice Brown (patient1@email.com)
...

✅ Seeding complete!

📋 TEST CREDENTIALS:
====================

👨‍⚕️ DOCTOR ACCOUNTS:
Email: doctor1@hospital.com to doctor10@hospital.com
Password: Doctor@123

👤 PATIENT ACCOUNTS:
Email: patient1@email.com to patient20@email.com
Password: Patient@123

💡 TIP: Some doctors are set to BUSY to test availability filtering
```

---

## 🧪 Testing Availability & Scheduling Integration

### Test 1: Doctor Login & Setup Schedule

**Goal:** Verify doctors can use modern scheduling interface

```
1. Log in as: doctor2@hospital.com / Doctor@123
2. Go to: Doctor Dashboard
3. Click: "Scheduling" tab (green "New" badge)
4. Click: "Availability Setup" sub-tab
5. Verify: Pre-seeded schedule shows (Mon-Fri 9-5)
6. Test: Change schedule using paint interface
7. Click: "Save Schedule"
8. Result: Should save successfully ✅
```

---

### Test 2: Availability Toggle

**Goal:** Verify availability toggle works

```
1. Stay logged in as: doctor2@hospital.com
2. Look at: Top-right corner of dashboard
3. See: [●] Available button
4. Click: Toggle to BUSY
5. Verify: Button changes to [ ] Busy
6. Check database:
   └─> doctor.availability_status = "BUSY"
7. Result: Toggle should work ✅
```

---

### Test 3: Patient Booking - Available Doctors

**Goal:** Verify patient sees available doctors

```
1. Log out and log in as: patient1@email.com / Patient@123
2. Go to: Patient Dashboard
3. Click: "Book Appointment" or go to /patient/record/appointments
4. See: List of doctors

Expected Behavior:
├─ Should see ALL 10 doctors in list
├─ Doctors with availability_status = "AVAILABLE" shown
├─ Doctors with availability_status = "BUSY" shown
└─ Filtering happens at TIME SLOT level, not doctor list level

Current Implementation:
- Doctor list shows ALL doctors
- When you SELECT a doctor and date:
  └─> API checks their working_days
  └─> Shows available time slots
  └─> [Optional] Could filter by availability_status
```

---

### Test 4: Patient Booking - Time Slots

**Goal:** Verify time slots match doctor's schedule

```
1. As patient1@email.com
2. Select: doctor2@hospital.com (AVAILABLE)
3. Select: Any Monday
4. Expected Slots:
   ✅ 09:00 AM
   ✅ 09:30 AM
   ✅ 10:00 AM
   ✅ 10:30 AM
   ✅ 11:00 AM
   ✅ 11:30 AM
   ❌ 12:00 PM - LUNCH BREAK
   ❌ 12:30 PM - LUNCH BREAK
   ✅ 01:00 PM
   ✅ 01:30 PM
   ✅ 02:00 PM
   ✅ 02:30 PM
   ✅ 03:00 PM
   ✅ 03:30 PM
   ✅ 04:00 PM
   ✅ 04:30 PM

5. Select: Saturday
   Expected: "Doctor not available on this day" ❌

6. Result: Slots should match seeded working_days ✅
```

---

### Test 5: Patient Booking - BUSY Doctor

**Goal:** Verify what happens with BUSY doctors

```
1. As patient1@email.com
2. Select: doctor1@hospital.com (BUSY)
3. Select: Any Monday
4. Current Behavior:
   └─> Shows time slots (availability_status not checked)
   
5. Expected Behavior (Optional Enhancement):
   └─> Shows "Doctor is currently BUSY" message
   └─> OR shows slots but marks as unavailable
   
6. Workaround:
   └─> BUSY status is for internal use
   └─> Time slots still show (they might become available)
   └─> Doctor can reject bookings manually
```

---

### Test 6: Complete Booking Flow

**Goal:** End-to-end booking test

```
1. As patient1@email.com
2. Select: doctor2@hospital.com (AVAILABLE, Cardiology)
3. Select: Tomorrow's date (if weekday)
4. Select: 10:00 AM
5. Select: Appointment Type: Consultation
6. Add note: "First time visit"
7. Click: "Confirm Booking"
8. Expected:
   ├─> Appointment created with status: PENDING
   ├─> Patient sees success message
   └─> Email notification sent (if configured)

9. Log in as: doctor2@hospital.com
10. Go to: Doctor Dashboard → Scheduling → Calendar
11. Expected:
    └─> See patient's appointment in calendar at 10:00 AM
    └─> Can accept/reject from Quick Schedule Modal

12. Result: Complete flow works ✅
```

---

### Test 7: Doctor Modifies Schedule

**Goal:** Verify schedule changes reflect in patient booking

```
1. As doctor2@hospital.com
2. Go to: Scheduling → Availability Setup
3. Change: Friday to NOT WORKING (clear all blocks)
4. Save schedule
5. Log out

6. As patient1@email.com
7. Try to: Book doctor2 for Friday
8. Expected:
   └─> No time slots available OR
   └─> "Doctor not available on this day"
9. Result: Schedule change should reflect ✅
```

---

### Test 8: Multiple Doctors - Slot Comparison

**Goal:** Compare available slots across doctors

```
Test Setup:
- doctor1: BUSY
- doctor2: AVAILABLE
- Both have same schedule (Mon-Fri 9-5)

As patient1@email.com:

1. Select doctor1 (BUSY) for Monday:
   Current: Shows all time slots
   Enhanced: Could show "Doctor is BUSY" message
   
2. Select doctor2 (AVAILABLE) for Monday:
   Shows: All time slots (9:00-4:30, excluding lunch)
   
3. Comparison:
   ├─> Both should show same time slots (based on working_days)
   └─> Availability toggle doesn't affect slot generation (currently)
```

---

## 📊 Database Verification Queries

### Check Doctor's Working Days:
```sql
SELECT 
  d.name, 
  d.availability_status,
  wd.day_of_week,
  wd.start_time,
  wd.end_time,
  wd.is_working,
  wd.break_start_time,
  wd.break_end_time
FROM doctor d
LEFT JOIN working_days wd ON d.id = wd.doctor_id
WHERE d.email = 'doctor2@hospital.com'
ORDER BY 
  CASE wd.day_of_week
    WHEN 'Monday' THEN 1
    WHEN 'Tuesday' THEN 2
    WHEN 'Wednesday' THEN 3
    WHEN 'Thursday' THEN 4
    WHEN 'Friday' THEN 5
    WHEN 'Saturday' THEN 6
    WHEN 'Sunday' THEN 7
  END;
```

### Check All Doctors' Availability:
```sql
SELECT 
  name,
  specialization,
  availability_status,
  COUNT(wd.id) as working_days_count
FROM doctor
LEFT JOIN working_days wd ON doctor.id = wd.doctor_id AND wd.is_working = true
GROUP BY doctor.id, name, specialization, availability_status
ORDER BY name;
```

### Check User Accounts Created:
```sql
SELECT 
  u.email,
  u.role,
  d.name as doctor_name,
  d.specialization
FROM "user" u
LEFT JOIN doctor d ON u.id = d.id
WHERE u.role = 'DOCTOR'
ORDER BY u.email;
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Can't log in as doctor
**Cause:** User account not created  
**Solution:** Re-run updated seed with user creation

### Issue 2: No time slots showing
**Causes:**
1. Doctor has no working_days records
2. Selected day is marked is_working = false
3. Selected date is Saturday/Sunday (not working)

**Debug:**
```sql
SELECT * FROM working_days WHERE doctor_id = 'DOCTOR_ID_HERE';
```

### Issue 3: Lunch break not excluded
**Cause:** break_start_time or break_end_time is null  
**Solution:** Seed should set these to "12:00" and "13:00"

### Issue 4: All doctors showing in booking
**Question:** Should BUSY doctors show?

**Current Behavior:**
- ALL doctors show in list
- Filtering happens at TIME SLOT level

**To Change:**
Update `/api/doctors` endpoint to filter by availability_status:
```typescript
WHERE availability_status = 'AVAILABLE'
```

---

## ✅ Expected Test Results

### After running updated seed:

**Doctor Side:**
- [x] 10 doctors created with user accounts
- [x] Can log in with doctor emails
- [x] Each doctor has 7 working_days records (Mon-Sun)
- [x] Mon-Fri marked as working (9-5, lunch 12-1)
- [x] Sat-Sun marked as NOT working
- [x] Some doctors set to BUSY, others AVAILABLE
- [x] Can see/edit schedule in modern UI
- [x] Can toggle availability status

**Patient Side:**
- [x] 20 patients created with user accounts
- [x] Can log in with patient emails
- [x] Can view all doctors in booking form
- [x] Can select doctor and see available slots
- [x] Slots match doctor's working_days (9-5, no lunch)
- [x] Saturday/Sunday show no slots
- [x] Can complete booking flow

**Integration:**
- [x] Doctor's working_days → Patient's available slots
- [x] Doctor's availability_status → [Optional] Slot filtering
- [x] Modern scheduling saves → Patient booking reads correctly
- [x] Appointment creation → Doctor sees in calendar

---

## 🎯 Quick Test Checklist

```
□ Re-seed database with updated seed file
□ Log in as doctor2@hospital.com
□ Verify pre-seeded schedule shows in modern UI
□ Try painting new schedule
□ Toggle availability AVAILABLE ↔ BUSY
□ Log out

□ Log in as patient1@email.com
□ Go to booking form
□ Verify 10 doctors show in list
□ Select doctor2 (AVAILABLE)
□ Select a weekday (Mon-Fri)
□ Verify time slots: 9:00, 9:30... 11:30, 1:00... 4:30
□ Verify lunch excluded: No 12:00, 12:30
□ Select Saturday
□ Verify no slots available
□ Book an appointment for weekday 10:00 AM

□ Log in as doctor2@hospital.com
□ Go to Scheduling → Calendar
□ Verify booked appointment shows
□ Test Quick Schedule Modal
```

---

## 📞 Support

If tests fail, check:
1. Database properly reset
2. Seed ran successfully (see console output)
3. bcryptjs installed: `npm install bcryptjs`
4. User table has records (not just doctor/patient tables)
5. working_days has 70 records (10 doctors × 7 days)

---

**Last Updated:** October 17, 2025  
**Version:** 2.0 (with user accounts & proper working_days)

