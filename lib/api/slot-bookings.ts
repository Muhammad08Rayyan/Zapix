import { ApiResponse } from '@/types';

export interface SlotAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  duration: number;
  type: 'in_person' | 'video_call' | 'phone_call';
  address?: string;
  price: number;
  isActive: boolean;
  availableDate: string;
  dayName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SlotBookingRequest {
  slotId: string;
  patientId?: string;
  patientPhone: string;
  date: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
}

export interface SlotBooking {
  id: string;
  slotId: string;
  doctorId: string;
  patientId?: string;
  date: string;
  status: 'booked' | 'cancelled' | 'completed';
  slot?: SlotAvailability;
  patient?: {
    id: string;
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class SlotBookingsAPI {
  static async getAvailableSlots(
    doctorId: string,
    startDate?: string,
    days = 7
  ): Promise<SlotAvailability[]> {
    const params = new URLSearchParams();
    params.append('doctorId', doctorId);
    if (startDate) params.append('date', startDate);
    params.append('days', days.toString());

    const response = await fetch(`/api/slots/availability?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch available slots');
    }

    const result: ApiResponse<SlotAvailability[]> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch available slots');
    }

    return result.data || [];
  }

  static async bookSlot(bookingData: SlotBookingRequest): Promise<SlotBooking> {
    const response = await fetch('/api/slots/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to book slot');
    }

    const result: ApiResponse<SlotBooking> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to book slot');
    }

    return result.data;
  }

  static async getBookings(
    doctorId?: string,
    patientId?: string,
    date?: string
  ): Promise<SlotBooking[]> {
    const params = new URLSearchParams();
    if (doctorId) params.append('doctorId', doctorId);
    if (patientId) params.append('patientId', patientId);
    if (date) params.append('date', date);

    const response = await fetch(`/api/slots/book?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch bookings');
    }

    const result: ApiResponse<SlotBooking[]> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch bookings');
    }

    return result.data || [];
  }

  static async cancelBooking(bookingId: string): Promise<void> {
    const response = await fetch(`/api/slots/book/${bookingId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel booking');
    }

    const result: ApiResponse<null> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to cancel booking');
    }
  }

  static async getBooking(bookingId: string): Promise<SlotBooking> {
    const response = await fetch(`/api/slots/book/${bookingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch booking');
    }

    const result: ApiResponse<SlotBooking> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch booking');
    }

    return result.data;
  }

  static async updateBookingStatus(bookingId: string, status: 'booked' | 'cancelled' | 'completed'): Promise<SlotBooking> {
    const response = await fetch(`/api/slots/book/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update booking');
    }

    const result: ApiResponse<SlotBooking> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to update booking');
    }

    return result.data;
  }
}