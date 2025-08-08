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
  }
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

// Slot Schema
const SlotSchema = new Schema<Slot>({
  doctorId: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD format
  startTime: { type: String, required: true }, // HH:MM format
  duration: { type: Number, required: true }, // in minutes
  type: {
    type: String,
    enum: ['in_person', 'video_call', 'phone_call'],
    required: true
  },
  address: String,
  price: { type: Number, required: true },
  isBooked: { type: Boolean, default: false }
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
SlotSchema.index({ doctorId: 1, date: 1, startTime: 1 });
MessageSchema.index({ patientPhone: 1, createdAt: -1 });

// Export models
export const DoctorModel: Model<Doctor> = mongoose.models.Doctor || mongoose.model<Doctor>('Doctor', DoctorSchema);
export const PatientModel: Model<Patient> = mongoose.models.Patient || mongoose.model<Patient>('Patient', PatientSchema);
export const AppointmentModel: Model<Appointment> = mongoose.models.Appointment || mongoose.model<Appointment>('Appointment', AppointmentSchema);
export const SlotModel: Model<Slot> = mongoose.models.Slot || mongoose.model<Slot>('Slot', SlotSchema);
export const AdminModel: Model<Admin> = mongoose.models.Admin || mongoose.model<Admin>('Admin', AdminSchema);
export const AdminSettingsModel: Model<AdminSettings> = mongoose.models.AdminSettings || mongoose.model<AdminSettings>('AdminSettings', AdminSettingsSchema);
export const MessageModel: Model<Message> = mongoose.models.Message || mongoose.model<Message>('Message', MessageSchema);