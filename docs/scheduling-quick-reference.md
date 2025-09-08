# 🏥 Scheduling System - Quick Reference Guide

## 🚀 Quick Start

### 1. Access Schedule Setup
- Navigate to **Doctor Dashboard**
- Click **"Schedule Setup"** tab

### 2. Configure Working Hours
- Set **start/end times** for each day
- Configure **break times** (lunch, coffee breaks)
- Set **maximum appointments** per day
- Toggle **working days** on/off

### 3. Save Schedule
- Click **"Save Schedule"** button
- ✅ **Now actually saves to database!**
- Shows success/error toast notification

---

## 📋 Feature Overview

| Feature | Purpose | How to Use |
|---------|---------|------------|
| **Working Hours** | Set daily schedule | Configure start/end times, breaks, max appointments |
| **Templates** | Save/load schedule configs | Create templates, apply existing ones |
| **Settings** | Default appointment settings | Set duration (15-120 min), buffer time (0-30 min) |
| **Leave Management** | Submit vacation requests | Add leave dates, select type, provide reason |
| **Conflict Detection** | Find scheduling issues | Click "Scan for Conflicts", review and fix |

---

## ⚙️ Working Hours Configuration

### Daily Setup
```
Monday-Friday: 9:00 AM - 5:00 PM
Lunch Break: 12:00 PM - 1:00 PM
Max Appointments: 20 per day

Saturday: 9:00 AM - 1:00 PM
Max Appointments: 10

Sunday: Not Working
```

### Time Format
- Use **24-hour format**: `09:00`, `17:00`
- Break times are **optional**
- Maximum appointments: **1-50** per day

---

## 📅 Schedule Templates

### Creating Templates
1. Configure your desired schedule
2. Click **"Add Template"**
3. Enter template name and description
4. Template is saved for future use

### Applying Templates
1. Select template from the list
2. Click **"Apply"**
3. Settings are loaded instantly
4. Modify as needed and save

### Template Types
- **Standard Schedule**: Regular 9-5 with breaks
- **Emergency Coverage**: Extended hours
- **Part-time**: Reduced hours
- **Weekend**: Special weekend patterns

---

## ⏰ Time Slot Management

### Auto-Generation
- Click **"Auto Generate"** to create slots
- Based on working hours and appointment duration
- Automatically skips break times
- Creates slots with buffer time between them

### Custom Slots
- Add special time slots outside regular hours
- Set different durations and types
- Configure maximum bookings per slot
- Toggle availability on/off

### Slot Types
- **Regular**: Standard appointments
- **Emergency**: Emergency appointments
- **Follow-up**: Follow-up visits
- **Consultation**: Consultations

---

## 🏖️ Leave Management

### Submit Leave Request
1. Click **"Add Leave Request"**
2. Select **start and end dates**
3. Choose **leave type**:
   - Vacation
   - Sick Leave
   - Personal
   - Conference
   - Other
4. Provide **reason** for leave
5. Submit for approval

### Leave Status
- **PENDING**: Awaiting admin approval
- **APPROVED**: Leave is approved, blocks scheduling
- **REJECTED**: Leave request denied

### Conflict Handling
- System detects conflicts with existing appointments
- Shows warnings before leave period
- Requires resolution before approval

---

## 🔍 Conflict Detection

### Conflict Types
| Type | Severity | Description |
|------|----------|-------------|
| **Overlap** | High | Time slots that overlap |
| **Break Violation** | Medium | Slots during break time |
| **Working Hours** | High | Slots outside working hours |
| **Leave Conflict** | Critical | Slots during approved leave |
| **Double Booking** | Critical | Multiple appointments in same slot |

### Resolution
- **Auto-Fix**: Click "Auto Fix" for automatic resolution
- **Manual Fix**: Follow suggested fixes
- **Prevention**: System prevents conflicts during scheduling

---

## 💾 Data Persistence

### What Gets Saved
✅ **Working Hours**: Daily schedule configuration
✅ **Appointment Settings**: Duration and buffer time
✅ **Templates**: Saved schedule configurations
✅ **Leave Requests**: Submitted vacation requests
✅ **Time Slots**: Generated appointment slots

### API Endpoints
- **GET** `/api/doctors/[id]/schedule` - Fetch schedule
- **PUT** `/api/doctors/[id]/schedule` - Update schedule
- **POST** `/api/doctors/[id]/schedule` - Create leave request

### Database Tables
- `WorkingDays` - Daily working hours
- `LeaveRequest` - Vacation/leave requests
- `AvailabilityUpdate` - Schedule changes

---

## 🎯 Best Practices

### Schedule Configuration
1. **Set realistic working hours** based on your capacity
2. **Include adequate break times** for rest and meals
3. **Set appropriate buffer times** between appointments
4. **Use templates** for different scenarios
5. **Regularly review and update** your schedule

### Conflict Prevention
1. **Run conflict detection** before saving changes
2. **Resolve conflicts immediately** when detected
3. **Plan leave requests** well in advance
4. **Coordinate with team** for coverage during leave
5. **Monitor schedule utilization** regularly

### Template Management
1. **Create templates** for common scenarios
2. **Use descriptive names** for easy identification
3. **Set default templates** for quick access
4. **Share templates** with team members
5. **Update templates** as needs change

---

## 🚨 Common Issues & Solutions

### Schedule Not Saving
**Problem**: "Failed to save schedule" error
**Solution**: 
- Check internet connection
- Verify all required fields are filled
- Ensure proper permissions

### Time Slots Not Generating
**Problem**: No slots appear after auto-generation
**Solution**:
- Ensure working hours are configured
- Check time format (HH:MM)
- Verify break time settings

### Leave Request Issues
**Problem**: Leave request not submitting
**Solution**:
- Fill all required fields
- Use correct date format (YYYY-MM-DD)
- Check for date conflicts

### Conflict Detection Problems
**Problem**: Conflicts not detected
**Solution**:
- Ensure working hours are set
- Check for overlapping time slots
- Verify leave request dates

---

## 📱 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save schedule |
| `Ctrl + T` | Add template |
| `Ctrl + L` | Add leave request |
| `Ctrl + F` | Scan for conflicts |
| `Escape` | Cancel current action |

---

## 🔄 Workflow Examples

### New Doctor Setup
1. Access Schedule Setup
2. Configure Monday-Friday: 9-5 with lunch break
3. Set Saturday: 9-1, Sunday: off
4. Set 30-minute appointments, 5-minute buffer
5. Auto-generate time slots
6. Save schedule

### Vacation Planning
1. Plan vacation dates
2. Submit leave request
3. Check for appointment conflicts
4. Resolve conflicts if any
5. Wait for approval
6. Confirm schedule is blocked

### Emergency Coverage
1. Create "Emergency" template
2. Set extended hours (8 AM - 8 PM)
3. Reduce appointment duration to 20 minutes
4. Apply template when needed
5. Save as temporary schedule

---

## 📊 Status Indicators

### Time Slot Status
- 🟢 **Green**: Available for booking
- 🟡 **Yellow**: Fully booked
- 🔴 **Red**: Unavailable/disabled

### Leave Request Status
- 🟡 **Yellow**: Pending approval
- 🟢 **Green**: Approved
- 🔴 **Red**: Rejected

### Conflict Severity
- 🔴 **Critical**: Must be resolved immediately
- 🟠 **High**: Should be resolved soon
- 🟡 **Medium**: Can be addressed later
- 🔵 **Low**: Minor issue

---

*This quick reference guide provides essential information for using the scheduling system effectively. For detailed information, refer to the complete documentation.*

