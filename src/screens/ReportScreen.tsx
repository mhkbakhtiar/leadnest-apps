import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart } from 'react-native-chart-kit';
import reportService, { DashboardReport } from '../services/reportService';

const { width } = Dimensions.get('window');
const chartWidth = width - 32;

const ReportScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardReport | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await reportService.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e3e3e3',
      strokeWidth: 1,
    },
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { konsumen, followups } = dashboardData;

  // Prepare Konsumen Pie Chart Data
  const konsumenStatusData = [
    { name: 'Cold', count: konsumen.by_latest_status.cold, color: '#9E9E9E' },
    { name: 'Warm', count: konsumen.by_latest_status.warm, color: '#FF9800' },
    { name: 'Hot', count: konsumen.by_latest_status.hot, color: '#F44336' },
    { name: 'Closing', count: konsumen.by_latest_status.closing, color: '#4CAF50' },
    { name: 'Cancel', count: konsumen.by_latest_status.cancel, color: '#000000' },
  ];

  const konsumenPieData = konsumenStatusData
    .filter(item => item.count > 0)
    .map(item => ({
      name: item.name,
      population: item.count,
      color: item.color,
      legendFontColor: '#333',
      legendFontSize: 12,
    }));

  // Prepare Followup Bar Chart Data
  const followupStatusData = [
    { name: 'Cold', count: followups.by_status.cold },
    { name: 'Warm', count: followups.by_status.warm },
    { name: 'Hot', count: followups.by_status.hot },
    { name: 'Closing', count: followups.by_status.closing },
    { name: 'Cancel', count: followups.by_status.cancel },
  ];

  const followupBarData = {
    labels: followupStatusData.map(item => item.name),
    datasets: [
      {
        data: followupStatusData.map(item => Math.max(item.count, 0)),
      },
    ],
  };

  // Status Distribution Data
  const total = konsumen.total;
  const statusStats = [
    {
      label: 'Cold',
      count: konsumen.by_latest_status.cold,
      percentage: total > 0 ? ((konsumen.by_latest_status.cold / total) * 100).toFixed(1) : '0',
      color: '#9E9E9E',
    },
    {
      label: 'Warm',
      count: konsumen.by_latest_status.warm,
      percentage: total > 0 ? ((konsumen.by_latest_status.warm / total) * 100).toFixed(1) : '0',
      color: '#FF9800',
    },
    {
      label: 'Hot',
      count: konsumen.by_latest_status.hot,
      percentage: total > 0 ? ((konsumen.by_latest_status.hot / total) * 100).toFixed(1) : '0',
      color: '#F44336',
    },
    {
      label: 'Closing',
      count: konsumen.by_latest_status.closing,
      percentage: total > 0 ? ((konsumen.by_latest_status.closing / total) * 100).toFixed(1) : '0',
      color: '#4CAF50',
    },
    {
      label: 'Cancel',
      count: konsumen.by_latest_status.cancel,
      percentage: total > 0 ? ((konsumen.by_latest_status.cancel / total) * 100).toFixed(1) : '0',
      color: '#000000',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <Text style={styles.headerSubtitle}>Performance Overview</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.content}>
          {/* Konsumen Summary */}
          <Text style={styles.sectionTitle}>Konsumen Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{konsumen.total}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>This Month</Text>
              <Text style={styles.statValue}>{konsumen.this_month}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Growth</Text>
              <Text style={[styles.statValue, { color: konsumen.growth >= 0 ? '#4CAF50' : '#F44336' }]}>
                {konsumen.growth > 0 ? '+' : ''}{konsumen.growth}%
              </Text>
            </View>
          </View>

          {/* Konsumen by Status - Pie Chart */}
          <Text style={styles.sectionTitle}>Konsumen by Status</Text>
          {konsumenPieData.length > 0 ? (
            <View style={styles.chartContainer}>
              <PieChart
                data={konsumenPieData}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          ) : (
            <View style={styles.chartContainer}>
              <Text style={styles.noDataText}>No data available</Text>
            </View>
          )}

          {/* Status List */}
          <View style={styles.statusList}>
            {konsumenStatusData.map((item, index) => (
              <View key={index} style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: item.color }]} />
                <Text style={styles.statusLabel}>{item.name}</Text>
                <Text style={styles.statusValue}>{item.count}</Text>
              </View>
            ))}
          </View>

          {/* Followup Summary */}
          <Text style={styles.sectionTitle}>Followup Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{followups.total}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>This Month</Text>
              <Text style={styles.statValue}>{followups.this_month}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Upcoming</Text>
              <Text style={styles.statValue}>{followups.upcoming}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>📅 Upcoming Visits: {followups.upcoming_visits}</Text>
          </View>

          {/* Followups by Status - Bar Chart */}
          <Text style={styles.sectionTitle}>Followups by Status</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={followupBarData}
              width={chartWidth}
              height={220}
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              fromZero
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=""
              style={styles.chart}
            />
          </View>

          {/* Status Distribution with Progress Bars */}
          <Text style={styles.sectionTitle}>Status Distribution</Text>
          {statusStats.map((item, index) => (
            <View key={index} style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{item.label}</Text>
                <Text style={styles.progressCount}>{item.count}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${item.percentage}%` as any,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressPercentage}>{item.percentage}%</Text>
            </View>
          ))}

          {/* Total Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Leads</Text>
            <Text style={styles.summaryValue}>{konsumen.total}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  chartContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
  statusList: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
  progressCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  progressCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 8,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000',
  },
});

export default ReportScreen;