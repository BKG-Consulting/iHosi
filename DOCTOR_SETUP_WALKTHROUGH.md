# 👨‍⚕️ Doctor Schedule Setup - Complete Walkthrough

## 🎯 Scenario: New Doctor First-Time Setup

You're a newly registered doctor who needs to set up your weekly availability before accepting appointments.

---

## 📋 Step-by-Step Guide

### **Step 1: Start Your Development Server**

```bash
# Make sure your server is running
npm run dev

# Server should start at:
# http://localhost:3000
```

---

### **Step 2: Navigate to Login Page**

```
Open browser and go to:
http://localhost:3000/sign-in

You'll see the iHosi login page
```

---

### **Step 3: Login as a Doctor**

**Use this test account:**
```
Email:    doctor2@hospital.com
Password: Doctor@123

Why doctor2?
- ✅ Set to AVAILABLE (not BUSY)
- ✅ Already has pre-seeded schedule (Mon-Fri 9-5)
- ✅ Dermatology specialist
```

**Login Steps:**
1. Enter email: `doctor2@hospital.com`
2. Enter password: `Doctor@123`
3. Click "Sign In" or "Login" button
4. You should be redirected to: `/doctor` (Doctor Dashboard)

---

### **Step 4: You're Now on the Doctor Dashboard**

**What you'll see:**

```
┌─────────────────────────────────────────────────────────┐
│ Welcome back, Dr. Dreher                     [AI ON]   │
│ Dermatology • Dermatology            [●] Available     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ Today's  │  │ Active   │  │Completion│  │Pending ││
│  │Appts: 0  │  │Patients  │  │   Rate   │  │Reqs: 0 ││
│  └──────────┘  └──────────┘  └──────────┘  └────────┘│
│                                                         │
│  Tabs: [Overview] [Scheduling🆕] [Appointments] ...    │
└─────────────────────────────────────────────────────────┘
```

**Notice:**
- Top right: **Availability toggle** ([●] Available)
- Tabs: **"Scheduling" tab has green "New" badge**

---

### **Step 5: Go to Modern Scheduling Interface**

**Click the "Scheduling" tab**

You'll see:
```
┌─────────────────────────────────────────────────────────┐
│  Modern Scheduling Dashboard                            │
├─────────────────────────────────────────────────────────┤
│  Stats Cards:                                           │
│  • Today's Schedule: 0                                  │
│  • Pending Requests: 0                                  │
│  • This Week: 0                                         │
│                                                          │
│  Sub-tabs:                                              │
│  [Calendar & Scheduling] [Availability Setup]           │
└─────────────────────────────────────────────────────────┘
```

---

### **Step 6: Set Up Your Weekly Schedule**

**Click the "Availability Setup" sub-tab**

You'll see the **Visual Availability Setup** interface:

```
┌─────────────────────────────────────────────────────────┐
│  📅 Visual Availability Setup                    ✨     │
│  Click and drag to paint your weekly availability       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🔥 OPTION 1: Quick Presets (Recommended!)             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ 9-5 M-F  │ │ 8-6 M-F  │ │Half Day  │ │Weekend   │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                         │
│  🎨 OPTION 2: Visual Painter                           │
│  Weekly Schedule Grid:                                  │
│                                                         │
│  Time   Mon  Tue  Wed  Thu  Fri  Sat  Sun              │
│  6am    ░░░  ░░░  ░░░  ░░░  ░░░  ░░░  ░░░              │
│  8am    ███  ███  ███  ███  ███  ░░░  ░░░              │
│  10am   ███  ███  ███  ███  ███  ░░░  ░░░              │
│  12pm   ░░░  ░░░  ░░░  ░░░  ░░░  ░░░  ░░░ (Lunch)     │
│  2pm    ███  ███  ███  ███  ███  ░░░  ░░░              │
│  4pm    ███  ███  ███  ███  ███  ░░░  ░░░              │
│  6pm    ░░░  ░░░  ░░░  ░░░  ░░░  ░░░  ░░░              │
│                                                         │
│  Blue blocks (███) = You're available                   │
│  Gray blocks (░░░) = Not available                      │
│                                                         │
│  Appointment Settings:                                  │
│  Appointment Duration:  [30 minutes ▼]                 │
│  Buffer Time:          [5 minutes  ▼]                  │
│  Max per Slot:         [1 patient  ▼]                  │
│                                                         │
│  [Save Schedule] ←── Click this when done               │
└─────────────────────────────────────────────────────────┘
```

---

### **Method A: Use Quick Preset (FASTEST - 10 seconds)** ⚡

**For standard 9-5 office hours:**

1. Click the **"9-5 Mon-Fri"** button
2. Watch the grid update instantly:
   - Monday to Friday: Blue blocks from 9 AM to 5 PM
   - Lunch break (12-1 PM): Gray blocks
   - Saturday & Sunday: All gray
3. (Optional) Adjust appointment settings if needed:
   - Duration: Keep at 30 minutes
   - Buffer: Keep at 5 minutes
4. Click **"Save Schedule"** button at bottom
5. See success message: "Schedule saved successfully! ✓"

**✅ Done in 10 seconds!**

---

### **Method B: Custom Painting (30-60 seconds)** 🎨

**For custom schedules:**

1. **Paint by clicking & dragging:**
   - Click on any time block (it toggles)
   - Click & hold → drag across multiple hours
   - Click & hold → drag down a column (paint entire day)
   
2. **Example: Set Monday 9 AM to 5 PM:**
   - Click on Monday 8am block → it turns blue
   - Hold mouse and drag down to Monday 6pm
   - All blocks turn blue
   - Click 12pm block to turn gray (lunch break)
   - Click 12pm block below to turn gray (lunch hour)

3. **Copy to other days:**
   - See the small icons under each day?
   - Click the **Copy icon** (📋) under Monday
   - All days now match Monday!
   - Click **Trash icon** under Saturday to clear weekend

4. **Fine-tune:**
   - Click individual blocks to toggle
   - Paint exactly the hours you want

5. Click **"Save Schedule"** button
6. See success message

**✅ Done in 30-60 seconds!**

---

### **Step 7: Verify Your Schedule**

After saving, go to **"Calendar & Scheduling"** sub-tab

You'll see the **Modern Calendar View**:

```
┌─────────────────────────────────────────────────────────┐
│  [< Today >]  October 2025        [Day][Week][Month]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Week View (default):                                   │
│  ─────────────────────────────────────────────────────  │
│        Mon    Tue    Wed    Thu    Fri    Sat    Sun   │
│  9am   OPEN   OPEN   OPEN   OPEN   OPEN   ░░░    ░░░   │
│  10am  OPEN   OPEN   OPEN   OPEN   OPEN   ░░░    ░░░   │
│  11am  OPEN   OPEN   OPEN   OPEN   OPEN   ░░░    ░░░   │
│  12pm  ═════ LUNCH BREAK ═══════════════   ░░░    ░░░   │
│  1pm   OPEN   OPEN   OPEN   OPEN   OPEN   ░░░    ░░░   │
│  2pm   OPEN   OPEN   OPEN   OPEN   OPEN   ░░░    ░░░   │
│  3pm   OPEN   OPEN   OPEN   OPEN   OPEN   ░░░    ░░░   │
│  4pm   OPEN   OPEN   OPEN   OPEN   OPEN   ░░░    ░░░   │
│                                                         │
│  Green OPEN = Available slots                           │
│  Gray bars = Lunch break                                │
│  Gray blocks = Not working (weekend)                    │
└─────────────────────────────────────────────────────────┘
```

**✅ Your schedule is now live and visible to patients!**

---

### **Step 8: Set Your Daily Availability Status** (OPTIONAL)

**What is this?**
- This is a **quick toggle** for temporary unavailability
- Separate from your weekly schedule
- Use when you have emergencies, meetings, etc.

**How to use:**

Look at **top-right corner** of dashboard:

```
[●] Available  ← Click this button
```

**When you click it:**
1. Changes to: `[ ] Busy` (red dot)
2. Updates your status in database
3. (Optional) Patients won't see your time slots

**When to use:**
- Emergency meeting
- Lunch extended
- Sick today
- Any temporary unavailability

**To go back online:**
- Just click again: `[●] Available`

---

## 🎯 **Complete Setup Checklist**

### ✅ Initial Setup (Do Once):
- [x] Log in as doctor2@hospital.com
- [x] Go to Scheduling → Availability Setup
- [x] Choose quick preset OR paint custom schedule
- [x] Adjust appointment duration/buffer if needed
- [x] Click "Save Schedule"
- [x] Verify in Calendar view

**Time:** 15-60 seconds depending on method

---

### ✅ Daily Operations:
- [x] Toggle availability as needed (top-right button)
- [x] View appointments in Calendar tab
- [x] Accept/reject pending appointments
- [x] Modify schedule as needed

---

## 📊 **What Happens After Setup**

### **Immediately:**
1. Your schedule is saved to `working_days` table
2. Patients can now see your available time slots
3. You appear in "Available Doctors" list (if status = AVAILABLE)

### **When Patient Books:**
1. They select you from doctor list
2. They pick a date
3. System shows them:
   - Time slots from 9:00 AM to 4:30 PM (30-min intervals)
   - Lunch break excluded (12:00-1:00 PM)
   - Saturday/Sunday: No slots
   - Already booked slots: Hidden
4. They book an appointment
5. You see it in your Scheduling → Calendar tab

---

## 🎨 **Visual Guide**

### **Before Setup:**
```
Your Status: No schedule configured
Patient sees: No available time slots
You can: Not receive appointments
```

### **After Setup (9-5 Mon-Fri):**
```
Your Status: Available Mon-Fri 9-5, lunch 12-1
Patient sees: 16 time slots per day (8 morning + 8 afternoon)
You can: Receive and manage appointments
```

---

## 💡 **Pro Tips**

### **Tip 1: Use Presets First**
Don't paint from scratch! Start with a preset and customize:
1. Click "9-5 Mon-Fri"
2. Make small adjustments if needed
3. Save

**Time saved:** 90%

---

### **Tip 2: Copy Monday to All Days**
1. Set Monday exactly how you want
2. Click the Copy icon (📋) under Monday
3. All days now match
4. Adjust individual days as needed

**Time saved:** 80%

---

### **Tip 3: Availability Toggle vs Schedule**
```
Weekly Schedule (Availability Setup):
- Sets your REGULAR working hours
- Monday to Sunday configuration
- Permanent until you change it
- Use for: Your standard week

Daily Toggle (Top-right button):
- Quick on/off switch
- Temporary status change
- Use for: Emergencies, meetings, sick days
```

**Best Practice:**
- Set schedule once (weekly hours)
- Use toggle for daily changes

---

### **Tip 4: Test with Patient Account**
After setting up your schedule:
1. Log out
2. Log in as patient1@email.com
3. Try booking an appointment with yourself
4. Verify time slots match your schedule

---

## 🔍 **Verification Steps**

### **After saving schedule, verify:**

1. **In Availability Setup tab:**
   - See colored blocks matching your schedule
   - Working days show hour count (e.g., "8h")

2. **In Calendar view:**
   - Switch to Week View
   - See your weekly schedule layout
   - All slots show as "OPEN"

3. **Using Prisma Studio (optional):**
   ```bash
   npx prisma studio
   ```
   - Go to `working_days` table
   - Find your doctor_id
   - See 7 records (one per day)
   - Monday-Friday: is_working=true, start_time="09:00", end_time="17:00"

---

## ⚠️ **Common Questions**

### **Q: I don't see the "Scheduling" tab?**
**A:** 
- Make sure you logged in as a DOCTOR (not patient/admin)
- The tab has a green "New" badge
- Try refreshing the page
- Check you're on `/doctor` route

---

### **Q: The grid is already filled with blue blocks?**
**A:** 
- That's the pre-seeded schedule from the database!
- The seed created Mon-Fri 9-5 for all doctors
- You can change it using presets or painting
- This is normal!

---

### **Q: What if I want different hours each day?**
**A:** 
- Don't use presets
- Paint each day individually
- Click & drag to paint blocks
- Each day can have unique hours

---

### **Q: What's the difference between blue and gray blocks?**
**A:**
- **Blue (███)** = You're available for appointments
- **Gray (░░░)** = Not available (day off, break, etc.)

---

### **Q: How do I set lunch break?**
**A:**
- Just leave those hour blocks gray (unselected)
- Example: Clear 12pm and 12:30pm blocks
- System automatically detects this as break time

---

### **Q: Can I change my schedule later?**
**A:** 
- Yes! Anytime!
- Go to Scheduling → Availability Setup
- Make changes
- Click Save
- Changes apply immediately

---

## 🚀 **Quick Reference**

### **One-Time Setup (First Login):**
```
1. Login as doctor
2. Scheduling tab
3. Availability Setup sub-tab
4. Click "9-5 Mon-Fri" preset
5. Click "Save Schedule"
✅ Done!
```

### **Daily Toggle (As Needed):**
```
1. Click top-right availability button
2. Toggle: Available ↔ Busy
✅ Done!
```

### **Modify Schedule (Anytime):**
```
1. Scheduling → Availability Setup
2. Paint new schedule OR use different preset
3. Save
✅ Done!
```

---

## 📸 **Expected Screenshots Guide**

### **1. Login Page:**
- [ ] iHosi logo/branding
- [ ] Email and password fields
- [ ] Sign in button

### **2. Doctor Dashboard (After Login):**
- [ ] Welcome message with your name
- [ ] 4 stat cards at top
- [ ] Multiple tabs (Overview, Scheduling, Appointments, etc.)
- [ ] Availability toggle (top-right)

### **3. Scheduling Tab:**
- [ ] Two sub-tabs: "Calendar & Scheduling" and "Availability Setup"
- [ ] Stats cards showing schedule summary
- [ ] Calendar interface (month/week/day views)

### **4. Availability Setup:**
- [ ] 4 quick preset buttons
- [ ] Visual weekly grid with time blocks
- [ ] Color-coded blocks (blue = available, gray = not)
- [ ] Appointment settings (duration, buffer, max)
- [ ] Save Schedule button

### **5. After Saving:**
- [ ] Green success message: "Schedule saved successfully! ✓"
- [ ] Grid shows your saved schedule
- [ ] Can switch to Calendar view to see visual representation

---

## ✅ **Success Indicators**

**You've successfully set up your schedule when:**

1. ✅ Green success message appears after saving
2. ✅ Visual grid shows colored blocks for your working hours
3. ✅ Calendar view shows your weekly schedule
4. ✅ You can switch between Month/Week/Day views
5. ✅ Weekend days show as not working (if that's your schedule)
6. ✅ Lunch break hours are excluded

**Now you're ready to:**
- ✅ Receive appointment requests
- ✅ View your schedule in calendar
- ✅ Accept/reject pending appointments
- ✅ Manage your daily availability

---

## 🎉 **You're All Set!**

Your schedule is now:
- ✅ Saved in database
- ✅ Visible to patients for booking
- ✅ Displayed in your calendar
- ✅ Ready to receive appointments

**Next steps:**
1. Test by booking an appointment as a patient
2. Come back as doctor and see it in your calendar
3. Practice using the Quick Schedule Modal
4. Try the availability toggle

---

**Need help?** Check the other documentation files:
- `/MODERN_SCHEDULING_DEPLOYED.md` - Feature overview
- `/docs/MODERN_SCHEDULING_QUICK_START.md` - User guide
- `/TEST_CREDENTIALS.md` - All test accounts

---

**Happy scheduling! 🎉**


