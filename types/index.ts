export interface Doctor {
  id: string;
  name: string;
  phone?: string;
  email: string;
  password: string;
  plan: DoctorPlan;
  planAssignedDate?: Date;
  planExpiryDate?: Date;
  active: boolean;
  paymentDetails?: PaymentDetails;
  limits: DoctorLimits;
  messageStats: MessageStats;
  personalPhone?: string;
  businessPhone?: string;
  notificationSettings?: NotificationSettings;
  defaultPrice?: number;
  setupProgress?: SetupProgress;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  patientId: string; // e.g., PT001, PT002, etc.
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  medicalHistory: string[];
  doctorId: string;
  privateNotes?: string;
  documents?: string[];
  upcomingAppointments?: Appointment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  status: AppointmentStatus;
  type: AppointmentType;
  documents: string[];
  notes: string;
  paymentReceiptUrl?: string;
  rescheduleCount?: number;
  rescheduleRequests?: RescheduleRequest[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Slot {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string;
  duration: number; // in minutes
  type: SlotType;
  address?: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// For booking specific instances of recurring slots
export interface SlotBooking {
  id: string;
  slotId: string;
  doctorId: string;
  patientId: string;
  date: string; // specific date for this booking
  status: 'booked' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface RescheduleRequest {
  id: string;
  appointmentId: string;
  requestedBy: 'patient' | 'doctor';
  patientName: string;
  originalDate: string;
  originalTime: string;
  newDate?: string;
  newTime?: string;
  newSlotId?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  doctorResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSettings {
  id: string;
  globalLimits: DoctorLimits;
  paymentMethods: PaymentMethod[];
  whatsappConfig: WhatsAppConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  patientPhone: string;
  doctorId?: string;
  content: string;
  type: MessageType;
  direction: 'inbound' | 'outbound';
  status: MessageStatus;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// Enums and supporting types
export type DoctorPlan = 'none' | 'essential' | 'pro' | 'custom';

export type AppointmentStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'cancelled' 
  | 'completed' 
  | 'no_show'
  | 'rescheduled';

export type AppointmentType = 
  | 'consultation' 
  | 'follow_up' 
  | 'emergency' 
  | 'checkup';

export type SlotType = 
  | 'in_person' 
  | 'video_call' 
  | 'phone_call'
  | 'both';

export type MessageType = 
  | 'text' 
  | 'image' 
  | 'document' 
  | 'audio' 
  | 'video' 
  | 'interactive'
  | 'template';

export type MessageStatus = 
  | 'sent' 
  | 'delivered' 
  | 'read' 
  | 'failed';

export interface PaymentDetails {
  bankAccount?: {
    accountNumber: string;
    bankName: string;
    accountTitle: string;
  };
  jazzCash?: {
    phoneNumber: string;
    accountName: string;
  };
  easyPaisa?: {
    phoneNumber: string;
    accountName: string;
  };
  defaultMethod: 'bank' | 'jazzcash' | 'easypaisa';
}

export interface DoctorLimits {
  maxAppointmentsPerDay: number;
  maxReschedules: number;
  advanceBookingDays: number;
  cancellationHours: number;
}

export interface MessageStats {
  monthlyLimit: number;
  currentMonth: string; // YYYY-MM format
  messagesUsed: number;
  lastResetDate: Date;
}

export interface PaymentMethod {
  type: 'bank' | 'jazzcash' | 'easypaisa';
  name: string;
  enabled: boolean;
}

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken: string;
}

export interface NotificationSettings {
  appointmentReminders: boolean;
  bookingNotifications: boolean;
  emergencyAlerts: boolean;
}

export interface SetupProgress {
  paymentSettings: boolean;
  businessNumber: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor';
  doctorId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Form types
export interface CreateDoctorForm {
  name: string;
  email: string;
  phone: string;
  plan: DoctorPlan;
}

export interface CreateSlotForm {
  dayOfWeek: number;
  startTime: string;
  duration: number;
  type: SlotType;
  address?: string;
  price: number;
}

export interface CreateAppointmentForm {
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  patientPhone: string;
  slotId: string;
  notes?: string;
}