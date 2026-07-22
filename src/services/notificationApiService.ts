import apiHelper from '../utils/apiHelper';
import { authService } from './authService';

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  type: string | null;
  data: Record<string, any> | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  data: AppNotification[];
  current_page: number;
  last_page: number;
  total: number;
}

class NotificationApiService {
  async getList(page: number = 1): Promise<NotificationListResponse> {
    const token = await authService.getToken();
    const response = await apiHelper.get<any>(
      `/notifications?page=${page}`,
      token || undefined
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Gagal memuat notifikasi');
  }

  async getUnreadCount(): Promise<number> {
    const token = await authService.getToken();
    const response = await apiHelper.get<any>(
      '/notifications/unread-count',
      token || undefined
    );

    if (response.success) {
      return response.unread_count ?? 0;
    }

    return 0;
  }

  async markAsRead(id: number): Promise<void> {
    const token = await authService.getToken();
    await apiHelper.post(`/notifications/${id}/read`, {}, token || undefined);
  }

  async markAllAsRead(): Promise<void> {
    const token = await authService.getToken();
    await apiHelper.post('/notifications/read-all', {}, token || undefined);
  }
}

export const notificationApiService = new NotificationApiService();
export default notificationApiService;