import { WorkingHours, ScheduleTemplate, LeaveRequest } from '@/types/scheduling';
import { Appointment, Doctor, Patient } from '@prisma/client';

export interface ExportData {
  doctor: {
    id: string;
    name: string;
    specialization: string;
    email: string;
  };
  exportDate: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  workingHours?: WorkingHours[];
  appointments?: any[];
  leaveRequests?: LeaveRequest[];
  templates?: ScheduleTemplate[];
}

export interface ExportResult {
  content: string | Buffer;
  contentType: string;
  filename: string;
  size?: number;
}

export class ExportService {
  /**
   * Generate PDF export of doctor's schedule
   */
  static async generatePDF(data: ExportData): Promise<ExportResult> {
    // TODO: Implement PDF generation using puppeteer or jsPDF
    // For now, return a placeholder
    const pdfContent = this.generatePDFContent(data);
    
    return {
      content: pdfContent,
      contentType: 'application/pdf',
      filename: `schedule_${data.doctor.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      size: pdfContent.length,
    };
  }

  /**
   * Generate CSV export of doctor's schedule
   */
  static async generateCSV(data: ExportData): Promise<ExportResult> {
    const csvRows: string[] = [];
    
    // Add header
    csvRows.push('Healthcare Schedule Export');
    csvRows.push(`Doctor: ${data.doctor.name}`);
    csvRows.push(`Specialization: ${data.doctor.specialization}`);
    csvRows.push(`Export Date: ${data.exportDate}`);
    csvRows.push(`Date Range: ${data.dateRange.startDate} to ${data.dateRange.endDate}`);
    csvRows.push(''); // Empty row

    // Add working hours
    if (data.workingHours && data.workingHours.length > 0) {
      csvRows.push('WORKING HOURS');
      csvRows.push('Day,Start Time,End Time,Break Start,Break End,Max Appointments,Is Working');
      
      data.workingHours.forEach(day => {
        csvRows.push([
          day.day,
          day.startTime,
          day.endTime,
          day.breakStart || '',
          day.breakEnd || '',
          day.maxAppointments?.toString() || '',
          day.isWorking ? 'Yes' : 'No'
        ].map(cell => `"${cell}"`).join(','));
      });
      csvRows.push(''); // Empty row
    }

    // Add appointments
    if (data.appointments && data.appointments.length > 0) {
      csvRows.push('APPOINTMENTS');
      csvRows.push('Date,Time,Patient Name,Phone,Email,Status,Reason,Notes');
      
      data.appointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.appointment_date);
        csvRows.push([
          appointmentDate.toISOString().split('T')[0],
          appointmentDate.toISOString().split('T')[1].substring(0, 5),
          `${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`.trim(),
          appointment.patient?.phone || '',
          appointment.patient?.email || '',
          appointment.status,
          appointment.reason || '',
          appointment.note || ''
        ].map(cell => `"${cell}"`).join(','));
      });
      csvRows.push(''); // Empty row
    }

    // Add leave requests
    if (data.leaveRequests && data.leaveRequests.length > 0) {
      csvRows.push('LEAVE REQUESTS');
      csvRows.push('Start Date,End Date,Type,Status,Reason');
      
      data.leaveRequests.forEach(leave => {
        csvRows.push([
          leave.startDate,
          leave.endDate,
          leave.type,
          leave.status,
          leave.reason
        ].map(cell => `"${cell}"`).join(','));
      });
    }

    const csvContent = csvRows.join('\n');
    
    return {
      content: csvContent,
      contentType: 'text/csv',
      filename: `schedule_${data.doctor.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`,
      size: csvContent.length,
    };
  }

  /**
   * Generate Excel export of doctor's schedule
   */
  static async generateExcel(data: ExportData): Promise<ExportResult> {
    // TODO: Implement Excel generation using xlsx library
    // For now, return a placeholder
    const excelContent = this.generateExcelContent(data);
    
    return {
      content: excelContent,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `schedule_${data.doctor.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`,
      size: excelContent.length,
    };
  }

  /**
   * Generate iCal/ICS export for calendar integration
   */
  static async generateICal(data: ExportData): Promise<ExportResult> {
    const icalLines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Healthcare System//Schedule Export//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${data.doctor.name} - Healthcare Schedule`,
      `X-WR-CALDESC:Healthcare schedule for ${data.doctor.name}`,
    ];

    // Add working hours as recurring events
    if (data.workingHours && data.workingHours.length > 0) {
      data.workingHours.forEach(day => {
        if (day.isWorking) {
          const dayNumber = this.getDayNumber(day.day);
          const icalDay = this.getICalDay(day.day);
          
          icalLines.push(
            'BEGIN:VEVENT',
            `UID:working-hours-${data.doctor.id}-${day.day}@healthcare.com`,
            `DTSTART:${this.formatICalDateTime(day.startTime)}`,
            `DTEND:${this.formatICalDateTime(day.endTime)}`,
            `RRULE:FREQ=WEEKLY;BYDAY=${icalDay}`,
            `SUMMARY:Working Hours - ${data.doctor.name}`,
            `DESCRIPTION:Regular working hours for ${data.doctor.name}\\nSpecialization: ${data.doctor.specialization}`,
            'STATUS:CONFIRMED',
            'TRANSP:OPAQUE',
            'END:VEVENT'
          );

          // Add break time if specified
          if (day.breakStart && day.breakEnd) {
            icalLines.push(
              'BEGIN:VEVENT',
              `UID:break-time-${data.doctor.id}-${day.day}@healthcare.com`,
              `DTSTART:${this.formatICalDateTime(day.breakStart)}`,
              `DTEND:${this.formatICalDateTime(day.breakEnd)}`,
              `RRULE:FREQ=WEEKLY;BYDAY=${icalDay}`,
              `SUMMARY:Break Time - ${data.doctor.name}`,
              `DESCRIPTION:Lunch break for ${data.doctor.name}`,
              'STATUS:CONFIRMED',
              'TRANSP:OPAQUE',
              'END:VEVENT'
            );
          }
        }
      });
    }

    // Add appointments
    if (data.appointments && data.appointments.length > 0) {
      data.appointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.appointment_date);
        const endDate = new Date(appointmentDate.getTime() + 30 * 60000); // 30 minutes duration
        
        icalLines.push(
          'BEGIN:VEVENT',
          `UID:appointment-${appointment.id}@healthcare.com`,
          `DTSTART:${this.formatICalDateTime(appointmentDate.toISOString())}`,
          `DTEND:${this.formatICalDateTime(endDate.toISOString())}`,
          `SUMMARY:Appointment - ${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`.trim(),
          `DESCRIPTION:Appointment with ${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}\\nPhone: ${appointment.patient?.phone || ''}\\nEmail: ${appointment.patient?.email || ''}\\nReason: ${appointment.reason || 'General consultation'}\\nNotes: ${appointment.note || ''}`,
          `STATUS:${appointment.status === 'CONFIRMED' ? 'CONFIRMED' : 'TENTATIVE'}`,
          'TRANSP:OPAQUE',
          'END:VEVENT'
        );
      });
    }

    // Add leave requests
    if (data.leaveRequests && data.leaveRequests.length > 0) {
      data.leaveRequests.forEach(leave => {
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        
        icalLines.push(
          'BEGIN:VEVENT',
          `UID:leave-${leave.id}@healthcare.com`,
          `DTSTART:${this.formatICalDate(startDate.toISOString())}`,
          `DTEND:${this.formatICalDate(endDate.toISOString())}`,
          `SUMMARY:Leave - ${leave.type} - ${data.doctor.name}`,
          `DESCRIPTION:Leave request: ${leave.reason}\\nStatus: ${leave.status}`,
          'STATUS:CONFIRMED',
          'TRANSP:TRANSPARENT',
          'END:VEVENT'
        );
      });
    }

    icalLines.push('END:VCALENDAR');

    const icalContent = icalLines.join('\n');
    
    return {
      content: icalContent,
      contentType: 'text/calendar',
      filename: `schedule_${data.doctor.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.ics`,
      size: icalContent.length,
    };
  }

  /**
   * Generate JSON export for API integration
   */
  static async generateJSON(data: ExportData): Promise<ExportResult> {
    const jsonContent = JSON.stringify(data, null, 2);
    
    return {
      content: jsonContent,
      contentType: 'application/json',
      filename: `schedule_${data.doctor.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`,
      size: jsonContent.length,
    };
  }

  // Helper methods
  private static generatePDFContent(data: ExportData): string {
    // Placeholder for PDF content
    return `PDF content for ${data.doctor.name}'s schedule from ${data.dateRange.startDate} to ${data.dateRange.endDate}`;
  }

  private static generateExcelContent(data: ExportData): string {
    // Placeholder for Excel content
    return `Excel content for ${data.doctor.name}'s schedule from ${data.dateRange.startDate} to ${data.dateRange.endDate}`;
  }

  private static getDayNumber(dayName: string): number {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days.indexOf(dayName.toUpperCase());
  }

  private static getICalDay(dayName: string): string {
    return dayName.substring(0, 2).toUpperCase();
  }

  private static formatICalDateTime(dateTimeString: string): string {
    // Convert ISO string to iCal format (YYYYMMDDTHHMMSSZ)
    return dateTimeString.replace(/[-:]/g, '').replace(/\.\d{3}/, '').replace('T', 'T').replace('Z', 'Z');
  }

  private static formatICalDate(dateString: string): string {
    // Convert ISO date to iCal date format (YYYYMMDD)
    return dateString.split('T')[0].replace(/-/g, '');
  }
}

