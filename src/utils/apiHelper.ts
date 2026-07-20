const BASE_URL = 'https://auragroup-leadnest.verse-realty.com/api';
const PROADS_BASE_URL = 'https://auragroup-proads.verse-realty.com/api';
const PROADS_API_KEY = 'Bacg2esKZh49PfrhjEinZWelKNNOXnOe';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  token?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ─── Types untuk Proads API ───────────────────────────────
export interface KavlingItem {
  id: number;
  nomor_kavling: string;
  status: string;
  deadline: string | null;
  blok: string;
  cluster: string;
  id_project: number;
  project: string;
  total_persentase: number;
  total_progres: number;
  tgl_progres_terakhir: string | null;
  subkon_aktif: number;
  deadline_status: DeadlineStatus | null;
}

export interface DeadlineStatus {
  status: 'selesai' | 'terlambat' | 'kritis' | 'perhatian' | 'aman';
  label: string;
  warna: 'green' | 'yellow' | 'red' | 'gray';
  sisa_hari: number;
}

export interface KavlingMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface KavlingListResponse {
  success: boolean;
  data: KavlingItem[];
  meta: KavlingMeta;
}

export interface ProgresItem {
  id: number;
  id_kavling: number;
  tanggal: string;
  keterangan: string;
  persentase: number;
  total_sampai_ini: number;
  foto_urls: string[];
  foto_count: number;
  created_at: string;
}

export interface KavlingProgresResponse {
  success: boolean;
  data: {
    kavling: {
      id: number;
      name: string;
      status: string;
      deadline: string | null;
      total_persentase: number;
      total_progres: number;
    };
    progres: ProgresItem[];
    deadline_status: DeadlineStatus | null;
  };
}

export interface SubkontraktorItem {
  id: number;
  id_kavling: number;
  id_subkontraktor: number;
  nama: string;
  kode: string;
  pic: string | null;
  telepon: string | null;
  spesialisasi: string | null;
  status: 'aktif' | 'selesai' | 'batal';
  tgl_mulai: string;
  tgl_selesai_rencana: string | null;
  tgl_selesai_aktual: string | null;
  lingkup_pekerjaan: string | null;
  nilai_kontrak: number | null;
  total_terbayar: number;
  is_telat: boolean;
  sisa_hari: number | null;
}

export interface FilterItem {
  id: number;
  nama: string;
}

export interface KavlingFilterParams {
  search?: string;
  status?: string;
  id_project?: number;
  id_cluster?: number;
  id_blok?: number;
  per_page?: number;
  page?: number;
  marketing_id?: number; // ← Tambahan untuk filter marketing_id
}
// ─────────────────────────────────────────────────────────

class ApiHelper {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { method = 'GET', headers = {}, body, token } = options;

    const config: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    console.log('Payloads for', `${this.baseUrl}${endpoint}`, ':', { method, body });

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json();

      console.log('Incoming url:', `${this.baseUrl}${endpoint}`);
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get<T>(
    endpoint: string,
    token?: string,
    params?: Record<string, any>
  ): Promise<T> {
    let url = endpoint;

    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) acc[key] = String(value);
          return acc;
        }, {} as Record<string, string>)
      ).toString();
      url += `?${queryString}`;
    }

    return this.request<T>(url, { method: 'GET', token });
  }

  async post<T>(endpoint: string, body: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, token });
  }

  async put<T>(endpoint: string, body: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, token });
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', token });
  }

  async patch<T>(endpoint: string, body: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body, token });
  }

  setBaseUrl(url: string) { this.baseUrl = url; }
  setDefaultHeaders(headers: Record<string, string>) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }
}

// ─── Proads API Helper (pakai X-API-KEY, tanpa Bearer token) ─
class ProadsApiHelper {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = PROADS_BASE_URL;
    this.apiKey  = PROADS_API_KEY;
  }

  private async request<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`;

    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) acc[key] = String(value);
          return acc;
        }, {} as Record<string, string>)
      ).toString();
      url += `?${queryString}`;
    }

    console.log('[Proads] GET:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept':       'application/json',
          'X-API-KEY':    this.apiKey,  // ← API key di sini
        },
      });

      const data = await response.json();
      console.log('[Proads] Response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan');
      }

      return data;
    } catch (error) {
      console.error('[Proads] Error:', error);
      throw error;
    }
  }

  // ── Kavling ────────────────────────────────────────────
  getKavlingList(params?: KavlingFilterParams): Promise<KavlingListResponse> {
    return this.request<KavlingListResponse>('/v1/kavling', params);
  }

  getKavlingDetail(id: number): Promise<{ success: boolean; data: KavlingItem }> {
    return this.request<{ success: boolean; data: KavlingItem }>(`/v1/kavling/${id}`);
  }

  getKavlingProgres(id: number): Promise<KavlingProgresResponse> {
    return this.request<KavlingProgresResponse>(`/v1/kavling/${id}/progres`);
  }

  getKavlingSubkontraktor(id: number): Promise<{ success: boolean; data: SubkontraktorItem[] }> {
    return this.request<{ success: boolean; data: SubkontraktorItem[] }>(`/v1/kavling/${id}/subkontraktor`);
  }

  // ── Filter Options ─────────────────────────────────────
  getFilterProject(marketingId?: number): Promise<{ success: boolean; data: FilterItem[] }> {
    return this.request<{ success: boolean; data: FilterItem[] }>('/v1/filter/project',
      marketingId ? { marketing_id: marketingId } : undefined
    );
  }

  getFilterCluster(idProject?: number): Promise<{ success: boolean; data: FilterItem[] }> {
    return this.request<{ success: boolean; data: FilterItem[] }>(
      '/v1/filter/cluster',
      idProject ? { id_project: idProject } : undefined
    );
  }

  getFilterBlok(idCluster?: number): Promise<{ success: boolean; data: FilterItem[] }> {
    return this.request<{ success: boolean; data: FilterItem[] }>(
      '/v1/filter/blok',
      idCluster ? { id_cluster: idCluster } : undefined
    );
  }
}

export const apiHelper     = new ApiHelper();
export const proadsApi     = new ProadsApiHelper(); // ← instance untuk Proads
export default apiHelper;