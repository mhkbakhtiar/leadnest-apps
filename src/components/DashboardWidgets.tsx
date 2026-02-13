import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { DashboardData } from '../services/dashboardService';

const { width } = Dimensions.get('window');

interface DashboardWidgetsProps {
  data: DashboardData;
  onKonsumenPress?: (konsumenId: number) => void;
  onSchedulePress?: (scheduleId: number) => void;
}

const generateClosingTargetLabel = (startDateString: string) => {
    if (!startDateString) return '';

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ];

    const start = new Date(startDateString);
    const end = new Date(start);
    end.setMonth(start.getMonth() + 3); // rentang 4 bulan

    const startMonth = monthNames[start.getMonth()];
    const endMonth = monthNames[end.getMonth()];
    const year = start.getFullYear();

    return `${startMonth}–${endMonth} ${year}`;
  };

export const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({
  data,
  onKonsumenPress,
  onSchedulePress,
}) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Gradient */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {data.user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{data.user.name}</Text>
              <Text style={styles.userPoints}>
                Target bulan ini 🎯
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellIcon}>
            <Text style={styles.bellEmoji}>🔔</Text>
            {data.today_schedule && data.today_schedule.length > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifText}>{data.today_schedule.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 🎯 Target Cards - Horizontal Scroll */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.targetCardsContainer}
        >
          {/* Closing Target Card */}
          <View style={[styles.targetCard, styles.targetCardPrimary]}>
            <View style={styles.targetHeader}>
              <Text style={styles.targetLabel}>Target Closing ({data.closing_target.target} / Quartal)</Text>
              <Text style={styles.targetEmoji}>🎯</Text>
            </View>
            <View style={styles.targetAmount}>
              <Text style={styles.targetValue}>{data.closing_target.achieved}</Text>
              <Text style={styles.targetMax}>/ {data.closing_target.target}</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(data.closing_target.percentage, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {data.closing_target.percentage}% tercapai • {data.closing_target.period}
            </Text>
          </View>

          {/* Leads Target Card */}
          <View style={[styles.targetCard, styles.targetCardSecondary]}>
            <View style={styles.targetHeader}>
              <Text style={styles.targetLabel}>Target Leads ({data.leads_target.daily_target} / per hari)</Text>
              <Text style={styles.targetEmoji}>👥</Text>
            </View>
            <View style={styles.targetAmount}>
              <Text style={styles.targetValue}>{data.leads_target.achieved}</Text>
              <Text style={styles.targetMax}>/ {data.leads_target.target}</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFillSecondary,
                  { width: `${Math.min(data.leads_target.percentage, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {data.leads_target.percentage}% tercapai • {data.leads_target.period}
            </Text>
          </View>

          {/* Follow-up Target Card */}
          <View style={[styles.targetCard, styles.targetCardTertiary]}>
            <View style={styles.targetHeader}>
              <Text style={styles.targetLabel}>Target Follow-up ({data.followup_target.weekly_target } / per minggu)</Text>
              <Text style={styles.targetEmoji}>📞</Text>
            </View>
            <View style={styles.targetAmount}>
              <Text style={styles.targetValue}>{data.followup_target.achieved}</Text>
              <Text style={styles.targetMax}>/ {data.followup_target.target}</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFillTertiary,
                  { width: `${Math.min(data.followup_target.percentage, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {data.followup_target.percentage}% tercapai • {data.followup_target.period}
            </Text>
          </View>
        </ScrollView>
      </View>

      <View style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Performa Minggu Ini</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Text style={styles.statEmoji}>📈</Text>
              </View>
              <Text style={styles.statValue}>{data.week_performance.followups}</Text>
              <Text style={styles.statLabel}>Follow-up</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Text style={styles.statEmoji}>🏢</Text>
              </View>
              <Text style={styles.statValue}>{data.week_performance.site_visits}</Text>
              <Text style={styles.statLabel}>Janji Cek Lokasi</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Text style={styles.statEmoji}>👥</Text>
              </View>
              <Text style={styles.statValue}>{data.week_performance.leads}</Text>
              <Text style={styles.statLabel}>Konsumen Baru</Text>
            </View>
          </View>
        </View>

        {/* Status Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Konsumen</Text>
          <View style={styles.statusContainer}>
            {data.status_distribution.map((status, idx) => (
              <View key={idx} style={styles.statusItem}>
                <View style={styles.statusLeft}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: status.color },
                    ]}
                  />
                  <Text style={styles.statusName}>{status.name}</Text>
                </View>
                <Text style={styles.statusValue}>{status.total}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Today's Follow-up */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Follow-up Hari Ini</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Lihat Semua →</Text>
            </TouchableOpacity>
          </View>
          {data.top_followup_needed && data.top_followup_needed.length > 0 ? (
            <View style={styles.followupContainer}>
              {data.top_followup_needed.slice(0, 3).map((konsumen) => (
                <TouchableOpacity
                  key={konsumen.id}
                  style={styles.followupCard}
                  onPress={() => onKonsumenPress?.(konsumen.id)}
                >
                  <View style={styles.followupLeft}>
                    <View style={styles.followupAvatar}>
                      <Text style={styles.followupInitial}>
                        {konsumen?.name
                          ? konsumen.name.charAt(0).toUpperCase()
                          : '?'}
                      </Text>

                    </View>
                    <View style={styles.followupInfo}>
                      <Text style={styles.followupName}>{konsumen.name}</Text>
                      <Text style={styles.followupDetail}>{konsumen.phone}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.followupBadge,
                      { backgroundColor: konsumen.status_color + '15' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.followupBadgeText,
                        { color: konsumen.status_color },
                      ]}
                    >
                      {konsumen.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>✅</Text>
              <Text style={styles.emptyText}>Tidak ada follow-up hari ini</Text>
            </View>
          )}
        </View>

        {/* Today's Schedule */}
        {data.today_schedule && data.today_schedule.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Jadwal Hari Ini</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Lihat Semua →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.scheduleContainer}>
              {data.today_schedule.slice(0, 3).map((schedule) => (
                <TouchableOpacity
                  key={schedule.id}
                  style={styles.scheduleCard}
                  onPress={() => onSchedulePress?.(schedule.id)}
                >
                  <View
                    style={[
                      styles.scheduleTime,
                      { backgroundColor: schedule.status_color + '15' },
                    ]}
                  >
                    <Text style={[styles.scheduleTimeText, { color: schedule.status_color }]}>
                      {schedule.scheduled_time.split(' ')[0]}
                    </Text>
                  </View>
                  <View style={styles.scheduleContent}>
                    <Text style={styles.scheduleName}>{schedule.konsumen_name}</Text>
                    <Text style={styles.scheduleType}>
                      {schedule.type === 'call' ? '📞 Call' : '🏢 Site Visit'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
          <View style={styles.activityContainer}>
            {data.recent_activities.slice(0, 4).map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View
                  style={[
                    styles.activityIcon,
                    {
                      backgroundColor:
                        activity.type === 'closing'
                          ? '#10B98115'
                          : activity.type === 'new_customer'
                          ? '#3B82F615'
                          : '#8B5CF615',
                    },
                  ]}
                >
                  <Text style={styles.activityEmoji}>
                    {activity.type === 'closing'
                      ? '🎉'
                      : activity.type === 'new_customer'
                      ? '👤'
                      : '📝'}
                  </Text>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityTime}>{activity.time_ago}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#165044',
    paddingTop: 16,
    paddingBottom: 24,
    // borderBottomLeftRadius: 24,
    // borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userPoints: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  bellIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellEmoji: {
    fontSize: 20,
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // 🎯 Target Cards Styles
  targetCardsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  targetCard: {
    width: width * 0.7,
    padding: 20,
    borderRadius: 16,
    marginRight: 12,
    
  },
  targetCardPrimary: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  targetCardSecondary: {
    backgroundColor: 'rgba(59,130,246,0.15)',
  },
  targetCardTertiary: {
    backgroundColor: 'rgba(139,92,246,0.15)',
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  targetLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  targetEmoji: {
    fontSize: 20,
  },
  targetAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  targetValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  targetMax: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AA00',
    borderRadius: 3,
  },
  progressFillSecondary: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  progressFillTertiary: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  quickActionsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  quickActionsScroll: {
    paddingHorizontal: 16,
  },
  quickAction: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F8F9FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statEmoji: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 13,
    color: '#165044',
    fontWeight: '600',
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  followupContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  followupCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  followupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  followupAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  followupInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#165044',
  },
  followupInfo: {
    flex: 1,
  },
  followupName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 3,
  },
  followupDetail: {
    fontSize: 13,
    color: '#6B7280',
  },
  followupBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  followupBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scheduleContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  scheduleTime: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  scheduleTimeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 3,
  },
  scheduleType: {
    fontSize: 13,
    color: '#6B7280',
  },
  activityContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
    paddingTop: 2,
  },
  activityTitle: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  bottomSpace: {
    height: 100,
  },
});

export default DashboardWidgets;