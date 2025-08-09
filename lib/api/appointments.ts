import { CreateAppointmentForm, Appointment, ApiResponse, AppointmentStatus, AppointmentType } from '@/types';

export interface PopulatedAppointment extends Omit<Appointment, 'id'> {
  id: string;
  patient?: {
    id: string;
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    phone: string;
  };
  slot?: {
    id: string;
    dayOfWeek: number;
    startTime: string;
    duration: number;
    type: 'in_person' | 'video_call' | 'phone_call';
    address?: string;
    price: number;
  };
  slotBooking?: {
    id: string;
    date: string;
    status: 'booked' | 'cancelled' | 'completed';
  };
}

export interface UpdateAppointmentData {
  status?: AppointmentStatus;
  type?: AppointmentType;
  notes?: string;
  paymentReceiptUrl?: string;
  documents?: string[];
}

export class AppointmentsAPI {
  static async getAppointments(
    status?: AppointmentStatus,
    date?: string,
    patientId?: string
  ): Promise<PopulatedAppointment[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (date) params.append('date', date);
    if (patientId) params.append('patientId', patientId);

    const url = params.toString() ? `/api/appointments?${params.toString()}` : '/api/appointments';
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch appointments');
    }

    const result: ApiResponse<PopulatedAppointment[]> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch appointments');
    }

    return result.data || [];
  }

  static async createAppointment(data: CreateAppointmentForm): Promise<PopulatedAppointment> {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create appointment');
    }

    const result: ApiResponse<PopulatedAppointment> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to create appointment');
    }

    return result.data;
  }

  static async getAppointment(id: string): Promise<PopulatedAppointment> {
    const response = await fetch(`/api/appointments/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch appointment');
    }

    const result: ApiResponse<PopulatedAppointment> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch appointment');
    }

    return result.data;
  }

  static async updateAppointment(id: string, data: UpdateAppointmentData): Promise<PopulatedAppointment> {
    const response = await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update appointment');
    }

    const result: ApiResponse<PopulatedAppointment> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to update appointment');
    }

    return result.data;
  }

  static async deleteAppointment(id: string): Promise<void> {
    const response = await fetch(`/api/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete appointment');
    }

    const result: ApiResponse<null> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete appointment');
    }
  }

  // Utility methods for common appointment operations
  static async confirmAppointment(id: string): Promise<PopulatedAppointment> {
    return this.updateAppointment(id, { status: 'confirmed' });
  }

  static async cancelAppointment(id: string, reason?: string): Promise<PopulatedAppointment> {
    return this.updateAppointment(id, { 
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : undefined
    });
  }

  static async completeAppointment(id: string, notes?: string): Promise<PopulatedAppointment> {
    return this.updateAppointment(id, { 
      status: 'completed',
      notes: notes
    });
  }

  static async markNoShow(id: string): Promise<PopulatedAppointment> {
    return this.updateAppointment(id, { status: 'no_show' });
  }

  static async rescheduleAppointment(id: string, notes?: string): Promise<PopulatedAppointment> {
    return this.updateAppointment(id, { 
      status: 'rescheduled',
      notes: notes ? `Rescheduled: ${notes}` : 'Rescheduled'
    });
  }
}