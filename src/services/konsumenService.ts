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
  city: string | null;
  province: string | null;
  birth_date: string | null;
  gender: 'male' | 'female' | 'other' | null;
  company: string | null;
  position: string | null;
  source: 'website' | 'social_media' | 'referral' | 'walk_in' | 'phone' | 'other' | null;
  status: 'new' | 'contacted' | 'interested' | 'not_interested' | 'converted' | 'lost';
  notes: string | null;
  mitra_id: number | null;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
  mitra?: any;
  assignedTo?: any;
}

export interface KonsumenStatistics {
  total: number;
  this_month: number;
  by_status: Array<{
    status: string;
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
  per_page?: number;
  page?: number;
}

export interface CreateKonsumenData {
  name: string;
  email?: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  province?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  company?: string;
  position?: string;
  source?: 'website' | 'social_media' | 'referral' | 'walk_in' | 'phone' | 'other';
  status?: 'new' | 'contacted' | 'interested' | 'not_interested' | 'converted' | 'lost';
  notes?: string;
}

class KonsumenService {
  /**
   * Get list of konsumen with optional filters
   * Returns: Konsumen[] directly
   */
  async getKonsumenList(filters?: KonsumenFilters): Promise<Konsumen[]> {
    const token = await authService.getToken();
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.source) params.append('source', filters.source);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/konsumen?${queryString}` : '/konsumen';
    
    const response = await apiHelper.get<any>(url, token || undefined);
    
    if (response.success && response.data && response.data.data) {
      return response.data.data; // Return array Konsumen[] langsung
    }
    
    throw new Error(response.error || 'Failed to fetch konsumen list');
  }

  /**
   * Get konsumen by ID
   * Returns: Konsumen directly
   */
  async getKonsumenById(id: number): Promise<Konsumen> {
    const token = await authService.getToken();
    const response = await apiHelper.get<any>(`/konsumen/${id}`, token || undefined);
    
    if (response.success && response.data && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.error || 'Failed to fetch konsumen');
  }

  /**
   * Create new konsumen
   * Returns: Konsumen directly
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
   * Returns: Konsumen directly
   */
  async updateKonsumen(id: number, data: Partial<CreateKonsumenData>): Promise<Konsumen> {
    const token = await authService.getToken();
    const response = await apiHelper.put<any>(`/konsumen/${id}`, data, token || undefined);
    
    if (response.success && response.data && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.error || 'Failed to update konsumen');
  }

  /**
   * Delete konsumen
   * Returns: success message
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
   * Returns: KonsumenStatistics directly
   */
  async getStatistics(): Promise<KonsumenStatistics> {
    const token = await authService.getToken();
    const response = await apiHelper.get<any>('/konsumen/statistics', token || undefined);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch statistics');
  }
}

export const konsumenService = new KonsumenService();
export default konsumenService;