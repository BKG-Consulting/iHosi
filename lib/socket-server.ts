import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

// Socket event types
export enum SocketEvents {
  // Appointment events
  APPOINTMENT_REQUEST = 'appointment_request',
  APPOINTMENT_SCHEDULED = 'appointment_scheduled',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_RESCHEDULED = 'appointment_rescheduled',
  
  // Doctor events
  DOCTOR_AVAILABILITY_CHANGED = 'doctor_availability_changed',
  NEW_PATIENT_REQUEST = 'new_patient_request',
  
  // Patient events
  APPOINTMENT_CONFIRMED = 'appointment_confirmed',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  
  // System events
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
}

// Socket room types
export enum SocketRooms {
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  ADMIN = 'admin',
  APPOINTMENTS = 'appointments',
}

// Socket user types
export interface SocketUser {
  id: string;
  role: 'DOCTOR' | 'PATIENT' | 'ADMIN';
  name: string;
  email: string;
}

// Socket message interfaces
export interface AppointmentRequestMessage {
  appointmentId: number;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  reason?: string;
  note?: string;
  timestamp: Date;
}

export interface AppointmentScheduledMessage {
  appointmentId: number;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  requirements?: string;
  notes?: string;
  timestamp: Date;
}

export interface DoctorAvailabilityMessage {
  doctorId: string;
  doctorName: string;
  availabilityStatus: string;
  reason?: string;
  timestamp: Date;
}

// Socket server class
export class SocketNotificationService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, SocketUser> = new Map();
  private userRooms: Map<string, Set<string>> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.FRONTEND_URL 
          : "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on(SocketEvents.CONNECTION, (socket) => {
      console.log(`🔌 Socket connected: ${socket.id}`);

      // Handle user authentication and room joining
      socket.on(SocketEvents.JOIN_ROOM, async (data: { user: SocketUser; room: string }) => {
        try {
          const { user, room } = data;
          
          // Validate user data
          if (!user.id || !user.role || !user.name) {
            socket.emit('error', { message: 'Invalid user data' });
            return;
          }

          // Store user information
          this.connectedUsers.set(socket.id, user);
          
          // Join room
          socket.join(room);
          
          // Track user rooms
          if (!this.userRooms.has(socket.id)) {
            this.userRooms.set(socket.id, new Set());
          }
          this.userRooms.get(socket.id)!.add(room);

          console.log(`👤 User ${user.name} (${user.role}) joined room: ${room}`);

          // Send confirmation
          socket.emit('room_joined', { room, user });
          
        } catch (error) {
          console.error('Error joining room:', error);
          socket.emit('error', { message: 'Failed to join room' });
        }
      });

      // Handle room leaving
      socket.on(SocketEvents.LEAVE_ROOM, async (data: { room: string }) => {
        try {
          const { room } = data;
          const user = this.connectedUsers.get(socket.id);
          
          socket.leave(room);
          
          if (this.userRooms.has(socket.id)) {
            this.userRooms.get(socket.id)!.delete(room);
          }

          console.log(`👤 User left room: ${room}`);

          socket.emit('room_left', { room });
          
        } catch (error) {
          console.error('Error leaving room:', error);
          socket.emit('error', { message: 'Failed to leave room' });
        }
      });

      // Handle disconnection
      socket.on(SocketEvents.DISCONNECT, async () => {
        try {
          const user = this.connectedUsers.get(socket.id);
          
          console.log(`🔌 Socket disconnected: ${socket.id}`);

          // Clean up
          this.connectedUsers.delete(socket.id);
          this.userRooms.delete(socket.id);
          
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      });
    });
  }

  // Send appointment request notification to doctor
  async sendAppointmentRequest(doctorId: string, message: AppointmentRequestMessage) {
    try {
      console.log(`📨 Sending appointment request to doctor ${doctorId}:`, message);
      
      this.io.to(`doctor_${doctorId}`).emit(SocketEvents.APPOINTMENT_REQUEST, message);
      
      // Also send to general appointments room for admin monitoring
      this.io.to(SocketRooms.APPOINTMENTS).emit(SocketEvents.APPOINTMENT_REQUEST, message);
      
    } catch (error) {
      console.error('Error sending appointment request notification:', error);
    }
  }

  // Send appointment scheduled notification to patient
  async sendAppointmentScheduled(patientId: string, message: AppointmentScheduledMessage) {
    try {
      console.log(`📨 Sending appointment scheduled to patient ${patientId}:`, message);
      
      this.io.to(`patient_${patientId}`).emit(SocketEvents.APPOINTMENT_SCHEDULED, message);
      
      // Also send to general appointments room for admin monitoring
      this.io.to(SocketRooms.APPOINTMENTS).emit(SocketEvents.APPOINTMENT_SCHEDULED, message);
      
    } catch (error) {
      console.error('Error sending appointment scheduled notification:', error);
    }
  }

  // Send doctor availability change notification
  async sendDoctorAvailabilityChange(doctorId: string, message: DoctorAvailabilityMessage) {
    try {
      console.log(`📨 Sending doctor availability change:`, message);
      
      this.io.to(`doctor_${doctorId}`).emit(SocketEvents.DOCTOR_AVAILABILITY_CHANGED, message);
      
      // Send to admin room for monitoring
      this.io.to(SocketRooms.ADMIN).emit(SocketEvents.DOCTOR_AVAILABILITY_CHANGED, message);
      
    } catch (error) {
      console.error('Error sending doctor availability change notification:', error);
    }
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Get users in specific room
  getUsersInRoom(room: string): SocketUser[] {
    const users: SocketUser[] = [];
    
    for (const [socketId, user] of this.connectedUsers) {
      if (this.userRooms.get(socketId)?.has(room)) {
        users.push(user);
      }
    }
    
    return users;
  }

  // Broadcast to all connected users
  broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  // Get socket server instance
  getIO(): SocketIOServer {
    return this.io;
  }
}

// Global socket service instance
let socketService: SocketNotificationService | null = null;

export function initializeSocketService(httpServer: HTTPServer): SocketNotificationService {
  if (!socketService) {
    socketService = new SocketNotificationService(httpServer);
  }
  return socketService;
}

export function getSocketService(): SocketNotificationService | null {
  return socketService;
}

