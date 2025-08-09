import { CreateSlotForm, Slot, ApiResponse } from '@/types';

const API_BASE = '/api/slots';

export class SlotsAPI {
  static async getSlots(startDate?: string, endDate?: string): Promise<Slot[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const url = params.toString() ? `${API_BASE}?${params.toString()}` : API_BASE;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch slots');
    }

    const result: ApiResponse<Slot[]> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch slots');
    }

    // Transform MongoDB _id to id for frontend
    return (result.data || []).map(slot => ({
      ...slot,
      id: slot.id || (slot as any)._id?.toString()
    }));
  }

  static async createSlot(data: CreateSlotForm): Promise<Slot> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create slot');
    }

    const result: ApiResponse<Slot> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to create slot');
    }

    return {
      ...result.data,
      id: result.data.id || (result.data as any)._id?.toString()
    };
  }

  static async updateSlot(id: string, data: CreateSlotForm): Promise<Slot> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update slot');
    }

    const result: ApiResponse<Slot> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to update slot');
    }

    return {
      ...result.data,
      id: result.data.id || (result.data as any)._id?.toString()
    };
  }

  static async deleteSlot(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete slot');
    }

    const result: ApiResponse<null> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete slot');
    }
  }

  static async getSlot(id: string): Promise<Slot> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch slot');
    }

    const result: ApiResponse<Slot> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch slot');
    }

    return {
      ...result.data,
      id: result.data.id || (result.data as any)._id?.toString()
    };
  }
}