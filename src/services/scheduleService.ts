import apiHelper from '../utils/apiHelper';
import { authService } from './authService';

// Interface untuk Schedule (berdasarkan followup dengan next_followup_date)
export interface Schedule {
  id: number;
  konsumen_id: number;
  followup_status_id: number;
  type: 'socmed' | 'email' | 'whatsapp' | 'visit' | 'other';
  followup_date: string;
  notes: string;
  response: string | null;
  next_followup_date: string | null;
  schedule_date: string;
  schedule_type: 'followup' | 'visit';
  visit_date: string | null;
  result: string;
  status: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  konsumen: {
    facebook: any;
    instagram: any;
    tiktok: any;
    address: string;
    id: number;
    code: string;
    name: string;
    email: string | null;
    phone: string;
    whatsapp: string;
    company: string | null;
    position: string | null;
    status: string;
    mitra: {
      id: number;
      name: string;
    }
  };
  followup_status: {
    id: number;
    name: string;
    color: string;
    order: number;
    is_active: boolean;
  };
  created_by_user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ScheduleStatistics {
  today: number;
  this_week: number;
  this_month: number;
  upcoming: number;
  overdue: number;
  by_type: Array<{
    type: string;
    total: number;
  }>;
  by_status: Array<{
    status: string;
    total: number;
  }>;
}

export interface ScheduleResponse {
  success: boolean;
  data: Schedule[] | Record<string, Schedule[]>;
  message: string;
}

export interface SchedulePaginatedResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Schedule[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  message: string;
}

export interface ScheduleStatisticsResponse {
  success: boolean;
  data: ScheduleStatistics;
  message: string;
}

export interface ScheduleFilters {
  month?: number;
  year?: number;
  konsumen_id?: number;
  type?: string;
  per_page?: number;
  days?: number;
  date?: string;
  date_from?: string;
  date_to?: string;
}

class ScheduleService {
  private async getToken() {
    return await authService.getToken();
  }

  // Get schedule list (with pagination and filters)
  async getSchedules(filters?: ScheduleFilters): Promise<SchedulePaginatedResponse> {
    const token = await this.getToken();
    return await apiHelper.get<SchedulePaginatedResponse>(
      '/schedule',
      token || undefined,
      filters
    );
  }
  
  async getOverdueSchedules(): Promise<ScheduleResponse> {
    const token = await this.getToken();
    return await apiHelper.get<ScheduleResponse>(
      '/schedule/overdue',
      token || undefined,
    );
  }

  // Get today's schedule
  async getTodaySchedule(): Promise<ScheduleResponse> {
    const token = await this.getToken();
    return await apiHelper.get<ScheduleResponse>(
      '/schedule/today',
      token || undefined
    );
  }

  // Get this week's schedule (grouped by date)
  async getThisWeekSchedule(): Promise<ScheduleResponse> {
    const token = await this.getToken();
    return await apiHelper.get<ScheduleResponse>(
      '/schedule/this-week',
      token || undefined
    );
  }

  // Get upcoming schedule
  async getUpcomingSchedule(days: number = 7, perPage: number = 15): Promise<SchedulePaginatedResponse> {
    const token = await this.getToken();
    return await apiHelper.get<SchedulePaginatedResponse>(
      '/schedule/upcoming',
      token || undefined,
      { days, per_page: perPage }
    );
  }

  // Get calendar schedule (grouped by date)
  async getCalendarSchedule(month?: number, year?: number): Promise<ScheduleResponse> {
    const token = await this.getToken();
    const params: any = {};
    
    if (month) params.month = month;
    if (year) params.year = year;
    
    return await apiHelper.get<ScheduleResponse>(
      '/schedule/calendar',
      token || undefined,
      params
    );
  }

  // Get schedule by specific date
  async getScheduleByDate(date: string): Promise<ScheduleResponse> {
    const token = await this.getToken();
    return await apiHelper.get<ScheduleResponse>(
      '/schedule/by-date',
      token || undefined,
      { date }
    );
  }

  // Get schedule by date range
  async getScheduleByDateRange(
    dateFrom: string,
    dateTo: string,
    perPage: number = 15
  ): Promise<SchedulePaginatedResponse> {
    const token = await this.getToken();
    return await apiHelper.get<SchedulePaginatedResponse>(
      '/schedule/by-date-range',
      token || undefined,
      { date_from: dateFrom, date_to: dateTo, per_page: perPage }
    );
  }

  // Get schedule statistics
  async getStatistics(): Promise<ScheduleStatisticsResponse> {
    const token = await this.getToken();
    return await apiHelper.get<ScheduleStatisticsResponse>(
      '/schedule/statistics',
      token || undefined
    );
  }

  // Helper: Format date untuk display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Helper: Format time untuk display
  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Helper: Check if date is today
  isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  // Helper: Check if date is past
  isPast(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  // Helper: Get type label
  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      call: 'Telepon',
      email: 'Email',
      whatsapp: 'WhatsApp',
      visit: 'Kunjungan',
      other: 'Lainnya',
    };
    return labels[type] || type;
  }

  // Helper: Get type icon
  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      call: 'phone',
      email: 'mail',
      whatsapp: 'logo-whatsapp',
      visit: 'location',
      other: 'ellipsis-horizontal',
    };
    return icons[type] || 'ellipsis-horizontal';
  }

  // Helper: Get result color
  getResultColor(result: string): string {
    const colors: Record<string, string> = {
      pending: '#F59E0B',
      success: '#10B981',
      failed: '#EF4444',
      rescheduled: '#3B82F6',
    };
    return colors[result] || '#6B7280';
  }
}

export const scheduleService = new ScheduleService();
export default scheduleService;