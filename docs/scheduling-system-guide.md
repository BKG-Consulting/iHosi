# 🏥 Healthcare Scheduling System - Complete Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Core Features](#core-features)
4. [User Interface Guide](#user-interface-guide)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Workflow Examples](#workflow-examples)
8. [Troubleshooting](#troubleshooting)
9. [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

The Healthcare Scheduling System is a comprehensive solution designed to manage doctor schedules, appointments, and availability in a healthcare environment. It provides a modern, intuitive interface for doctors to configure their working hours, manage time slots, handle leave requests, and detect scheduling conflicts.

### Key Benefits
- **Efficient Schedule Management**: Streamlined workflow for setting up and managing doctor schedules
- **Conflict Prevention**: Proactive detection and resolution of scheduling conflicts
- **Template System**: Reusable schedule configurations for different scenarios
- **Leave Management**: Integrated vacation and leave request system
- **Real-time Updates**: Instant synchronization across all components
- **Audit Trail**: Complete logging of all schedule changes

---

## 🏗️ System Architecture

### Frontend Components
```
components/doctor/schedule-setup/
├── ScheduleSetup.tsx          # Main scheduling interface
├── TimeSlotManager.tsx        # Time slot management
└── ConflictDetector.tsx       # Conflict detection and resolution
```

### Backend API
```
app/api/doctors/[id]/schedule/
└── route.ts                   # Schedule CRUD operations
```

### Services
```
services/
├── schedule-service.ts        # Schedule business logic
└── scheduling-service.ts      # Appointment scheduling
```

### Types
```
types/
└── scheduling.ts              # TypeScript definitions
```

---

## ⚙️ Core Features

### 1. Working Hours Management
**Purpose**: Configure daily working hours and break times for each day of the week.

**Features**:
- Set start and end times for each day
- Configure break periods (lunch, coffee breaks)
- Set maximum appointments per day
- Enable/disable working days
- Visual day indicators with unique icons

**Data Structure**:
```typescript
interface WorkingHours {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isWorking: boolean;
  startTime: string;        // Format: "HH:MM"
  endTime: string;          // Format: "HH:MM"
  breakStart?: string;      // Format: "HH:MM"
  breakEnd?: string;        // Format: "HH:MM"
  maxAppointments?: number; // Default: 20
}
```

### 2. Schedule Templates
**Purpose**: Create and manage reusable schedule configurations for different scenarios.

**Use Cases**:
- **Standard Schedule**: Regular 9-5 with lunch break
- **Emergency Schedule**: Extended hours for emergency coverage
- **Part-time Schedule**: Reduced hours for part-time doctors
- **Weekend Schedule**: Special weekend coverage patterns

**Features**:
- Save current schedule as template
- Apply existing templates
- Edit template configurations
- Set default templates
- Template sharing between doctors

**Data Structure**:
```typescript
interface ScheduleTemplate {
  id: string;
  name: string;
  description?: string;
  workingHours: WorkingHours[];
  appointmentDuration: number;  // minutes
  bufferTime: number;           // minutes between appointments
  isDefault?: boolean;
}
```

### 3. Appointment Settings
**Purpose**: Configure default appointment durations and buffer times.

**Settings**:
- **Default Appointment Duration**: 15, 30, 45, 60, 90, or 120 minutes
- **Buffer Time**: 0, 5, 10, 15, or 30 minutes between appointments
- **Maximum Bookings**: Per time slot capacity
- **Appointment Types**: Regular, Emergency, Follow-up, Consultation

### 4. Time Slot Management
**Purpose**: Generate and manage individual appointment time slots.

**Features**:
- **Auto-Generation**: Automatically create slots based on working hours
- **Custom Slots**: Add special time slots outside regular hours
- **Slot Configuration**: Set duration, type, and capacity for each slot
- **Availability Toggle**: Enable/disable individual slots
- **Visual Status**: Clear indicators for available, full, or unavailable slots

**Slot Types**:
- **Regular**: Standard appointment slots
- **Emergency**: Emergency appointment slots
- **Follow-up**: Follow-up appointment slots
- **Consultation**: Consultation appointment slots

### 5. Leave Management
**Purpose**: Submit and manage vacation and leave requests.

**Leave Types**:
- **Vacation**: Planned time off
- **Sick Leave**: Illness-related absence
- **Personal**: Personal time off
- **Conference**: Professional development
- **Other**: Miscellaneous leave

**Workflow**:
1. Submit leave request with dates and reason
2. Request goes to PENDING status
3. Admin approval required
4. Approved requests block scheduling during leave period
5. Automatic conflict detection with existing appointments

**Data Structure**:
```typescript
interface LeaveRequest {
  id: string;
  startDate: string;        // Format: "YYYY-MM-DD"
  endDate: string;          // Format: "YYYY-MM-DD"
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  type: 'VACATION' | 'SICK_LEAVE' | 'PERSONAL' | 'CONFERENCE' | 'OTHER';
}
```

### 6. Conflict Detection
**Purpose**: Identify and resolve scheduling conflicts automatically.

**Conflict Types**:
- **Overlap**: Time slots that overlap with each other
- **Break Violation**: Slots scheduled during break time
- **Working Hours**: Slots outside defined working hours
- **Leave Conflict**: Slots during approved leave periods
- **Double Booking**: Multiple appointments in the same slot

**Severity Levels**:
- **Critical**: Leave conflicts, double bookings
- **High**: Working hours violations, overlaps
- **Medium**: Break time violations
- **Low**: Minor scheduling issues

**Resolution**:
- **Auto-Fix**: Automatically resolve fixable conflicts
- **Manual Fix**: Provide suggestions for manual resolution
- **Prevention**: Proactive conflict prevention during scheduling

---

## 🖥️ User Interface Guide

### Main Interface Tabs

#### 1. Working Hours Tab
**Purpose**: Configure weekly working schedule

**Interface Elements**:
- Day-by-day configuration cards
- Time pickers for start/end times
- Break time configuration
- Maximum appointments setting
- Working day toggle switch

**How to Use**:
1. Select a day of the week
2. Toggle "Working" switch if the day is a working day
3. Set start and end times using time pickers
4. Configure break times (optional)
5. Set maximum appointments for the day
6. Repeat for all days

#### 2. Templates Tab
**Purpose**: Manage schedule templates

**Interface Elements**:
- Template cards with configuration details
- Add new template button
- Apply template button
- Edit/delete template options
- Default template indicator

**How to Use**:
1. Click "Add Template" to create a new template
2. Configure the template with desired settings
3. Save the template with a descriptive name
4. Use "Apply" to load a template's settings
5. Set templates as default for quick access

#### 3. Settings Tab
**Purpose**: Configure appointment defaults

**Interface Elements**:
- Appointment duration dropdown
- Buffer time dropdown
- Save settings button

**How to Use**:
1. Select default appointment duration
2. Set buffer time between appointments
3. Click "Save Schedule" to apply changes

#### 4. Leave Management Tab
**Purpose**: Manage vacation and leave requests

**Interface Elements**:
- Leave request cards
- Add leave request button
- Status indicators
- Edit/delete options

**How to Use**:
1. Click "Add Leave Request"
2. Select start and end dates
3. Choose leave type
4. Provide reason for leave
5. Submit request for approval

#### 5. Analytics Tab
**Purpose**: View schedule performance metrics (Future Feature)

**Planned Features**:
- Schedule utilization rates
- Conflict frequency analysis
- Appointment completion rates
- Time slot efficiency metrics

### Action Buttons

#### Save Schedule
**Function**: Saves all schedule configurations to the database
**Process**:
1. Validates all schedule data
2. Calls API endpoint `/api/doctors/[id]/schedule`
3. Updates database with new schedule
4. Shows success/error toast notification
5. Triggers audit logging

#### Export Schedule
**Function**: Exports schedule data in various formats
**Formats**:
- **JSON**: Complete schedule data structure
- **CSV**: Working hours in spreadsheet format
- **iCal**: Calendar format for external calendar apps

#### Import Schedule
**Function**: Imports schedule data from external sources
**Supported Formats**:
- **JSON**: Complete schedule import
- **CSV**: Working hours import

---

## 🔌 API Documentation

### Endpoints

#### GET `/api/doctors/[id]/schedule`
**Purpose**: Fetch doctor's complete schedule configuration

**Response**:
```json
{
  "success": true,
  "data": {
    "workingHours": [
      {
        "day": "Monday",
        "isWorking": true,
        "startTime": "09:00",
        "endTime": "17:00",
        "breakStart": "12:00",
        "breakEnd": "13:00",
        "maxAppointments": 20
      }
    ],
    "appointmentDuration": 30,
    "bufferTime": 5,
    "leaveRequests": [
      {
        "id": "leave-123",
        "startDate": "2024-01-15",
        "endDate": "2024-01-20",
        "reason": "Vacation",
        "status": "APPROVED",
        "type": "VACATION"
      }
    ]
  }
}
```

#### PUT `/api/doctors/[id]/schedule`
**Purpose**: Update doctor's schedule configuration

**Request Body**:
```json
{
  "workingHours": [...],
  "appointmentDuration": 30,
  "bufferTime": 5,
  "templates": [...]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Schedule updated successfully"
}
```

#### POST `/api/doctors/[id]/schedule`
**Purpose**: Create new leave request

**Request Body**:
```json
{
  "startDate": "2024-01-15",
  "endDate": "2024-01-20",
  "reason": "Family vacation",
  "type": "VACATION"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Leave request created successfully",
  "data": {
    "id": "leave-123",
    "startDate": "2024-01-15",
    "endDate": "2024-01-20",
    "reason": "Family vacation",
    "status": "PENDING",
    "type": "VACATION"
  }
}
```

---

## 🗄️ Database Schema

### WorkingDays Table
```sql
CREATE TABLE WorkingDays (
  id SERIAL PRIMARY KEY,
  doctor_id VARCHAR(255) NOT NULL,
  day_of_week VARCHAR(20) NOT NULL,
  is_working BOOLEAN DEFAULT false,
  start_time TIME,
  end_time TIME,
  break_start_time TIME,
  break_end_time TIME,
  max_appointments INTEGER DEFAULT 20,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id, day_of_week)
);
```

### LeaveRequest Table
```sql
CREATE TABLE LeaveRequest (
  id SERIAL PRIMARY KEY,
  doctor_id VARCHAR(255) NOT NULL,
  leave_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'PENDING',
  approved_by VARCHAR(255),
  approved_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### AvailabilityUpdate Table
```sql
CREATE TABLE AvailabilityUpdate (
  id SERIAL PRIMARY KEY,
  doctor_id VARCHAR(255) NOT NULL,
  update_type VARCHAR(50) NOT NULL,
  effective_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  reason TEXT,
  is_temporary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 Workflow Examples

### Example 1: Setting Up a New Doctor's Schedule

1. **Access Schedule Setup**
   - Navigate to Doctor Dashboard
   - Click "Schedule Setup" tab

2. **Configure Working Hours**
   - Set Monday-Friday: 9:00 AM - 5:00 PM
   - Set lunch break: 12:00 PM - 1:00 PM
   - Set Saturday: 9:00 AM - 1:00 PM
   - Set Sunday: Not working

3. **Set Appointment Settings**
   - Default duration: 30 minutes
   - Buffer time: 5 minutes

4. **Generate Time Slots**
   - Use "Auto Generate" to create slots
   - Review and adjust as needed

5. **Save Schedule**
   - Click "Save Schedule"
   - Verify success message

### Example 2: Creating a Schedule Template

1. **Configure Schedule**
   - Set up desired working hours
   - Configure appointment settings

2. **Save as Template**
   - Click "Add Template"
   - Enter template name: "Emergency Coverage"
   - Add description: "Extended hours for emergency coverage"

3. **Apply Template**
   - Select template from list
   - Click "Apply"
   - Verify settings are loaded

### Example 3: Managing Leave Requests

1. **Submit Leave Request**
   - Click "Add Leave Request"
   - Select dates: January 15-20, 2024
   - Choose type: "Vacation"
   - Enter reason: "Family vacation"

2. **Monitor Status**
   - View request in "Leave Management" tab
   - Status shows as "PENDING"
   - Wait for admin approval

3. **Handle Conflicts**
   - System detects conflicts with existing appointments
   - Resolve conflicts before leave period

### Example 4: Conflict Resolution

1. **Detect Conflicts**
   - Click "Scan for Conflicts"
   - Review detected issues

2. **Resolve Auto-Fixable Conflicts**
   - Click "Auto Fix" on fixable conflicts
   - System automatically resolves issues

3. **Handle Manual Conflicts**
   - Review suggested fixes
   - Manually adjust schedule as needed

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: Schedule Not Saving
**Symptoms**: Toast shows "Failed to save schedule"
**Causes**:
- Network connectivity issues
- Invalid schedule data
- Permission problems
- Server errors

**Solutions**:
1. Check internet connection
2. Verify all required fields are filled
3. Ensure user has proper permissions
4. Check server logs for errors

#### Issue: Time Slots Not Generating
**Symptoms**: No time slots appear after clicking "Auto Generate"
**Causes**:
- Working hours not configured
- Invalid time format
- Break time conflicts

**Solutions**:
1. Ensure working hours are set
2. Verify time format (HH:MM)
3. Check break time configuration

#### Issue: Leave Request Not Submitting
**Symptoms**: Leave request remains in draft state
**Causes**:
- Missing required fields
- Invalid date format
- Date conflicts

**Solutions**:
1. Fill all required fields
2. Use correct date format (YYYY-MM-DD)
3. Check for date conflicts

### Error Messages

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Invalid time format" | Time not in HH:MM format | Use 24-hour format (e.g., "09:00") |
| "Start time after end time" | Invalid time range | Ensure start time is before end time |
| "Break time outside working hours" | Break time conflicts | Adjust break time or working hours |
| "Maximum appointments exceeded" | Too many appointments set | Reduce maximum appointments |
| "Leave dates in the past" | Invalid leave dates | Select future dates for leave |

---

## 🚀 Future Enhancements

### Planned Features

#### 1. Schedule Analytics
- **Utilization Reports**: Track schedule efficiency
- **Conflict Analysis**: Identify recurring conflict patterns
- **Performance Metrics**: Measure scheduling system effectiveness
- **Trend Analysis**: Historical schedule performance data

#### 2. Advanced Templates
- **Seasonal Templates**: Different schedules for different seasons
- **Role-based Templates**: Templates for different doctor roles
- **Department Templates**: Shared templates across departments
- **Template Marketplace**: Share templates between organizations

#### 3. Integration Features
- **Calendar Sync**: Google Calendar, Outlook integration
- **Mobile App**: Native mobile application
- **API Webhooks**: Real-time notifications
- **Third-party Integrations**: EHR system integration

#### 4. Advanced Conflict Resolution
- **AI-powered Suggestions**: Machine learning for conflict resolution
- **Automated Rescheduling**: Smart rescheduling algorithms
- **Predictive Analytics**: Forecast scheduling conflicts
- **Optimization Engine**: Optimal schedule generation

#### 5. Enhanced User Experience
- **Drag-and-drop Interface**: Visual schedule editing
- **Bulk Operations**: Mass schedule updates
- **Keyboard Shortcuts**: Power user features
- **Customizable Dashboard**: Personalized interface

### Technical Improvements

#### 1. Performance Optimization
- **Caching**: Redis caching for frequently accessed data
- **Database Indexing**: Optimized database queries
- **Lazy Loading**: On-demand data loading
- **CDN Integration**: Static asset optimization

#### 2. Security Enhancements
- **Role-based Access**: Granular permission system
- **Audit Logging**: Comprehensive activity tracking
- **Data Encryption**: End-to-end encryption
- **Compliance**: HIPAA compliance features

#### 3. Scalability
- **Microservices**: Service-oriented architecture
- **Load Balancing**: Distributed system architecture
- **Database Sharding**: Horizontal database scaling
- **Containerization**: Docker deployment

---

## 📞 Support

### Getting Help
- **Documentation**: Refer to this guide for detailed information
- **API Reference**: Check API documentation for technical details
- **Error Logs**: Review application logs for debugging
- **Community**: Join our developer community for support

### Contact Information
- **Technical Support**: support@healthcare-system.com
- **Documentation**: docs@healthcare-system.com
- **Feature Requests**: features@healthcare-system.com

---

*This documentation is regularly updated to reflect the latest features and improvements. Last updated: January 2024*

