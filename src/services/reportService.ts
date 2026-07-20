import apiHelper from '../utils/apiHelper';
import { authService } from './authService';

// =======================
// ====== INTERFACES =====
// =======================
export interface DashboardReport {
  stats: {
    total_konsumen: number;
    konsumen_7days: number;
    konsumen_this_month: number;
    total_closing_alltime: number;
    total_closing_month: number;
    total_followup: number;
    followup_7days: number;
    conversion_rate: number;
  };
  segmentation: {
    by_response: {
      has_data: boolean;
      hot: number;
      warm: number;
      cold: number;
      hot_percent: number;
      warm_percent: number;
      cold_percent: number;
    };
    by_budget: {
      has_data: boolean;
      data: { budget: string; count: number; percent: number }[];
    };
    by_source: {
      has_data: boolean;
      data: { source: string; count: number; percent: number }[];
    };
    by_status: {
      has_data: boolean;
      data: { name: string; count: number; percent: number; color: string }[];
    };
    by_type: {
      has_data: boolean;
      data: { type: string; count: number; percent: number; color: string }[];
    };
  };
  mitra_stats: {
    name: string;
    total_konsumen: number;
    total_followup: number;
    total_closing: number;
    closing_month: number;
    conversion_rate: number;
  }[];
  today_followups: {
    konsumen_name: string;
    notes: string | null;
    status: string | null;
  }[];
  recent_followups: {
    konsumen_name: string;
    notes: string | null;
    type: string;
    status: string | null;
    followup_date: string;
  }[];
  charts_data: {
    konsumen_6months: { labels: string[]; data: number[] };
    closing_6months: { labels: string[]; data: number[] };
    followup_6months: { labels: string[]; data: number[] };
  };
}

// =======================
// ===== SERVICE CLASS ====
// =======================
class ReportService {
  /**
   * Get dashboard report
   */
  async getDashboard(): Promise<DashboardReport> {
    const token = await authService.getToken();
    const response = await apiHelper.get<any>('/reports/dashboard', token || undefined);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch dashboard report');
  }
}

export const reportService = new ReportService();
export default reportService;