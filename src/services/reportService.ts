import apiHelper from '../utils/apiHelper';
import { authService } from './authService';

// =======================
// ====== INTERFACES =====
// =======================
export interface DashboardReport {
  konsumen: {
    total: number;
    this_month: number;
    last_month: number;
    growth: number;
    by_latest_status: {
      cold: number;
      warm: number;
      hot: number;
      closing: number;
      cancel: number;
    };
  };
  followups: {
    total: number;
    this_month: number;
    upcoming: number;
    upcoming_visits: number;
    by_status: {
      cold: number;
      warm: number;
      hot: number;
      closing: number;
      cancel: number;
    };
  };
}

export interface StatusData {
  status: string;
  total: number;
  percentage?: number;
}

export interface SourceData {
  source: string;
  total: number;
}

export interface TimelineData {
  date: string;
  total: number;
}

export interface KonsumenReport {
  total_konsumen: number;
  by_status: StatusData[];
  by_source: SourceData[];
  timeline: TimelineData[];
}

export interface FollowupReport {
  total_followups: number;
  by_status: StatusData[];
  by_type: { type: string; total: number }[];
  by_result: { result: string; total: number }[];
  timeline: TimelineData[];
  visits: {
    scheduled: number;
    upcoming: number;
  };
  avg_per_konsumen: number;
}

export interface SourceReportData {
  source: string;
  total: number;
  cold: number;
  warm: number;
  hot: number;
  closing: number;
  cancel: number;
  closing_rate: number;
  cancel_rate: number;
  active_rate: number;
}

export interface FunnelStage {
  stage: string;
  label: string;
  count: number;
  percentage: number;
  conversion_rate?: number;
}

export interface StatusProgressionReport {
  funnel: FunnelStage[];
  lost: {
    cancel: number;
    percentage: number;
  };
  summary: {
    total_leads: number;
    closing: number;
    overall_closing_rate: number;
  };
}

export interface VisitReport {
  total_visits: number;
  completed: number;
  upcoming: number;
  today: number;
  this_week: number;
  by_status: { status: string; total: number }[];
  timeline: TimelineData[];
}

export interface ReportParams {
  period?: 'day' | 'week' | 'month' | 'year';
  start_date?: string;
  end_date?: string;
}

export interface ExportParams {
  type?: 'konsumen' | 'followups' | 'combined';
  start_date?: string;
  end_date?: string;
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

  /**
   * Get konsumen report
   */
  async getKonsumenReport(params?: ReportParams): Promise<KonsumenReport> {
    const token = await authService.getToken();
    const response = await apiHelper.get<any>('/reports/konsumen-report', token || undefined, params);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch konsumen report');
  }

  /**
   * Get followup report
   */
  async getFollowupReport(params?: ReportParams): Promise<FollowupReport> {
    const token = await authService.getToken();
    const response = await apiHelper.get<any>('/reports/followup-report', token || undefined, params);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch followup report');
  }

  /**
   * Get source report
   */
  async getSourceReport(params?: Omit<ReportParams, 'period'>): Promise<SourceReportData[]> {
    const token = await authService.getToken();
    const response = await apiHelper.get<any>('/reports/source-report', token || undefined, params);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch source report');
  }

  /**
   * Get status progression report
   */
  async getStatusProgressionReport(params?: Omit<ReportParams, 'period'>): Promise<StatusProgressionReport> {
    const token = await authService.getToken();
    const response = await apiHelper.get<any>('/reports/status-progression-report', token || undefined, params);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch status progression report');
  }

  /**
   * Get visit report
   */
  async getVisitReport(params?: ReportParams): Promise<VisitReport> {
    const token = await authService.getToken();
    const response = await apiHelper.get<any>('/reports/visit-report', token || undefined, params);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch visit report');
  }

  /**
   * Export report data
   */
  async exportData(params?: ExportParams): Promise<any> {
    const token = await authService.getToken();
    const response = await apiHelper.get<any>('/reports/export', token || undefined, params);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to export data');
  }
}

export const reportService = new ReportService();
export default reportService;