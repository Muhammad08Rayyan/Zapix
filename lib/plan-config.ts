import { DoctorPlan, DoctorLimits, MessageStats } from '@/types';

export interface PlanConfig {
  name: string;
  displayName: string;
  description: string;
  features: string[];
  defaultLimits: DoctorLimits;
  messageAllowance: number;
  canCustomizeSettings: boolean;
  price: number;
}

export const PLAN_CONFIGURATIONS: Record<Exclude<DoctorPlan, 'none'>, PlanConfig> = {
  essential: {
    name: 'essential',
    displayName: 'Essential',
    description: 'Perfect for small practices with standard workflow needs',
    features: [
      'Unlimited appointments & patients',
      '2 reschedules per booking (fixed)',
      'Complete EMR system',
      '24/7 WhatsApp patient assistant',
      'Smart scheduling system',
      'Payment receipt verification',
      'Automated confirmations',
      'Digital document sharing',
      'Basic appointment analytics',
      'WhatsApp support'
    ],
    defaultLimits: {
      maxAppointmentsPerDay: 999, // Unlimited
      maxReschedules: 2, // Fixed at 2
      advanceBookingDays: 30,
      cancellationHours: 24
    },
    messageAllowance: 1000,
    canCustomizeSettings: false,
    price: 10000
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    description: 'For growing practices with custom workflow requirements',
    features: [
      'Unlimited appointments & patients',
      'Customizable reschedule settings',
      'Customizable appointment limits',
      'Everything in Essential plan',
      'Advanced reminder system',
      'Doctor & patient reminders',
      'Advanced appointment analytics',
      'Patient reschedule management',
      'Custom workflow automation',
      'Priority support (24/7 chat)'
    ],
    defaultLimits: {
      maxAppointmentsPerDay: 10,
      maxReschedules: 2,
      advanceBookingDays: 30,
      cancellationHours: 24
    },
    messageAllowance: 2500,
    canCustomizeSettings: true,
    price: 15000
  },
  custom: {
    name: 'custom',
    displayName: 'Custom',
    description: 'For high-volume practices with enterprise-level requirements',
    features: [
      'Custom message allowances',
      'Multiple doctor accounts',
      'Custom workflow automation',
      'Advanced integrations',
      'Dedicated account manager',
      'Custom training sessions',
      '24/7 phone & WhatsApp support',
      'Custom reporting dashboards',
      'Priority feature requests'
    ],
    defaultLimits: {
      maxAppointmentsPerDay: 50,
      maxReschedules: 5,
      advanceBookingDays: 60,
      cancellationHours: 12
    },
    messageAllowance: 10000,
    canCustomizeSettings: true,
    price: 0 // Custom pricing
  }
};

export function getPlanConfig(plan: DoctorPlan): PlanConfig | null {
  if (plan === 'none') return null;
  return PLAN_CONFIGURATIONS[plan as Exclude<DoctorPlan, 'none'>];
}

export function createDefaultMessageStats(plan: DoctorPlan): MessageStats {
  const config = getPlanConfig(plan);
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  
  return {
    monthlyLimit: config?.messageAllowance || 0,
    currentMonth,
    messagesUsed: 0,
    lastResetDate: new Date()
  };
}

export function canDoctorCustomizeSettings(plan: DoctorPlan): boolean {
  const config = getPlanConfig(plan);
  return config?.canCustomizeSettings || false;
}

export function getPlanFeatures(plan: DoctorPlan): string[] {
  const config = getPlanConfig(plan);
  return config?.features || [];
}