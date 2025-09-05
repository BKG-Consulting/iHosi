# 📅 **Schedule Creation Guide**

## **How to Create a Doctor's Schedule**

The enterprise scheduling system provides multiple ways to create and manage doctor schedules. Here's a comprehensive guide on how the schedule creation process works:

---

## **🎯 Overview of Schedule Creation**

### **What Gets Created:**
1. **Main Schedule** - The overall schedule container
2. **Schedule Templates** - Weekly working patterns (e.g., Monday 9-5, Tuesday 9-5)
3. **Time Slots** - Individual appointment slots (automatically generated)
4. **Availability Rules** - Booking rules and conflict resolution

---

## **📋 Step-by-Step Process**

### **Step 1: Basic Information**
```typescript
// What you need to provide:
{
  name: "Regular Schedule",           // e.g., "Regular Schedule", "Emergency Coverage"
  description: "Standard working hours", // Optional description
  schedule_type: "REGULAR",          // REGULAR, EMERGENCY, ON_CALL, CONSULTATION
  timezone: "America/New_York"       // Doctor's timezone
}
```

### **Step 2: Schedule Settings**
```typescript
// Configuration options:
{
  auto_accept_bookings: true,        // Auto-accept new appointments
  require_confirmation: false,       // Require manual confirmation
  max_advance_booking_days: 30,      // How far in advance patients can book
  min_advance_booking_hours: 2,      // Minimum notice required
  conflict_resolution: "PREVENT_BOOKING" // How to handle conflicts
}
```

### **Step 3: Working Hours Template**
```typescript
// Weekly schedule pattern:
{
  working_days: [1, 2, 3, 4, 5],    // Monday-Friday (0=Sunday, 1=Monday, etc.)
  start_time: "09:00",               // Daily start time
  end_time: "17:00",                 // Daily end time
  break_start: "12:00",              // Lunch break start
  break_end: "13:00",                // Lunch break end
  appointment_duration: 30,          // Minutes per appointment
  buffer_time: 15,                   // Buffer between appointments
  max_appointments_per_day: 20       // Maximum daily appointments
}
```

---

## **🛠️ Three Ways to Create Schedules**

### **1. 🎨 Visual Schedule Creation (Recommended)**

**Location:** Doctor Dashboard → Schedule Tab → "New Schedule" button

**Process:**
1. Click "New Schedule" button
2. Fill out the 3-step wizard:
   - **Step 1:** Basic info (name, type, timezone)
   - **Step 2:** Settings (auto-accept, conflict resolution)
   - **Step 3:** Working hours (days, times, breaks)
3. Click "Create Schedule"
4. System automatically generates time slots for next 30 days

**Example:**
```
Schedule Name: "Regular Schedule"
Type: Regular
Working Days: Monday-Friday
Hours: 9:00 AM - 5:00 PM
Break: 12:00 PM - 1:00 PM
Appointment Duration: 30 minutes
Buffer: 15 minutes
```

### **2. 🔧 API-Based Creation**

**For developers or automated systems:**

```typescript
// Create main schedule
const schedule = await fetch('/api/scheduling/doctor/[doctorId]/schedules', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Regular Schedule",
    description: "Standard working hours",
    schedule_type: "REGULAR",
    timezone: "America/New_York",
    auto_accept_bookings: true,
    require_confirmation: false,
    max_advance_booking_days: 30,
    min_advance_booking_hours: 2,
    conflict_resolution: "PREVENT_BOOKING"
  })
});

// Create schedule templates for each working day
for (const day of [1, 2, 3, 4, 5]) { // Monday-Friday
  await fetch(`/api/scheduling/schedules/${schedule.id}/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `${getDayName(day)} Schedule`,
      day_of_week: day,
      start_time: "09:00",
      end_time: "17:00",
      is_working: true,
      break_start: "12:00",
      break_end: "13:00",
      appointment_duration: 30,
      buffer_time: 15,
      max_appointments: 20
    })
  });
}
```

### **3. 📱 Mobile App Creation**

**For mobile applications:**

```typescript
// Using the React hook
const { createSchedule, createScheduleTemplate } = useEnterpriseScheduling({
  doctorId: "doctor_123"
});

// Create schedule
const schedule = await createSchedule({
  name: "Mobile Schedule",
  schedule_type: "REGULAR",
  timezone: "America/New_York"
});

// Add working day template
await createScheduleTemplate(schedule.id, {
  name: "Monday Schedule",
  day_of_week: 1,
  start_time: "09:00",
  end_time: "17:00",
  is_working: true,
  appointment_duration: 30,
  buffer_time: 15
});
```

---

## **⚡ What Happens After Creation**

### **Automatic Time Slot Generation**
Once you create a schedule with templates, the system automatically:

1. **Generates Time Slots** for the next 30 days
2. **Creates Available Slots** based on your working hours
3. **Excludes Break Times** from available slots
4. **Applies Buffer Times** between appointments
5. **Respects Maximum Appointments** per day

### **Example Generated Slots:**
```
Monday, January 15, 2024:
- 09:00 - 09:30 (Available)
- 09:45 - 10:15 (Available)
- 10:30 - 11:00 (Available)
- 11:15 - 11:45 (Available)
- 12:00 - 13:00 (Break - Not Available)
- 13:00 - 13:30 (Available)
- 13:45 - 14:15 (Available)
... and so on until 17:00
```

---

## **🎛️ Advanced Schedule Management**

### **Multiple Schedules**
Doctors can have multiple schedules:
- **Regular Schedule** - Standard working hours
- **Emergency Schedule** - Emergency-only appointments
- **On-Call Schedule** - On-call availability
- **Consultation Schedule** - Special consultation hours

### **Availability Overrides**
For special circumstances:
```typescript
// Create override for personal leave
await createAvailabilityOverride({
  override_type: "PERSONAL_LEAVE",
  title: "Personal Leave",
  start_date: new Date("2024-01-20"),
  end_date: new Date("2024-01-22"),
  is_available: false
});

// Create override for extended hours
await createAvailabilityOverride({
  override_type: "EXTENDED_HOURS",
  title: "Extended Hours",
  start_date: new Date("2024-01-25"),
  end_date: new Date("2024-01-25"),
  start_time: "08:00",
  end_time: "20:00",
  is_available: true
});
```

---

## **🔍 Schedule Validation & Conflict Detection**

### **Automatic Validation**
The system automatically checks for:
- **Double Bookings** - Prevents overlapping appointments
- **Outside Working Hours** - Blocks appointments outside schedule
- **Doctor Unavailability** - Respects overrides and leave periods
- **Minimum Advance Notice** - Enforces booking rules

### **Conflict Resolution Strategies**
1. **Prevent Booking** - Block conflicting appointments
2. **Auto Reschedule** - Suggest alternative times
3. **Manual Review** - Require approval for conflicts
4. **Allow Override** - Allow with warning

---

## **📊 Schedule Analytics**

### **Available Metrics**
- **Utilization Rate** - Percentage of slots booked
- **No-Show Rate** - Percentage of missed appointments
- **Cancellation Rate** - Percentage of cancelled appointments
- **Revenue Metrics** - If applicable
- **Peak Hours** - Most popular appointment times

### **Accessing Analytics**
```typescript
const analytics = await getSchedulingAnalytics(
  doctorId,
  startDate,
  endDate
);

console.log(analytics.summary);
// {
//   totalSlots: 200,
//   bookedSlots: 150,
//   utilizationRate: 75,
//   averageUtilization: 78.5
// }
```

---

## **🚀 Best Practices**

### **1. Start Simple**
- Begin with a basic regular schedule
- Add complexity (multiple schedules, overrides) as needed
- Test with a few appointments before going live

### **2. Set Realistic Buffer Times**
- 15-30 minutes between appointments
- Consider travel time between locations
- Account for documentation time

### **3. Use Appropriate Conflict Resolution**
- **Prevent Booking** for most cases
- **Manual Review** for high-value appointments
- **Auto Reschedule** for routine appointments

### **4. Regular Maintenance**
- Review and update schedules monthly
- Monitor utilization rates
- Adjust based on patient demand

### **5. Backup Plans**
- Always have emergency availability overrides
- Set up on-call schedules for urgent cases
- Maintain communication channels for schedule changes

---

## **🆘 Troubleshooting**

### **Common Issues:**

**Q: Time slots not generating?**
A: Check that schedule templates are created and `is_working: true`

**Q: Patients can't book appointments?**
A: Verify `auto_accept_bookings: true` or check conflict resolution settings

**Q: Appointments showing as conflicts?**
A: Check for overlapping time slots or availability overrides

**Q: Wrong timezone?**
A: Update the schedule timezone and regenerate templates

### **Getting Help:**
- Check the audit logs for detailed error information
- Use the conflict detection API to identify issues
- Review the schedule analytics for patterns

---

## **📱 Integration Examples**

### **Web Application**
```typescript
// In your React component
import { EnterpriseScheduleManager } from '@/components/scheduling/EnterpriseScheduleManager';

<EnterpriseScheduleManager 
  doctorId={doctor.id} 
  onScheduleUpdate={() => refreshData()}
/>
```

### **Mobile App**
```typescript
// Using the hook
const { createSchedule, fetchSchedules } = useEnterpriseScheduling({
  doctorId: user.id
});

// Create schedule from mobile
const handleCreateSchedule = async () => {
  await createSchedule({
    name: "Mobile Schedule",
    schedule_type: "REGULAR"
  });
};
```

### **API Integration**
```typescript
// Direct API calls
const response = await fetch('/api/scheduling/doctor/123/schedules', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(scheduleData)
});
```

---

This comprehensive guide covers all aspects of schedule creation in the enterprise scheduling system. The system is designed to be flexible, scalable, and easy to use while maintaining the security and compliance standards required for healthcare applications.

