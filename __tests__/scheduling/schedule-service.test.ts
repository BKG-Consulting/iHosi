/**
 * Unit Tests for Enterprise Schedule Service
 * 
 * Comprehensive test suite for the scheduling system with proper mocking,
 * edge case testing, and validation coverage.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ScheduleService } from '@/services/scheduling/schedule-service';
import { ValidationService } from '@/services/scheduling/validation-service';
import { errorHandler } from '@/services/scheduling/error-handler';
import { WorkingDay, ScheduleData } from '@/types/schedule-types';

// Mock database
jest.mock('@/lib/db', () => ({
  doctor: {
    findUnique: jest.fn(),
    findMany: jest.fn()
  },
  workingDays: {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn()
  },
  scheduleTemplates: {
    findMany: jest.fn()
  },
  scheduleExceptions: {
    findMany: jest.fn()
  },
  calendarIntegrations: {
    findMany: jest.fn()
  },
  scheduleConflicts: {
    findMany: jest.fn()
  },
  scheduleAnalytics: {
    findMany: jest.fn()
  },
  scheduleNotifications: {
    findMany: jest.fn()
  },
  appointment: {
    findMany: jest.fn()
  },
  $transaction: jest.fn()
}));

// Mock audit logging
jest.mock('@/lib/audit', () => ({
  logAudit: jest.fn()
}));

import db from '@/lib/db';
import { logAudit } from '@/lib/audit';

describe('ScheduleService', () => {
  let scheduleService: ScheduleService;
  let validationService: ValidationService;

  beforeEach(() => {
    jest.clearAllMocks();
    scheduleService = new ScheduleService();
    validationService = new ValidationService();
  });

  describe('getDoctorSchedule', () => {
    it('should return complete schedule data for valid doctor', async () => {
      // Arrange
      const doctorId = 'doctor-123';
      const mockDoctor = { id: doctorId, name: 'Dr. Smith', availability_status: 'AVAILABLE' };
      const mockWorkingDays = [
        {
          id: 1,
          day_of_week: 'Monday',
          is_working: true,
          start_time: '09:00',
          end_time: '17:00',
          break_start_time: '12:00',
          break_end_time: '13:00',
          max_appointments: 20,
          appointment_duration: 30,
          buffer_time: 5,
          timezone: 'UTC',
          recurrence_type: 'WEEKLY',
          effective_from: null,
          effective_until: null,
          is_template: false
        }
      ];

      (db.doctor.findUnique as jest.Mock).mockResolvedValue(mockDoctor);
      (db.workingDays.findMany as jest.Mock).mockResolvedValue(mockWorkingDays);
      (db.scheduleTemplates.findMany as jest.Mock).mockResolvedValue([]);
      (db.scheduleExceptions.findMany as jest.Mock).mockResolvedValue([]);
      (db.calendarIntegrations.findMany as jest.Mock).mockResolvedValue([]);
      (db.scheduleConflicts.findMany as jest.Mock).mockResolvedValue([]);
      (db.scheduleAnalytics.findMany as jest.Mock).mockResolvedValue([]);
      (db.scheduleNotifications.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await scheduleService.getDoctorSchedule(doctorId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.workingHours).toHaveLength(1);
      expect(result.data?.workingHours[0].day).toBe('Monday');
      expect(result.data?.workingHours[0].isWorking).toBe(true);
    });

    it('should return error for non-existent doctor', async () => {
      // Arrange
      const doctorId = 'non-existent';
      (db.doctor.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await scheduleService.getDoctorSchedule(doctorId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Doctor not found');
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0].code).toBe('DOCTOR_NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const doctorId = 'doctor-123';
      (db.doctor.findUnique as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      // Act
      const result = await scheduleService.getDoctorSchedule(doctorId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch schedule');
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0].code).toBe('DATABASE_ERROR');
    });
  });

  describe('updateWorkingDays', () => {
    it('should successfully update working days with valid data', async () => {
      // Arrange
      const doctorId = 'doctor-123';
      const userId = 'user-123';
      const workingDays: WorkingDay[] = [
        {
          day: 'Monday',
          isWorking: true,
          startTime: '09:00',
          endTime: '17:00',
          breakStart: '12:00',
          breakEnd: '13:00',
          maxAppointments: 20,
          appointmentDuration: 30,
          bufferTime: 5,
          timezone: 'UTC',
          recurrenceType: 'WEEKLY',
          isTemplate: false
        }
      ];

      const mockDoctor = { id: doctorId, name: 'Dr. Smith' };
      (db.doctor.findUnique as jest.Mock).mockResolvedValue(mockDoctor);
      (db.appointment.findMany as jest.Mock).mockResolvedValue([]);
      (db.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback({
          workingDays: {
            deleteMany: jest.fn().mockResolvedValue({}),
            create: jest.fn().mockResolvedValue({ id: 1 })
          }
        });
      });

      // Act
      const result = await scheduleService.updateWorkingDays(doctorId, workingDays, userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.updatedCount).toBe(1);
      expect(logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          resourceType: 'SCHEDULE',
          resourceId: doctorId
        })
      );
    });

    it('should validate working days before updating', async () => {
      // Arrange
      const doctorId = 'doctor-123';
      const userId = 'user-123';
      const invalidWorkingDays: WorkingDay[] = [
        {
          day: 'Monday',
          isWorking: true,
          startTime: '17:00', // Invalid: start time after end time
          endTime: '09:00',
          maxAppointments: 20,
          appointmentDuration: 30,
          bufferTime: 5,
          timezone: 'UTC',
          recurrenceType: 'WEEKLY',
          isTemplate: false
        }
      ];

      const mockDoctor = { id: doctorId, name: 'Dr. Smith' };
      (db.doctor.findUnique as jest.Mock).mockResolvedValue(mockDoctor);

      // Act
      const result = await scheduleService.updateWorkingDays(doctorId, invalidWorkingDays, userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it('should handle transaction failures', async () => {
      // Arrange
      const doctorId = 'doctor-123';
      const userId = 'user-123';
      const workingDays: WorkingDay[] = [
        {
          day: 'Monday',
          isWorking: true,
          startTime: '09:00',
          endTime: '17:00',
          maxAppointments: 20,
          appointmentDuration: 30,
          bufferTime: 5,
          timezone: 'UTC',
          recurrenceType: 'WEEKLY',
          isTemplate: false
        }
      ];

      const mockDoctor = { id: doctorId, name: 'Dr. Smith' };
      (db.doctor.findUnique as jest.Mock).mockResolvedValue(mockDoctor);
      (db.appointment.findMany as jest.Mock).mockResolvedValue([]);
      (db.$transaction as jest.Mock).mockRejectedValue(new Error('Transaction failed'));

      // Act
      const result = await scheduleService.updateWorkingDays(doctorId, workingDays, userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update working days');
      expect(result.errors?.[0].code).toBe('TRANSACTION_ERROR');
    });
  });
});

describe('ValidationService', () => {
  let validationService: ValidationService;

  beforeEach(() => {
    validationService = new ValidationService();
  });

  describe('validateWorkingDays', () => {
    it('should validate working days structure', async () => {
      // Arrange
      const workingDays: WorkingDay[] = [
        {
          day: 'Monday',
          isWorking: true,
          startTime: '09:00',
          endTime: '17:00',
          maxAppointments: 20,
          appointmentDuration: 30,
          bufferTime: 5,
          timezone: 'UTC',
          recurrenceType: 'WEEKLY',
          isTemplate: false
        }
      ];

      // Act
      const result = await validationService.validateWorkingDays(workingDays, 'doctor-123');

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty working days array', async () => {
      // Arrange
      const workingDays: WorkingDay[] = [];

      // Act
      const result = await validationService.validateWorkingDays(workingDays, 'doctor-123');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('At least one working day must be configured');
    });

    it('should reject duplicate days', async () => {
      // Arrange
      const workingDays: WorkingDay[] = [
        {
          day: 'Monday',
          isWorking: true,
          startTime: '09:00',
          endTime: '17:00',
          maxAppointments: 20,
          appointmentDuration: 30,
          bufferTime: 5,
          timezone: 'UTC',
          recurrenceType: 'WEEKLY',
          isTemplate: false
        },
        {
          day: 'Monday', // Duplicate
          isWorking: true,
          startTime: '10:00',
          endTime: '18:00',
          maxAppointments: 20,
          appointmentDuration: 30,
          bufferTime: 5,
          timezone: 'UTC',
          recurrenceType: 'WEEKLY',
          isTemplate: false
        }
      ];

      // Act
      const result = await validationService.validateWorkingDays(workingDays, 'doctor-123');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Duplicate days found');
    });

    it('should validate time format', async () => {
      // Arrange
      const workingDays: WorkingDay[] = [
        {
          day: 'Monday',
          isWorking: true,
          startTime: 'invalid-time', // Invalid format
          endTime: '17:00',
          maxAppointments: 20,
          appointmentDuration: 30,
          bufferTime: 5,
          timezone: 'UTC',
          recurrenceType: 'WEEKLY',
          isTemplate: false
        }
      ];

      // Act
      const result = await validationService.validateWorkingDays(workingDays, 'doctor-123');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Invalid start time format');
    });

    it('should validate time logic', async () => {
      // Arrange
      const workingDays: WorkingDay[] = [
        {
          day: 'Monday',
          isWorking: true,
          startTime: '17:00', // Start after end
          endTime: '09:00',
          maxAppointments: 20,
          appointmentDuration: 30,
          bufferTime: 5,
          timezone: 'UTC',
          recurrenceType: 'WEEKLY',
          isTemplate: false
        }
      ];

      // Act
      const result = await validationService.validateWorkingDays(workingDays, 'doctor-123');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Start time must be before end time');
    });

    it('should validate appointment capacity', async () => {
      // Arrange
      const workingDays: WorkingDay[] = [
        {
          day: 'Monday',
          isWorking: true,
          startTime: '09:00',
          endTime: '10:00', // Only 1 hour
          maxAppointments: 50, // Too many for 1 hour
          appointmentDuration: 30,
          bufferTime: 5,
          timezone: 'UTC',
          recurrenceType: 'WEEKLY',
          isTemplate: false
        }
      ];

      // Act
      const result = await validationService.validateWorkingDays(workingDays, 'doctor-123');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('exceeds available time slots');
    });

    it('should validate break times', async () => {
      // Arrange
      const workingDays: WorkingDay[] = [
        {
          day: 'Monday',
          isWorking: true,
          startTime: '09:00',
          endTime: '17:00',
          breakStart: '13:00', // Break after end time
          breakEnd: '12:00',
          maxAppointments: 20,
          appointmentDuration: 30,
          bufferTime: 5,
          timezone: 'UTC',
          recurrenceType: 'WEEKLY',
          isTemplate: false
        }
      ];

      // Act
      const result = await validationService.validateWorkingDays(workingDays, 'doctor-123');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Break start time must be before break end time');
    });
  });

  describe('validateScheduleException', () => {
    it('should validate schedule exception', async () => {
      // Arrange
      const exception = {
        exceptionType: 'HOLIDAY' as const,
        title: 'Christmas Day',
        startDate: new Date('2024-12-25'),
        endDate: new Date('2024-12-25'),
        isAllDay: true,
        isRecurring: false,
        affectsAppointments: true
      };

      // Act
      const result = await validationService.validateScheduleException(exception, 'doctor-123');

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid date range', async () => {
      // Arrange
      const exception = {
        exceptionType: 'HOLIDAY' as const,
        title: 'Invalid Exception',
        startDate: new Date('2024-12-26'), // Start after end
        endDate: new Date('2024-12-25'),
        isAllDay: true,
        isRecurring: false,
        affectsAppointments: true
      };

      // Act
      const result = await validationService.validateScheduleException(exception, 'doctor-123');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Start date must be before end date');
    });
  });
});

describe('ErrorHandler', () => {
  it('should categorize database errors correctly', async () => {
    // Arrange
    const error = new Error('Unique constraint failed');
    const context = { doctorId: 'doctor-123', operation: 'create' };

    // Act
    const result = await errorHandler.handleError(error, context);

    // Assert
    expect(result.category).toBe('DATABASE');
    expect(result.code).toBe('DUPLICATE_ENTRY');
    expect(result.retryable).toBe(false);
  });

  it('should categorize validation errors correctly', async () => {
    // Arrange
    const error = new Error('Invalid time format');
    const context = { doctorId: 'doctor-123', operation: 'validate' };

    // Act
    const result = await errorHandler.handleError(error, context);

    // Assert
    expect(result.category).toBe('VALIDATION');
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.retryable).toBe(false);
  });

  it('should retry retryable operations', async () => {
    // Arrange
    let attemptCount = 0;
    const operation = jest.fn().mockImplementation(() => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error('Connection timeout');
      }
      return 'success';
    });

    // Act
    const result = await errorHandler.retryOperation(operation, { operation: 'test' });

    // Assert
    expect(result).toBe('success');
    expect(attemptCount).toBe(3);
    expect(operation).toHaveBeenCalledTimes(3);
  });
});

