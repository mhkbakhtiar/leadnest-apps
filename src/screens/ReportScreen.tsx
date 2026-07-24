import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import reportService, { DashboardReport } from '../services/reportService';
import ReportSkeleton from '../components/ReportSkeleton';


const { width } = Dimensions.get('window');
const chartWidth = width - 32;

const badgeColors: Record<string, { bg: string; text: string }> = {
  Hot: { bg: '#fee2e2', text: '#991b1b' },
  Warm: { bg: '#fef3c7', text: '#92400e' },
  Cold: { bg: '#dbeafe', text: '#1e40af' },
  Cancel: { bg: '#f3f4f6', text: '#374151' },
  Closing: { bg: '#d1fae5', text: '#065f46' },
};

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: '4' },
};

const ReportScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [report, setReport] = useState<DashboardReport | null>(null);

  useEffect(() => { loadReport(); }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await reportService.getDashboard();
      setReport(data);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReport();
    setRefreshing(false);
  };

  if (loading) {
    return <ReportSkeleton />;
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Data tidak tersedia</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { stats, segmentation, today_followups, recent_followups, charts_data } = report;
  const mitra_stats = ((report as any).mitra_stats ?? []) as Array<any>;

  const StatBadge = ({ name }: { name: string | null }) => {
    if (!name) return <Text style={{ color: '#9ca3af' }}>-</Text>;
    const c = badgeColors[name] || { bg: '#f3f4f6', text: '#374151' };
    return (
      <View style={[styles.badge, { backgroundColor: c.bg }]}>
        <Text style={[styles.badgeText, { color: c.text }]}>{name}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Laporan Saya</Text>
        <Text style={styles.headerSubtitle}>Analitik performa marketing pribadi Anda</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.content}>

          {/* Stat Cards */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
              <Text style={styles.statCardLabel}>Total Konsumen</Text>
              <Text style={styles.statCardValue}>{stats.total_konsumen}</Text>
              <Text style={styles.statCardSub}>+{stats.konsumen_7days} (7 hari)</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
              <Text style={styles.statCardLabel}>Total Closing</Text>
              <Text style={styles.statCardValue}>{stats.total_closing_alltime}</Text>
              <Text style={styles.statCardSub}>{stats.total_closing_month} (bulan ini)</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#8b5cf6' }]}>
              <Text style={styles.statCardLabel}>Total Follow-up</Text>
              <Text style={styles.statCardValue}>{stats.total_followup}</Text>
              <Text style={styles.statCardSub}>{stats.followup_7days} (7 hari)</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
              <Text style={styles.statCardLabel}>Conversion Rate</Text>
              <Text style={styles.statCardValue}>{stats.conversion_rate}%</Text>
              <Text style={styles.statCardSub}>{stats.konsumen_this_month} konsumen bulan ini</Text>
            </View>
          </View>

          {/* Trend Charts */}
          <Text style={styles.sectionTitle}>Konsumen Baru (6 Bulan)</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={{ labels: charts_data.konsumen_6months.labels, datasets: [{ data: charts_data.konsumen_6months.data }] }}
              width={chartWidth} height={200} chartConfig={chartConfig} bezier fromZero
            />
          </View>

          <Text style={styles.sectionTitle}>Closing (6 Bulan)</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={{ labels: charts_data.closing_6months.labels, datasets: [{ data: charts_data.closing_6months.data }] }}
              width={chartWidth} height={200} chartConfig={chartConfig} fromZero showValuesOnTopOfBars
              yAxisLabel="" yAxisSuffix=""
            />
          </View>

          <Text style={styles.sectionTitle}>Aktivitas Follow-up (6 Bulan)</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={{ labels: charts_data.followup_6months.labels, datasets: [{ data: charts_data.followup_6months.data }] }}
              width={chartWidth} height={200} chartConfig={chartConfig} bezier fromZero
            />
          </View>

          {/* Segmentasi Response */}
          {segmentation.by_response.has_data && (
            <>
              <Text style={styles.sectionTitle}>Segmentasi Response</Text>
              <View style={styles.chartContainer}>
                <PieChart
                  data={[
                    { name: 'Hot', population: segmentation.by_response.hot, color: '#ef4444', legendFontColor: '#333', legendFontSize: 12 },
                    { name: 'Warm', population: segmentation.by_response.warm, color: '#eab308', legendFontColor: '#333', legendFontSize: 12 },
                    { name: 'Cold', population: segmentation.by_response.cold, color: '#3b82f6', legendFontColor: '#333', legendFontSize: 12 },
                  ].filter(d => d.population > 0)}
                  width={chartWidth} height={200} chartConfig={chartConfig}
                  accessor="population" backgroundColor="transparent" paddingLeft="15" absolute
                />
              </View>
            </>
          )}

          {/* Status Distribution */}
          {segmentation.by_status.has_data && (
            <>
              <Text style={styles.sectionTitle}>Status Konsumen (Terkini)</Text>
              <View style={styles.card}>
                {segmentation.by_status.data.map((item: { name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; count: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; percent: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; color: any; }, i: React.Key | null | undefined) => (
                  <View key={i} style={styles.progressRow}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>{item.name}</Text>
                      <Text style={styles.progressCount}>{item.count} ({item.percent}%)</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${Math.max(0, Math.min(100, Number(item.percent) || 0))}%`,
                            backgroundColor: item.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Budget Segmentation */}
          {segmentation.by_budget.has_data && (
            <>
              <Text style={styles.sectionTitle}>Kesiapan Budget</Text>
              <View style={styles.card}>
                {segmentation.by_budget.data.map((item: { budget: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; percent: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, i: React.Key | null | undefined) => (
                  <View key={i} style={styles.listRow}>
                    <Text style={styles.listLabel}>{item.budget}</Text>
                    <Text style={styles.listValue}>{item.percent}%</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Sumber Konsumen */}
          {segmentation.by_source.has_data && (
            <>
              <Text style={styles.sectionTitle}>Sumber Konsumen</Text>
              <View style={styles.card}>
                {segmentation.by_source.data.map((item: { source: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; percent: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, i: React.Key | null | undefined) => (
                  <View key={i} style={styles.listRow}>
                    <Text style={styles.listLabel}>{item.source}</Text>
                    <Text style={styles.listValue}>{item.percent}%</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Metode Follow-up */}
          {segmentation.by_type.has_data && (
            <>
              <Text style={styles.sectionTitle}>Metode Follow-up</Text>
              <View style={styles.card}>
                {segmentation.by_type.data.map((item: { type: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; percent: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, i: React.Key | null | undefined) => (
                  <View key={i} style={styles.listRow}>
                    <Text style={styles.listLabel}>{item.type}</Text>
                    <Text style={styles.listValue}>{item.percent}%</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Performa per Proyek */}
          {mitra_stats.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Performa per Proyek</Text>
              {mitra_stats.map((m: { name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; total_konsumen: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; total_followup: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; total_closing: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; conversion_rate: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, i: React.Key | null | undefined) => (
                <View key={i} style={styles.card}>
                  <Text style={styles.mitraName}>{m.name}</Text>
                  <View style={styles.mitraStatsRow}>
                    <View style={styles.mitraStatItem}>
                      <Text style={styles.mitraStatLabel}>Konsumen</Text>
                      <Text style={styles.mitraStatValue}>{m.total_konsumen}</Text>
                    </View>
                    <View style={styles.mitraStatItem}>
                      <Text style={styles.mitraStatLabel}>Follow-up</Text>
                      <Text style={styles.mitraStatValue}>{m.total_followup}</Text>
                    </View>
                    <View style={styles.mitraStatItem}>
                      <Text style={styles.mitraStatLabel}>Closing</Text>
                      <Text style={[styles.mitraStatValue, { color: '#10b981' }]}>{m.total_closing}</Text>
                    </View>
                    <View style={styles.mitraStatItem}>
                      <Text style={styles.mitraStatLabel}>Conversion</Text>
                      <Text style={[styles.mitraStatValue, {
                        color: (Number(m.conversion_rate) || 0) >= 20 ? '#10b981' : (Number(m.conversion_rate) || 0) >= 10 ? '#eab308' : '#ef4444'
                      }]}>{m.conversion_rate ?? 0}%</Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Jadwal Hari Ini */}
          {today_followups.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Jadwal Follow-up Hari Ini ({today_followups.length})</Text>
              <View style={styles.card}>
                {today_followups.map((fu: { konsumen_name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; notes: any; status: string | null; }, i: React.Key | null | undefined) => (
                  <View key={i} style={styles.activityRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityName}>{fu.konsumen_name}</Text>
                      <Text style={styles.activityNotes} numberOfLines={1}>{fu.notes || '-'}</Text>
                    </View>
                    <StatBadge name={fu.status} />
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Aktivitas Terbaru */}
          {recent_followups.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Aktivitas Follow-up Terbaru</Text>
              <View style={styles.card}>
                {recent_followups.map((fu: { konsumen_name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; notes: any; followup_date: string | number | Date; status: string | null; }, i: React.Key | null | undefined) => (
                  <View key={i} style={styles.activityRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityName}>{fu.konsumen_name}</Text>
                      <Text style={styles.activityNotes} numberOfLines={1}>{fu.notes || '-'}</Text>
                      <Text style={styles.activityDate}>{new Date(fu.followup_date).toLocaleDateString('id-ID')}</Text>
                    </View>
                    <StatBadge name={fu.status} />
                  </View>
                ))}
              </View>
            </>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  header: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#000' },
  headerSubtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 12, marginTop: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: { borderRadius: 12, padding: 14, width: '48%' },
  statCardLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', fontWeight: '600' },
  statCardValue: { fontSize: 24, fontWeight: '700', color: '#fff', marginTop: 4 },
  statCardSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  chartContainer: { backgroundColor: '#FFF', borderRadius: 8, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0' },
  card: { backgroundColor: '#FFF', borderRadius: 8, padding: 16, borderWidth: 1, borderColor: '#E0E0E0' },
  progressRow: { marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 14, fontWeight: '600', color: '#000' },
  progressCount: { fontSize: 13, color: '#666' },
  progressBarContainer: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  listLabel: { fontSize: 13, color: '#374151' },
  listValue: { fontSize: 13, fontWeight: '600', color: '#000' },
  mitraName: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 10 },
  mitraStatsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  mitraStatItem: { alignItems: 'center', flex: 1 },
  mitraStatLabel: { fontSize: 10, color: '#9CA3AF', marginBottom: 2 },
  mitraStatValue: { fontSize: 14, fontWeight: '700', color: '#000' },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  activityName: { fontSize: 14, fontWeight: '600', color: '#000' },
  activityNotes: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  activityDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600' },
});

export default ReportScreen;