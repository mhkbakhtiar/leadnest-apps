import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import notificationApiService, { AppNotification } from '../services/notificationApiService';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

const timeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await notificationApiService.getList();
      setNotifications(res.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      loadNotifications();
    }
  }, [visible, loadNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handlePressItem = async (item: AppNotification) => {
    if (!item.read_at) {
      // Update UI dulu biar terasa instan
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      try {
        await notificationApiService.markAsRead(item.id);
        const newCount = await notificationApiService.getUnreadCount();
        onUnreadCountChange?.(newCount);
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    try {
      await notificationApiService.markAllAsRead();
      onUnreadCountChange?.(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const unreadExists = notifications.some((n) => !n.read_at);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notifikasi</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Tutup</Text>
            </TouchableOpacity>
          </View>

          {unreadExists && (
            <TouchableOpacity style={styles.markAllRow} onPress={handleMarkAllAsRead}>
              <Text style={styles.markAllText}>Tandai semua sudah dibaca</Text>
            </TouchableOpacity>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#165044" />
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyText}>Belum ada notifikasi</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id.toString()}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.item, !item.read_at && styles.itemUnread]}
                  onPress={() => handlePressItem(item)}
                >
                  <View style={styles.itemLeft}>
                    {!item.read_at && <View style={styles.unreadDot} />}
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={[styles.itemTitle, !item.read_at && styles.itemTitleUnread]}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemBody} numberOfLines={2}>
                      {item.body}
                    </Text>
                    <Text style={styles.itemTime}>{timeAgo(item.created_at)}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  markAllRow: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  markAllText: {
    fontSize: 13,
    color: '#165044',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  item: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemUnread: {
    backgroundColor: '#F8FAF9',
  },
  itemLeft: {
    width: 16,
    alignItems: 'center',
    paddingTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#165044',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 3,
  },
  itemTitleUnread: {
    fontWeight: '700',
    color: '#111827',
  },
  itemBody: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default NotificationsModal;