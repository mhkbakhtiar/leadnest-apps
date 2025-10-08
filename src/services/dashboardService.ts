import apiHelper from '../utils/apiHelper';
import { authService } from './authService';

export interface DashboardData {
  user: {
    id: number;
    name: string;
    role: string;
  };
  current_date: string;
  sales_target: {
    achieved: number;
    target: number;
    percentage: number;
  };
  followup_target: {
    achieved: number;
    target: number;
    percentage: number;
    daily_target: number;
  };
  status_distribution: Array<{
    name: string;
    color: string;
    total: number;
  }>;
  daily_customer_target: {
    achieved: number;
    target: number;
    percentage: number;
    remaining: number;
  };
  today_schedule: Array<{
    id: number;
    konsumen_id: number;
    konsumen_name: string;
    type: string;
    scheduled_time: string;
    status: string;
    status_color: string;
  }>;
  week_performance: {
    followups: number;
    site_visits: number;
    closings: number;
  };
  recent_activities: Array<{
    id: number;
    type: string;
    title: string;
    description: string;
    status: string;
    status_color: string;
    time_ago: string;
    value: string | null;
  }>;
}

export interface QuickStats {
  sales_today: number;
  followups_today: number;
  customers_today: number;
  pending_followups: number;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export interface QuickStatsResponse {
  success: boolean;
  data: QuickStats;
}

class DashboardService {
  /**
   * Get dashboard data for marketing
   * @returns Dashboard data with all widgets information
   */
  async getDashboardData() {
    const token = await authService.getToken();
    const response = await apiHelper.get<DashboardResponse>('/dashboard', token || undefined);
    return response;
  }

  /**
   * Get quick stats for widget refresh
   * @returns Quick statistics for today
   */
  async getQuickStats() {
    const token = await authService.getToken();
    const response = await apiHelper.get<QuickStats>('/dashboard/quick-stats', token || undefined);
    return response;
  }

  /**
   * Refresh dashboard data
   * Utility method to fetch fresh dashboard data
   */
  async refreshDashboard() {
    try {
      const [dashboardResponse, statsResponse] = await Promise.all([
        this.getDashboardData(),
        this.getQuickStats(),
      ]);

      return {
        dashboard: dashboardResponse,
        quickStats: statsResponse,
      };
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      throw error;
    }
  }

  /**
   * Get dashboard data with error handling
   * Returns null if error occurs
   */
  async getDashboardDataSafe(): Promise<DashboardData | null> {
    try {
      const response = await this.getDashboardData();
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return null;
    }
  }

  /**
   * Get quick stats with error handling
   * Returns null if error occurs
   */
  async getQuickStatsSafe(): Promise<QuickStats | null> {
    try {
      const response = await this.getQuickStats();
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      return null;
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;