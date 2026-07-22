import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import apiHelper from '../utils/apiHelper';
import { authService } from './authService';

class NotificationService {
  /**
   * Minta izin notifikasi (wajib di Android 13+ dan semua iOS)
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return false;
      }
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    return enabled;
  }

  /**
   * Ambil FCM token & kirim ke backend
   */
  async registerToken(): Promise<void> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('Notification permission ditolak');
        return;
      }

      const token = await messaging().getToken();
      if (!token) return;

      const authToken = await authService.getToken();
      await apiHelper.post(
        '/notifications/register-token',
        { token, platform: Platform.OS },
        authToken || undefined
      );

      console.log('FCM token registered:', token);
    } catch (error) {
      console.error('Error registering FCM token:', error);
    }
  }

  /**
   * Hapus token dari backend (dipanggil saat logout)
   */
  async unregisterToken(): Promise<void> {
    try {
      const token = await messaging().getToken();
      if (!token) return;

      const authToken = await authService.getToken();
      await apiHelper.post(
        '/notifications/unregister-token',
        { token },
        authToken || undefined
      );
    } catch (error) {
      console.error('Error unregistering FCM token:', error);
    }
  }

  /**
   * Listener untuk notif masuk saat app di foreground
   */
  setupForegroundListener(onNotification?: (title: string, body: string) => void) {
    return messaging().onMessage(async (remoteMessage) => {
      console.log('Notif diterima (foreground):', remoteMessage);

      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });

      // Tampilkan notifikasi lokal manual
      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'Notifikasi',
        body: remoteMessage.notification?.body || '',
        android: {
          channelId,
          pressAction: {
            id: 'default',
          },
        },
      });
      
      if (onNotification && remoteMessage.notification) {
        onNotification(
          remoteMessage.notification.title || '',
          remoteMessage.notification.body || ''
        );
      }
    });
  }

  /**
   * Listener saat notif di-tap dan app dibuka dari background
   */
  setupBackgroundOpenListener(onOpen?: (data: any) => void) {
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notif dibuka dari background:', remoteMessage);
      if (onOpen) onOpen(remoteMessage.data);
    });

    // Cek juga kalau app dibuka dari kondisi quit (notif di-tap saat app tertutup total)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('App dibuka dari quit state via notif:', remoteMessage);
          if (onOpen) onOpen(remoteMessage.data);
        }
      });
  }

  /**
   * Listener token refresh (FCM token bisa berubah sewaktu-waktu)
   */
  setupTokenRefreshListener() {
    return messaging().onTokenRefresh(async (newToken) => {
      const authToken = await authService.getToken();
      await apiHelper.post(
        '/notifications/register-token',
        { token: newToken, platform: Platform.OS },
        authToken || undefined
      );
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;