import { Doctor } from '@/types';

export interface PlanStatus {
  isActive: boolean;
  isExpired: boolean;
  daysUntilExpiry?: number;
  hasValidPlan: boolean;
}

export function checkPlanStatus(doctor: Doctor | null): PlanStatus {
  if (!doctor) {
    return {
      isActive: false,
      isExpired: false,
      hasValidPlan: false
    };
  }

  // Check if plan is none or not assigned
  if (doctor.plan === 'none' || !doctor.plan) {
    return {
      isActive: false,
      isExpired: false,
      hasValidPlan: false
    };
  }

  // Check if plan has expiry date
  if (!doctor.planExpiryDate) {
    // If no expiry date but has a plan, consider it active (for backwards compatibility)
    return {
      isActive: true,
      isExpired: false,
      hasValidPlan: true
    };
  }

  const now = new Date();
  const expiryDate = new Date(doctor.planExpiryDate);
  const isExpired = now > expiryDate;
  
  let daysUntilExpiry: number | undefined;
  if (!isExpired) {
    const timeDiff = expiryDate.getTime() - now.getTime();
    daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  return {
    isActive: !isExpired && doctor.active,
    isExpired,
    daysUntilExpiry,
    hasValidPlan: true
  };
}

export function shouldRestrictAccess(doctor: Doctor | null): boolean {
  const status = checkPlanStatus(doctor);
  return !status.isActive || !status.hasValidPlan;
}

export function getPlanStatusMessage(doctor: Doctor | null): string {
  const status = checkPlanStatus(doctor);
  
  if (!status.hasValidPlan) {
    return "No plan assigned - Contact admin to get started";
  }
  
  if (status.isExpired) {
    return "Plan expired - Contact admin to renew";
  }
  
  if (status.daysUntilExpiry !== undefined) {
    if (status.daysUntilExpiry <= 7) {
      return `Plan expires in ${status.daysUntilExpiry} days - Contact admin to renew`;
    }
    return `Plan active - ${status.daysUntilExpiry} days remaining`;
  }
  
  return "Plan active";
}