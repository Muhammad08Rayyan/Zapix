import mongoose, { Schema, Model } from 'mongoose';
import {
  Doctor,
  Patient,
  Appointment,
  Slot,
  Admin,
  AdminSettings,
  Message
} from '@/types';

// Doctor Schema
const DoctorSchema = new Schema<Doctor>({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  plan: { 
    type: String, 
    enum: ['basic', 'premium', 'custom'], 
    default: 'basic' 
  },
  active: { type: Boolean, default: true },
  paymentDetails: {
    bankAccount: {
      accountNumber: String,
      bankName: String,
      accountTitle: String
    },
    jazzCash: {
      phoneNumber: String,
      accountName: String
    },
    easyPaisa: {
      phoneNumber: String,
      accountName: String
    },
    defaultMethod: {
      type: String,
      enum: ['bank', 'jazzcash', 'easypaisa']
    }
  },
  limits: {
    maxAppointmentsPerDay: { type: Number, default: 10 },
    maxReschedules: { type: Number, default: 2 },
    advanceBookingDays: { type: Number, default: 30 },
    cancellationHours: { type: Number, default: 24 }
  },
  messageStats: {
    monthlyLimit: { type: Number, default: 1000 },
    currentMonth: { type: String, default: () => new Date().toISOString().slice(0, 7) }, // YYYY-MM format
    messagesUsed: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now }
  },
  defaultPrice: { type: Number, default: 3000 }
}, {
  timestamps: true
});

// Patient Schema
const PatientSchema = new Schema<Patient>({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other'], 
    required: true 
  },
  phone: { type: String, required: true },
  medicalHistory: [{ type: String }],
  doctorId: { type: String, required: true }
}, {
  timestamps: true
});

// Appointment Schema
const AppointmentSchema = new Schema<Appointment>({
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  slotId: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['consultation', 'follow_up', 'emergency', 'checkup'],
    default: 'consultation'
  },
  documents: [{ type: String }],
  notes: { type: String, default: '' },
  paymentReceiptUrl: String
}, {
  timestamps: true
});

// Slot Schema (for recurring weekly slots)
const SlotSchema = new Schema<Slot>({
  doctorId: { type: String, required: true },
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0 = Sunday, 1 = Monday, etc.
  startTime: { type: String, required: true }, // HH:MM format
  duration: { type: Number, required: true }, // in minutes
  type: {
    type: String,
    enum: ['in_person', 'video_call', 'phone_call'],
    required: true
  },
  address: String,
  price: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Slot Booking Schema (for specific date bookings)
const SlotBookingSchema = new Schema({
  slotId: { type: String, required: true },
  doctorId: { type: String, required: true },
  patientId: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD format
  status: {
    type: String,
    enum: ['booked', 'cancelled', 'completed'],
    default: 'booked'
  },
  paymentReceiptUrl: String,
  symptoms: String,
  additionalNotes: String,
  rejectionReason: String,
  cancellationReason: String,
  rescheduleRequest: {
    doctorNotes: String,
    newSlotId: String,
    newDate: String,
    requestedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }
}, {
  timestamps: true
});

// Admin Schema
const AdminSchema = new Schema<Admin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true }
}, {
  timestamps: true
});

// Admin Settings Schema
const AdminSettingsSchema = new Schema<AdminSettings>({
  globalLimits: {
    maxAppointmentsPerDay: { type: Number, default: 10 },
    maxReschedules: { type: Number, default: 2 },
    advanceBookingDays: { type: Number, default: 30 },
    cancellationHours: { type: Number, default: 24 }
  },
  paymentMethods: [{
    type: {
      type: String,
      enum: ['bank', 'jazzcash', 'easypaisa']
    },
    name: String,
    enabled: { type: Boolean, default: true }
  }],
  whatsappConfig: {
    accessToken: String,
    phoneNumberId: String,
    businessAccountId: String,
    webhookVerifyToken: String
  }
}, {
  timestamps: true
});

// Message Schema
const MessageSchema = new Schema<Message>({
  patientPhone: { type: String, required: true },
  doctorId: String,
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'image', 'document', 'audio', 'video', 'interactive', 'template'],
    default: 'text'
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// Create indexes
DoctorSchema.index({ email: 1, phone: 1 });
PatientSchema.index({ phone: 1, doctorId: 1 });
AppointmentSchema.index({ doctorId: 1, status: 1 });
SlotSchema.index({ doctorId: 1, dayOfWeek: 1, startTime: 1 });
SlotBookingSchema.index({ slotId: 1, date: 1 });
SlotBookingSchema.index({ doctorId: 1, date: 1 });
MessageSchema.index({ patientPhone: 1, createdAt: -1 });

// Export models
export const DoctorModel: Model<Doctor> = mongoose.models.Doctor || mongoose.model<Doctor>('Doctor', DoctorSchema);
export const PatientModel: Model<Patient> = mongoose.models.Patient || mongoose.model<Patient>('Patient', PatientSchema);
export const AppointmentModel: Model<Appointment> = mongoose.models.Appointment || mongoose.model<Appointment>('Appointment', AppointmentSchema);
export const SlotModel: Model<Slot> = mongoose.models.Slot || mongoose.model<Slot>('Slot', SlotSchema);
export const SlotBookingModel = mongoose.models.SlotBooking || mongoose.model('SlotBooking', SlotBookingSchema);
export const AdminModel: Model<Admin> = mongoose.models.Admin || mongoose.model<Admin>('Admin', AdminSchema);
export const AdminSettingsModel: Model<AdminSettings> = mongoose.models.AdminSettings || mongoose.model<AdminSettings>('AdminSettings', AdminSettingsSchema);
export const MessageModel: Model<Message> = mongoose.models.Message || mongoose.model<Message>('Message', MessageSchema);