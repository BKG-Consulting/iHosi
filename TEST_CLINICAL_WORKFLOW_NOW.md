# 🧪 Test Clinical Workflow - Quick Guide

## ⚡ Complete Workflow Test (10 Minutes)

### **Prerequisites:**
```bash
✅ Database seeded (10 doctors, 20 patients)
✅ Dev server running (npm run dev)
✅ You have test credentials
```

---

## 🎬 **ACT 1: Patient Books Appointment (2 min)**

### **Login as Patient:**
```
URL: http://localhost:3000/sign-in
Email: patient1@email.com
Password: Patient@123
```

### **Book Appointment:**
```
1. You're on: Patient Dashboard
2. Notice: ⭐ NEW "Recent Vitals" widget in sidebar (might be empty for new patient)
3. Click: "Book Appointment" button
4. Select Doctor: Dr. Nelly Dreher (doctor2@hospital.com - Dermatology)
5. Select Date: Tomorrow (a weekday)
6. Select Time: 10:00 AM
7. Appointment Type: Consultation
8. Reason: "Persistent skin rash on left arm for 2 weeks"
9. Click: "Confirm Booking"
10. See: Success message
11. Status: PENDING 🟡
```

**✅ Checkpoint:** Appointment created with PENDING status

---

## 🎬 **ACT 2: Doctor Accepts & Schedules (2 min)**

### **Login as Doctor:**
```
Logout patient → Login as:
Email: doctor2@hospital.com
Password: Doctor@123
```

### **Accept Appointment:**
```
1. You're on: Doctor Dashboard
2. See: "Pending Requests: 1" in stat cards
3. Click: "Scheduling" tab
4. Click: "Calendar & Scheduling" sub-tab
5. Navigate to: Tomorrow's date
6. See: 10:00 AM slot with pending appointment
7. Click: The appointment
8. Quick Schedule Modal opens (or appointment details)
9. Click: "Accept" or "Schedule & Notify"
10. See: Success message
11. Check console: Should see "✅ Appointment reminders scheduled"
```

**✅ Checkpoint:** 
- Appointment status: SCHEDULED 🔵
- Patient notified
- Reminders scheduled (2 entries in schedule_notifications table)

---

## 🎬 **ACT 3: Doctor Conducts Consultation (4 min)**

### **Navigate to Appointment:**
```
1. Still logged in as: doctor2@hospital.com
2. Go to: Appointments tab (main dashboard)
3. Find: Tomorrow's 10:00 AM appointment
4. Click: "View Details" button
5. You're now at: /record/appointments/[id]?cat=appointments
```

### **What You'll See:**

```
LEFT SIDE:
┌────────────────────────────────────┐
│ Appointment Information       🔵   │ ← Status badge
│ Appointment #123                   │
│ Date: Oct 21, 2025                 │
│ Time: 10:00 AM                     │
│ Notes: "Skin rash..."              │
└────────────────────────────────────┘

⭐ NEW: Blue Card Below:
┌────────────────────────────────────┐
│ Ready to Start Consultation?       │
│ [▶️ Start Consultation]            │
└────────────────────────────────────┘

RIGHT SIDE:
┌────────────────────────────────────┐
│ Clinical Documentation       ⭐     │ ← NEW: Role-based title
│                                    │
│ Tabs (7 tabs for clinical staff): │
│ [Appointment & Vitals] [Diagnosis] │
│ [Medical History] [Charts] [Labs]  │
│ [Billing] [Payments]               │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Patient Details                    │
│ • Demographics                     │
│ • ⚠️ Allergies: Penicillin         │ ← Highlighted!
│ • Active Conditions                │
└────────────────────────────────────┘
```

### **Step 1: Start Consultation**
```
1. Click: "Start Consultation" button
2. See: Loading indicator
3. Button changes to: Purple "Consultation in Progress" card
4. ⭐ NEW: "Complete Consultation" button appears
5. Status changed: SCHEDULED → IN_PROGRESS 🟣
```

**✅ Checkpoint:** Status is now IN_PROGRESS

---

### **Step 2: Record Vitals**
```
1. Already on: "Appointment & Vitals" tab (default)
2. Scroll down to: Vital Signs section
3. See: "Add Vital Signs" button (only you see this, patients don't!)
4. Click: "Add Vital Signs"
5. Dialog opens (existing component!)
6. Fill in:
   - Body Temperature: 37.2
   - Heart Rate: 72
   - Systolic BP: 120
   - Diastolic BP: 80
   - Weight: 70
   - Height: 170
   - Respiratory Rate: 16
   - Oxygen Saturation: 98
7. Click: "Submit"
8. See: Success toast
9. See: Vitals display on page with BMI calculated!
```

**✅ Checkpoint:** Vitals saved to database and displaying

---

### **Step 3: Add Diagnosis & Prescription**
```
1. Click: "Diagnosis" tab (in Quick Links)
2. Page shows: Either existing diagnoses or "No diagnosis found"
3. See: "Add Diagnosis" button (only clinical staff see this!)
4. Click: "Add Diagnosis"
5. Dialog opens (existing component!)
6. Fill in:
   - Symptoms: "Erythematous macular rash on left forearm, pruritic, present for 2 weeks"
   - Diagnosis: "Contact dermatitis, left forearm"
   - Prescribed Medications: "Hydrocortisone cream 1%, apply to affected area twice daily for 7 days. Avoid known irritants."
   - Additional Notes: "Patient advised to identify and avoid causative agent. Monitor for improvement."
   - Follow-up Plan: "Return in 2 weeks if no improvement or if condition worsens"
7. Click: "Submit"
8. See: Success toast
9. See: Diagnosis displays in Medical Records card!
```

**✅ Checkpoint:** Diagnosis saved and displaying

---

### **Step 4: Complete Consultation**
```
1. Scroll to: Consultation controls (purple card)
2. See: "Complete Consultation" button
3. Click: "Complete Consultation"
4. See: Loading indicator
5. Card changes to: Green "Consultation Completed" card
6. Status changed: IN_PROGRESS → COMPLETED ✅
7. Patient notification sent
```

**✅ Checkpoint:** Consultation complete!

---

## 🎬 **ACT 4: Patient Views Results (2 min)**

### **Login as Patient:**
```
Logout doctor → Login as:
Email: patient1@email.com
Password: Patient@123
```

### **View Completed Consultation:**
```
1. Patient Dashboard loads
2. ⭐ NEW: See "Recent Vitals" widget in sidebar!
   - Shows: BP 120/80, HR 72, Temp 37.2°C
   - Shows: "Recorded Oct 21 during consultation with Dr. Nelly Dreher"

3. Scroll to: "Recent Appointments"
4. See: Your appointment with COMPLETED status ✅
5. Click: "View Details"

6. You're at: /record/appointments/[id]
7. ⭐ NEW: See ONLY 3 tabs:
   - Appointment Details
   - Billing
   - Payments
   
8. ⭐ NEW: See green "Consultation Completed" card
9. Can click: "Download Summary" or "View Prescription"

10. Try navigating to vitals (if curious):
    - Change URL: ?cat=appointments
    - Scroll to vitals section
    - See: Vitals displayed (READ-ONLY)
    - ⭐ NO "Add Vital Signs" button (role-protected!)

11. Try navigating to diagnosis:
    - Change URL: ?cat=diagnosis
    - See: Diagnosis displayed (READ-ONLY)
    - ⭐ NO "Add Diagnosis" button (role-protected!)
```

**✅ Checkpoint:** Patient can view but not modify clinical data!

---

## 🔍 **Database Verification**

### **Check Status Changes:**
```sql
SELECT id, patient_id, doctor_id, appointment_date, time, status 
FROM appointment 
WHERE id = <your-appointment-id>;

Expected flow:
- Initially: PENDING
- After accept: SCHEDULED
- After start: IN_PROGRESS
- After complete: COMPLETED
```

### **Check Reminders Scheduled:**
```sql
SELECT * FROM schedule_notifications 
WHERE appointment_id = <your-appointment-id>;

Expected: 2-3 records
- 24h reminder to patient
- 24h reminder to doctor  
- 1h reminder to patient
Status: PENDING
```

### **Check Medical Records Created:**
```sql
SELECT * FROM medical_records 
WHERE appointment_id = <your-appointment-id>;

Expected: 1 record created when consultation started
```

### **Check Vitals Saved:**
```sql
SELECT * FROM vital_signs 
WHERE patient_id = <patient-id>;

Expected: 1 record with all vitals
```

### **Check Diagnosis Saved:**
```sql
SELECT * FROM diagnosis 
WHERE patient_id = <patient-id>;

Expected: 1 record with symptoms, diagnosis, prescriptions
```

---

## ✅ **Success Criteria**

After completing all tests, you should have:

- [x] Patient booked appointment successfully
- [x] Doctor accepted appointment
- [x] Reminders scheduled (check database)
- [x] Doctor started consultation (status → IN_PROGRESS)
- [x] Doctor recorded vitals using existing dialog
- [x] Vitals saved and displayed
- [x] Doctor added diagnosis using existing dialog
- [x] Diagnosis saved and displayed
- [x] Doctor completed consultation (status → COMPLETED)
- [x] Patient sees completed status
- [x] Patient sees vitals widget on dashboard
- [x] Patient sees filtered tabs (3 tabs only)
- [x] Patient can view but not modify clinical data

**If all checked: 🎉 COMPLETE WORKFLOW IS WORKING!**

---

## 🚀 **Quick Commands**

### **View Database:**
```bash
npx prisma studio
```
Then check:
- `appointment` table → See status changes
- `schedule_notifications` → See scheduled reminders
- `medical_records` → See consultation record
- `vital_signs` → See vitals
- `diagnosis` → See diagnosis and prescriptions

### **Check Reminders:**
```sql
SELECT 
  sn.title,
  sn.send_at,
  sn.status,
  sn.recipient_type,
  a.appointment_date,
  a.time
FROM schedule_notifications sn
JOIN appointment a ON sn.appointment_id = a.id
WHERE sn.status = 'PENDING'
ORDER BY sn.send_at;
```

### **See Patient's Complete Medical History:**
```sql
SELECT 
  a.id as appointment_id,
  a.appointment_date,
  a.time,
  a.status,
  mr.id as medical_record_id,
  vs.body_temperature,
  vs.systolic,
  vs.diastolic,
  d.diagnosis,
  d.prescribed_medications
FROM appointment a
LEFT JOIN medical_records mr ON a.id = mr.appointment_id
LEFT JOIN vital_signs vs ON mr.id = vs.medical_id
LEFT JOIN diagnosis d ON mr.id = d.medical_id
WHERE a.patient_id = '<patient-id>'
ORDER BY a.appointment_date DESC;
```

---

## 📞 **Need Help?**

**Documentation:**
- Full guide: `/CLINICAL_WORKFLOW_ENHANCED.md`
- Foundation audit: `/docs/CLINICAL_WORKFLOW_FOUNDATION_AUDIT.md`
- Implementation plan: `/COMPLETE_CLINICAL_WORKFLOW_PLAN.md`

**Common Issues:**
- Console logs show detailed information
- Check database with Prisma Studio
- Verify role with `await checkRole("PATIENT")`
- Clear browser cache if UI doesn't update

---

**Ready to test the complete workflow!** 🎉

Follow the 4 acts above and experience the full patient → doctor → consultation → completion flow!

**Estimated Time:** 10 minutes  
**Result:** Complete understanding of the clinical workflow! 🏥


