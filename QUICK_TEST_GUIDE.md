# ⚡ Quick Test Guide - 2 Minutes to Full Setup

## 🚀 **Fast Track: Doctor Schedule Setup**

### **Login Credentials:**
```
Email:    doctor2@hospital.com
Password: Doctor@123
```

### **Setup in 4 Clicks:**
```
1. Login → Doctor Dashboard loads
2. Click "Scheduling" tab (green "New" badge)
3. Click "Availability Setup" sub-tab
4. Click "9-5 Mon-Fri" preset button
5. Click "Save Schedule" button

✅ DONE! Schedule configured in 10 seconds!
```

---

## 📋 **Detailed Setup Steps**

### **Step 1: Login** (15 seconds)
```
→ Go to: http://localhost:3000/sign-in
→ Email: doctor2@hospital.com
→ Password: Doctor@123
→ Click: Sign In
```

### **Step 2: Navigate** (5 seconds)
```
→ You're on: Doctor Dashboard
→ Click: "Scheduling" tab (has green "New" badge)
→ Click: "Availability Setup" sub-tab
```

### **Step 3: Set Schedule** (10 seconds)
```
→ See: 4 preset buttons at top
→ Click: "9-5 Mon-Fri" button
→ Watch: Grid updates instantly with blue blocks
→ See: Mon-Fri 9am-5pm in blue, lunch break in gray
```

### **Step 4: Save** (5 seconds)
```
→ Scroll down (if needed)
→ Click: "Save Schedule" button (big blue button)
→ Wait: 1-2 seconds
→ See: Green success message "Schedule saved successfully! ✓"
```

### **Step 5: Verify** (10 seconds)
```
→ Click: "Calendar & Scheduling" sub-tab
→ See: Week view with your schedule
→ Notice: Monday-Friday show empty slots
→ Notice: Saturday-Sunday are empty (not working)
→ Notice: 12pm-1pm shows as break time
```

---

## 🎯 **What Each Schedule Looks Like**

### **Preset: "9-5 Mon-Fri"** (Most Common)
```
Time Slots Created:
Morning:  9:00, 9:30, 10:00, 10:30, 11:00, 11:30 (6 slots)
Lunch:    12:00-1:00 PM (BREAK - no slots)
Afternoon: 1:00, 1:30, 2:00, 2:30, 3:00, 3:30, 4:00, 4:30 (8 slots)
Weekend:  No slots (not working)

Total: 14 slots/day × 5 days = 70 slots/week
```

### **Preset: "8-6 Mon-Fri"** (Extended Hours)
```
Morning:  8:00, 8:30, 9:00, 9:30, 10:00, 10:30, 11:00, 11:30 (8 slots)
Lunch:    12:00-1:00 PM (BREAK - no slots)
Afternoon: 1:00-5:30 PM (10 slots)
Weekend:  No slots

Total: 18 slots/day × 5 days = 90 slots/week
```

### **Preset: "Half Day"** (Morning Only)
```
Morning:  9:00, 9:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30 (8 slots)
Afternoon: Not working
Weekend:  No slots

Total: 8 slots/day × 5 days = 40 slots/week
```

### **Preset: "Weekend"** (Sat-Sun Only)
```
Saturday:  10:00 AM - 4:00 PM (12 slots)
Sunday:    10:00 AM - 4:00 PM (12 slots)
Weekdays:  Not working

Total: 24 slots/week
```

---

## 🧪 **Test the Complete Flow (5 minutes)**

### **Test 1: Doctor Sets Schedule** ✅
```bash
Time: 1 minute

1. Login: doctor2@hospital.com / Doctor@123
2. Click: Scheduling → Availability Setup
3. Click: "9-5 Mon-Fri" preset
4. Click: "Save Schedule"
5. See: Success message

Result: ✅ Schedule saved
```

---

### **Test 2: Toggle Availability** ✅
```bash
Time: 15 seconds

1. Look: Top-right corner
2. See: [●] Available button
3. Click: Toggle to Busy
4. See: Changes to [ ] Busy (red dot)
5. Click: Toggle back to Available

Result: ✅ Toggle works
```

---

### **Test 3: View in Calendar** ✅
```bash
Time: 30 seconds

1. Click: "Calendar & Scheduling" sub-tab
2. See: Week view of your schedule
3. Try: Click "Day" button → Day view
4. Try: Click "Month" button → Month view
5. Try: Click "Week" button → Week view
6. Try: Click < > arrows to navigate dates
7. Try: Click "Today" button to jump to today

Result: ✅ Calendar views work
```

---

### **Test 4: Patient Books Appointment** ✅
```bash
Time: 2 minutes

1. Log out
2. Login: patient1@email.com / Patient@123
3. Find: "Book Appointment" button or go to booking page
4. Select: Dr. Nelly Dreher (doctor2 - Dermatology)
5. Select: Tomorrow (if weekday)
6. See: Time slots appear
7. Verify: 9:00, 9:30, 10:00... up to 4:30 PM
8. Verify: NO 12:00 or 12:30 PM (lunch break)
9. Select: 10:00 AM
10. Fill: Appointment details
11. Click: Book/Confirm

Result: ✅ Appointment booked
```

---

### **Test 5: Doctor Sees Appointment** ✅
```bash
Time: 30 seconds

1. Log out
2. Login: doctor2@hospital.com / Doctor@123
3. Click: Scheduling → Calendar & Scheduling
4. Navigate: To the date you booked
5. Look: For 10:00 AM slot
6. See: Patient's appointment with PENDING status

Result: ✅ End-to-end flow works!
```

---

## 🎊 **Success Checklist**

After completing all tests, you should have:

- [x] Logged in as doctor successfully
- [x] Seen the modern scheduling interface
- [x] Set weekly schedule using preset (10 seconds)
- [x] Saved schedule successfully
- [x] Toggled availability status
- [x] Viewed schedule in calendar views
- [x] Booked appointment as patient
- [x] Seen patient's appointment as doctor

**If all checked: 🎉 System is working perfectly!**

---

## 🔧 **Troubleshooting**

### **Issue: Can't login as doctor**
```
Check:
- Using doctor2@hospital.com (not doctor2@email.com)
- Password exactly: Doctor@123 (capital D, @ symbol, 123)
- Database was seeded (run: npx ts-node prisma/seed.ts)
```

### **Issue: Don't see "Scheduling" tab**
```
Check:
- You're logged in as DOCTOR role (not patient)
- You're on /doctor route
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
```

### **Issue: Can't save schedule**
```
Check:
- Browser console for errors (F12)
- Network tab shows API call
- Server is running
- Database connection working
```

### **Issue: Patient can't see time slots**
```
Check:
- Doctor has working_days records (use Prisma Studio)
- Selected a weekday (not Saturday/Sunday)
- Doctor's working_days has is_working=true for that day
- API endpoint /api/scheduling/availability/slots is working
```

---

## 📞 **Need Help?**

**Documentation:**
- Full walkthrough: `/DOCTOR_SETUP_WALKTHROUGH.md`
- Test credentials: `/TEST_CREDENTIALS.md`
- Integration details: `/docs/SCHEDULING_INTEGRATION_ANALYSIS.md`

**Quick Commands:**
```bash
# View database
npx prisma studio

# Re-seed if needed
npx ts-node prisma/seed.ts

# Check server logs
# Look at terminal where npm run dev is running
```

---

## ⏱️ **Time Estimates**

| Task | Time |
|------|------|
| Login | 15 sec |
| Navigate to Scheduling | 5 sec |
| Set schedule (preset) | 10 sec |
| Save schedule | 5 sec |
| **Total Setup** | **35 seconds** |
| | |
| Toggle availability | 5 sec |
| View calendar | 15 sec |
| Patient booking | 2 min |
| Verify as doctor | 30 sec |
| **Complete Test** | **3-4 minutes** |

---

## 🎯 **Expected Results Summary**

### **After Doctor Setup:**
```
✅ Doctor has Mon-Fri 9-5 schedule
✅ Lunch break 12-1 PM excluded
✅ Weekends marked as not working
✅ 14 appointment slots per working day
✅ 70 total slots per week
```

### **What Patient Sees:**
```
✅ Can select doctor from list
✅ Can pick any weekday date
✅ Sees 14 time slots (9:00-4:30, excluding lunch)
✅ Saturday/Sunday: No slots
✅ Can book successfully
```

### **What Doctor Sees After Booking:**
```
✅ Pending appointment appears in calendar
✅ Shows patient name and time
✅ Can accept/reject from Quick Schedule Modal
✅ Status updates in real-time
```

---

## 🎉 **Start Testing Now!**

**Fastest path:**
```bash
1. Open: http://localhost:3000/sign-in
2. Login: doctor2@hospital.com / Doctor@123
3. Click: Scheduling → Availability Setup
4. Click: "9-5 Mon-Fri"
5. Click: "Save Schedule"

✅ Done! Now test patient booking!
```

**You're ready! Go test it! 🚀**

---

**Last Updated:** October 17, 2025  
**Tested:** ✅ Full flow verified  
**Status:** Production Ready

