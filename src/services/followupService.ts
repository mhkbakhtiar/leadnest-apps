import apiHelper from '../utils/apiHelper';
import { authService } from './authService';

export interface Followup {
  id: number;
  konsumen_id: number;
  followup_status_id: number | null;
  type: 'socmed' | 'email' | 'whatsapp' | 'visit' | 'other';
  followup_date: string;
  visit_date: string;
  notes: string;
  response: string | null;
  next_followup_date: string | null;
  result: string;
  status: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  konsumen?: {
    id: number;
    name: string;
    code: string;
    phone: string;
  };
  followup_status?: {
    id: number;
    name: string;
    color: string;
  };
  created_by_user?: {
    id: number;
    name: string;
  };
}

export interface FollowupListResponse {
  success: boolean;
  current_page: number;
  data: Followup[];
  per_page: number;
  total: number;
}

export interface FollowupStatistics {
  total: number;
  this_month: number;
  upcoming: number;
  by_type: Array<{ type: string; total: number }>;
  by_result: Array<{ result: string; total: number }>;
  by_status: Array<{ status: string; total: number }>;
}

export interface CreateFollowupData {
  konsumen_id: number;
  followup_status_id?: number;
  type: 'socmed' | 'email' | 'whatsapp' | 'visit' | 'other';
  followup_date?: string;
  visit_date?: string;
  notes: string;
  response?: string;
  next_followup_date?: string;
  result: string;
  status: string;
}

export interface UpdateFollowupData {
  followup_status_id?: number;
  type: 'socmed' | 'email' | 'whatsapp' | 'visit' | 'other';
  followup_date?: string;
  visit_date?: string;
  notes?: string;
  response?: string;
  next_followup_date?: string;
  result?: string;
  status?: string;
}

class FollowupServices {
  /**
   * Get list of followups
   */
  async getFollowupList(params?: {
    per_page?: number;
    konsumen_id?: number;
    type?: string;
    result?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<Followup[]> {
    const token = await authService.getToken();
    const response = await apiHelper.get<FollowupListResponse>('/followup', token || undefined, params);

    if (response.success && (response.data as any)?.data) {
      return (response.data as any).data;
    }

    throw new Error('Invalid response format');
  }

  /**
   * Get single followup detail
   */
  async getFollowup(id: number): Promise<Followup> {
    const token = await authService.getToken();
    const response = await apiHelper.get<{ success: boolean; data: Followup }>(`/followup/${id}`, token || undefined);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Invalid response format');
  }

  /**
   * Create new followup
   */
  async createFollowup(data: CreateFollowupData): Promise<Followup> {
    const token = await authService.getToken();
    const response = await apiHelper.post<{ success: boolean; data: Followup }>('/followup', data, token || undefined);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Invalid response format');
  }

  /**
   * Update followup
   */
  async updateFollowup(id: number, data: UpdateFollowupData): Promise<Followup> {
    const token = await authService.getToken();
    const response = await apiHelper.put<{ success: boolean; data: Followup }>(
      `/followup/${id}`,
      data,
      token || undefined
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Invalid response format');
  }

  /**
   * Delete followup
   */
  async deleteFollowup(id: number): Promise<void> {
    const token = await authService.getToken();
    const response = await apiHelper.delete<{ success: boolean }>(`/followup/${id}`, token || undefined);

    if (!response.success) {
      throw new Error('Gagal menghapus followup');
    }
  }

  /**
   * Get followup statistics
   */
  async getStatistics(): Promise<FollowupStatistics> {
    const token = await authService.getToken();
    const response = await apiHelper.get<{ success: boolean; data: FollowupStatistics }>(
      '/followup/statistics',
      token || undefined
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Invalid response format');
  }

  /**
   * Get upcoming followups
   */
  async getUpcoming(days: number = 7): Promise<Followup[]> {
    const token = await authService.getToken();
    const response = await apiHelper.get<{ success: boolean; data: Followup[] }>(
      '/followup/upcoming',
      token || undefined,
      { days }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Invalid response format');
  }

  /**
   * Get overdue followups
   */
  async getOverdue(): Promise<Followup[]> {
    const token = await authService.getToken();
    const response = await apiHelper.get<{ success: boolean; data: Followup[] }>(
      '/followup/overdue',
      token || undefined
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Invalid response format');
  }

  /**
   * Safe versions (return null on error)
   */
  async getFollowupListSafe(): Promise<Followup[] | null> {
    try {
      return await this.getFollowupList();
    } catch (error) {
      console.error('Error fetching followup list:', error);
      return null;
    }
  }

  async getStatisticsSafe(): Promise<FollowupStatistics | null> {
    try {
      return await this.getStatistics();
    } catch (error) {
      console.error('Error fetching followup statistics:', error);
      return null;
    }
  }
}

export const followupServices = new FollowupServices();
export default followupServices;