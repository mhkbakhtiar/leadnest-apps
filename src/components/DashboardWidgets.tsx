import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DashboardData } from '../services/dashboardService';

interface DashboardWidgetsProps {
  data: DashboardData;
  onKelolakonsumen?: () => void;
  onInputFollowup?: () => void;
  onSchedulePress?: (scheduleId: number) => void;
}

export const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({
  data,
  onKelolakonsumen,
  onInputFollowup,
  onSchedulePress,
}) => {
  return (
    <View style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.title}>Dashboard Sales</Text>
        <Text style={styles.subtitle}>Hari ini: {data.current_date}</Text>
      </View>

      {/* Widget Grid - Top 4 Cards */}
      <View style={styles.widgetGrid}>
        {/* Target Sales */}
        <View style={styles.widgetCard}>
          <Text style={styles.widgetTitle}>Target Sales</Text>
          <View style={styles.widgetCenter}>
            <Text style={styles.widgetValueBlue}>
              {data.sales_target.achieved} / {data.sales_target.target}
            </Text>
            <Text style={styles.widgetSubtext}>Bulan ini</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFillBlue,
                { width: `${data.sales_target.percentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {data.sales_target.percentage}% tercapai
          </Text>
        </View>

        {/* FU Leads */}
        <View style={styles.widgetCard}>
          <Text style={styles.widgetTitle}>FU Leads</Text>
          <View style={styles.widgetCenter}>
            <Text style={styles.widgetValueGreen}>
              {data.followup_target.achieved} / {data.followup_target.target}
            </Text>
            <Text style={styles.widgetSubtext}>Bulan ini</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFillGreen,
                { width: `${data.followup_target.percentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Target: {data.followup_target.daily_target}/hari
          </Text>
        </View>

        {/* Status FU */}
        <View style={styles.widgetCard}>
          <Text style={styles.widgetTitle}>Status FU</Text>
          <View style={styles.statusList}>
            {data.status_distribution.map((status, idx) => (
              <View key={idx} style={styles.statusRow}>
                <View style={styles.statusLeft}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: status.color },
                    ]}
                  />
                  <Text style={styles.statusName}>{status.name}</Text>
                </View>
                <Text style={styles.statusTotal}>{status.total}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Target Hari Ini */}
        <View style={styles.widgetCard}>
          <Text style={styles.widgetTitle}>Target Hari Ini</Text>
          <View style={styles.widgetCenter}>
            <Text style={styles.widgetValuePurple}>
              {data.daily_customer_target.achieved} /{' '}
              {data.daily_customer_target.target}
            </Text>
            <Text style={styles.widgetSubtext}>Data konsumen</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFillPurple,
                { width: `${data.daily_customer_target.percentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {data.daily_customer_target.remaining} lagi target tercapai
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={onKelolakonsumen}
          >
            <View style={styles.actionIconBlue}>
              <Text style={styles.actionEmoji}>👥</Text>
            </View>
            <Text style={styles.actionTitle}>Kelola Konsumen</Text>
            <Text style={styles.actionSubtitle}>Lihat & edit data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={onInputFollowup}>
            <View style={styles.actionIconGreen}>
              <Text style={styles.actionEmoji}>📞</Text>
            </View>
            <Text style={styles.actionTitle}>Input Follow-up</Text>
            <Text style={styles.actionSubtitle}>Tambah catatan baru</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Jadwal Hari Ini</Text>
        {data.today_schedule.map((schedule) => (
          <TouchableOpacity
            key={schedule.id}
            style={[
              styles.scheduleCard,
              { borderLeftColor: schedule.status_color },
            ]}
            onPress={() => onSchedulePress?.(schedule.id)}
          >
            <View style={styles.scheduleContent}>
              <View style={styles.scheduleLeft}>
                <Text style={styles.scheduleTitle}>
                  Follow-up {schedule.konsumen_name}
                </Text>
                <Text style={styles.scheduleTime}>
                  {schedule.type === 'call' ? '📞' : '🏢'}{' '}
                  {schedule.scheduled_time} - Status: {schedule.status}
                </Text>
              </View>
              <View
                style={[
                  styles.scheduleBadge,
                  { backgroundColor: `${schedule.status_color}20` },
                ]}
              >
                <Text
                  style={[styles.scheduleBadgeText, { color: schedule.status_color }]}
                >
                  Mulai
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Performance Summary */}
      <View style={styles.performanceCard}>
        <Text style={styles.sectionTitle}>Performa Minggu Ini</Text>
        <View style={styles.performanceGrid}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValueBlue}>
              {data.week_performance.followups}
            </Text>
            <Text style={styles.performanceLabel}>Follow-up</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValueGreen}>
              {data.week_performance.site_visits}
            </Text>
            <Text style={styles.performanceLabel}>Cek Lokasi</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValuePurple}>
              {data.week_performance.closings}
            </Text>
            <Text style={styles.performanceLabel}>Closing</Text>
          </View>
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
        {data.recent_activities.map((activity) => (
          <View key={activity.id} style={styles.activityCard}>
            <View
              style={[
                styles.activityIcon,
                { backgroundColor: `${activity.status_color}20` },
              ]}
            >
              <Text style={styles.activityEmoji}>
                {activity.type === 'closing' ? '✓' : '+'}
              </Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDescription}>
                {activity.description} • {activity.time_ago}
              </Text>
            </View>
            <View
              style={[
                styles.activityBadge,
                { backgroundColor: `${activity.status_color}20` },
              ]}
            >
              <Text
                style={[styles.activityBadgeText, { color: activity.status_color }]}
              >
                {activity.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 80,
    backgroundColor: '#FFFFFF',
  },
  welcomeSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  widgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  widgetCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  widgetTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  widgetCenter: {
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetValueBlue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  widgetValueGreen: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  widgetValuePurple: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  widgetSubtext: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFillBlue: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressFillGreen: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressFillPurple: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  statusList: {
    marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusName: {
    fontSize: 12,
    color: '#374151',
  },
  statusTotal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  actionIconBlue: {
    width: 48,
    height: 48,
    backgroundColor: '#DBEAFE',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIconGreen: {
    width: 48,
    height: 48,
    backgroundColor: '#D1FAE5',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  scheduleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleLeft: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  scheduleTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  scheduleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  scheduleBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  performanceCard: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceValueBlue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  performanceValueGreen: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  performanceValuePurple: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  performanceLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  activityDescription: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  activityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activityBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default DashboardWidgets;