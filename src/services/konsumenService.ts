import apiHelper from '../utils/apiHelper';
import { authService } from './authService';

export interface Konsumen {
  id: number;
  code: string;
  name: string;
  email: string | null;
  phone: string;
  whatsapp: string | null;
  address: string | null;
  budget: string | null;
  city: string | null;
  province: string | null;
  birth_date: string | null;
  gender: 'male' | 'female' | 'other' | null;
  company: string | null;
  position: string | null;
  source: string[];
  status: string;
  notes: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  mitra_id: number | null;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
  mitra?: any;
  assignedTo?: any;
  latest_followup?: any;
}

export interface KonsumenStatistics {
  total: number;
  this_month: number;
  by_status: Array<{
    status: string;
    name: string;
    total: number;
  }>;
  by_source: Array<{
    source: string;
    total: number;
  }>;
}

export interface KonsumenFilters {
  search?: string;
  status?: string;
  source?: string;
  budget?: string;
  project?: string;
  per_page?: number;
  page?: number;
}

export interface CreateKonsumenData {
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  budget?: string;
  city?: string;
  province?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  company?: string;
  position?: string;
  source?: string[];
  status?: string;
  notes?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
}

// Settings Interfaces
export interface KonsumenResponse {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface FollowupNote {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

class KonsumenService {
  /**
   * Get list of konsumen with optional filters
   */
  async getKonsumenList(filters?: KonsumenFilters): Promise<any> {
    const token = await authService.getToken();
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.source) params.append('source', filters.source);
    if (filters?.budget) params.append('budget', filters.budget);
    if (filters?.project) params.append('project', filters.project);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/konsumen?${queryString}` : '/konsumen';
    
    const response = await apiHelper.get<any>(url, token || undefined);
    
    if (response.success) {
      // Return full response including meta
      return {
        data: response.data.data, // Array of konsumen
        meta: response.data.meta || {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        }
      };
    }
    
    throw new Error(response.error || 'Failed to fetch konsumen list');
  }

  /**
   * Get konsumen by ID
   */
  async getKonsumenById(id: string){
    const token = await authService.getToken();
    const response = await apiHelper.get<any>(`/konsumen/${id}`, token || undefined);
    
    if (response?.success && response?.data !== undefined) {
      return response.data;
    }
    return response;
  }

  /**
   * Get list of mitras that user has access to
   */
  async getMitras(id: string){
    const token = await authService.getToken();
    const response = await apiHelper.get<any>(`/mitras/${id}`, token || undefined);
    
    if (response?.success && response?.data !== undefined) {
      return response.data;
    }
    return response;
  }

  /**
   * Create new konsumen
   */
  async createKonsumen(data: CreateKonsumenData): Promise<Konsumen> {
    const token = await authService.getToken();
    const response = await apiHelper.post<any>('/konsumen', data, token || undefined);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to create konsumen');
  }

  /**
   * Update konsumen
   */
  async updateKonsumen(id: number, data: Partial<CreateKonsumenData>): Promise<Konsumen> {
    const token = await authService.getToken();
    const response = await apiHelper.put<any>(`/konsumen/${id}`, data, token || undefined);
    
    if (response.success && response.data) {
      return response.data.data;
    }
    
    throw new Error(response.error || 'Failed to update konsumen');
  }

  /**
   * Delete konsumen
   */
  async deleteKonsumen(id: number): Promise<string> {
    const token = await authService.getToken();
    const response = await apiHelper.delete<any>(`/konsumen/${id}`, token || undefined);
    
    if (response.success) {
      return response.data?.message || 'Konsumen deleted successfully';
    }
    
    throw new Error(response.error || 'Failed to delete konsumen');
  }

  /**
   * Get konsumen statistics
   */
  async getStatistics(): Promise<KonsumenStatistics> {
    const token = await authService.getToken();
    const response = await apiHelper.get<any>('/konsumen/statistics', token || undefined);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch statistics');
  }

  // ============================================
  // SETTINGS API
  // ============================================

  /**
   * Get list of Konsumen Responses
   */
  async getKonsumenResponses(): Promise<KonsumenResponse[]> {
    const token = await authService.getToken();
    const response = await apiHelper.get<any>('/konsumen-response/data', token || undefined);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch konsumen responses');
  }

  /**
   * Get list of Followup Notes
   */
  async getFollowupNotes(): Promise<FollowupNote[]> {
    const token = await authService.getToken();
    const response = await apiHelper.get<any>('/followup-note/data', token || undefined);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch followup notes');
  }
}

export const konsumenService = new KonsumenService();
export default konsumenService;