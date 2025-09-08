# Scheduling System Models Overview

## Database Models (Prisma Schema)

### 1. Doctor Model
```prisma
model Doctor {
  id                    String   @id
  appointment_duration  Int @default(30) // Default appointment duration in minutes
  buffer_time           Int @default(5)  // Buffer time between appointments in minutes
  availability_status   AvailabilityStatus @default(AVAILABLE)
  // ... other fields
}
```

### 2. WorkingDays Model
```prisma
model WorkingDays {
  id              Int   @id @default(autoincrement())
  doctor_id       String
  day_of_week     String  // 'Monday', 'Tuesday', etc.
  start_time      String  // '09:00'
  end_time        String  // '17:00'
  is_working      Boolean @default(true)
  break_start_time String? // '12:00'
  break_end_time  String? // '13:00'
  max_appointments Int @default(20)
  
  doctor          Doctor  @relation(fields: [doctor_id], references: [id], onDelete: Cascade)
  
  @@unique([doctor_id, day_of_week])
  @@index([doctor_id])
}
```

### 3. LeaveRequest Model
```prisma
model LeaveRequest {
  id          Int      @id @default(autoincrement())
  doctor_id   String
  start_date  DateTime
  end_date    DateTime
  reason      String
  leave_type  LeaveType // VACATION, SICK_LEAVE, PERSONAL, CONFERENCE
  status      String    // PENDING, APPROVED, REJECTED
  
  doctor      Doctor    @relation(fields: [doctor_id], references: [id], onDelete: Cascade)
}
```

### 4. AvailabilityUpdate Model
```prisma
model AvailabilityUpdate {
  id          Int      @id @default(autoincrement())
  doctor_id   String
  status      String   // AVAILABLE, UNAVAILABLE, BUSY
  reason      String?
  start_time  DateTime?
  end_time    DateTime?
  
  doctor      Doctor   @relation(fields: [doctor_id], references: [id], onDelete: Cascade)
}
```

## Frontend TypeScript Interfaces

### 1. WorkingHours Interface
```typescript
interface WorkingHours {
  day: string;                    // 'Monday', 'Tuesday', etc.
  isWorking: boolean;
  startTime: string;              // '09:00'
  endTime: string;                // '17:00'
  breakStart?: string;            // '12:00'
  breakEnd?: string;              // '13:00'
  maxAppointments?: number;       // 20
}
```

### 2. ScheduleTemplate Interface
```typescript
interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  workingHours: WorkingHours[];
  appointmentDuration: number;    // 30
  bufferTime: number;             // 5
  isDefault: boolean;
}
```

### 3. LeaveRequest Interface
```typescript
interface LeaveRequest {
  id: string;
  startDate: string;              // '2024-01-15'
  endDate: string;                // '2024-01-20'
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  type: 'VACATION' | 'SICK_LEAVE' | 'PERSONAL' | 'CONFERENCE' | 'OTHER';
}
```

## Data Flow

### 1. Loading Schedule Data
```
Frontend (ScheduleSetup) 
  → GET /api/doctors/[id]/schedule
  → Database (WorkingDays, Doctor, LeaveRequest)
  → Transform to Frontend Interfaces
  → Display in UI
```

### 2. Saving Schedule Data
```
Frontend (ScheduleSetup)
  → PUT /api/doctors/[id]/schedule
  → Validate with Zod Schema
  → Update Database (WorkingDays, Doctor)
  → Refresh Frontend Data
  → Show Success Message
```

### 3. Creating Leave Request
```
Frontend (ScheduleSetup)
  → POST /api/doctors/[id]/schedule
  → Validate Leave Request
  → Create in Database (LeaveRequest)
  → Update Frontend State
  → Show Success Message
```

## Key Points

1. **Database Fields**: Use snake_case (`day_of_week`, `start_time`, `end_time`)
2. **Frontend Fields**: Use camelCase (`day`, `startTime`, `endTime`)
3. **Data Transformation**: API endpoints handle the conversion between formats
4. **Default Values**: Always provide fallbacks for missing data
5. **Validation**: Use Zod schemas for API request validation
6. **State Management**: Frontend uses React state with proper loading states

## Common Issues to Avoid

1. **Field Name Mismatches**: Always check database vs frontend field names
2. **Undefined Variables**: Ensure all variables are in scope before use
3. **Type Mismatches**: Use proper TypeScript interfaces consistently
4. **Missing Defaults**: Always provide fallback values for optional fields
5. **State Updates**: Refresh data after mutations to show current state
