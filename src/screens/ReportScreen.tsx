import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const ReportScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Bulan Ini');

  const periods = ['Hari Ini', 'Minggu Ini', 'Bulan Ini', 'Tahun Ini'];

  // Dummy data - nanti bisa diganti dengan data real dari API
  const reportData = {
    totalRevenue: 15750000,
    totalTransactions: 48,
    totalCustomers: 32,
    avgTransaction: 328125,
  };

  const topProducts = [
    { name: 'Produk A', sales: 25, revenue: 7500000 },
    { name: 'Produk B', sales: 18, revenue: 5400000 },
    { name: 'Produk C', sales: 12, revenue: 2850000 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Laporan</Text>
        <Text style={styles.headerSubtitle}>Analisis performa bisnis Anda</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.periodText,
                    selectedPeriod === period && styles.periodTextActive,
                  ]}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>💰</Text>
            <Text style={styles.summaryLabel}>Total Pendapatan</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(reportData.totalRevenue)}
            </Text>
            <View style={styles.changeContainer}>
              <Text style={styles.changePositive}>↑ 12.5%</Text>
              <Text style={styles.changeText}>vs periode sebelumnya</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.miniCard, { backgroundColor: '#e3f2fd' }]}>
              <Text style={styles.miniIcon}>🛒</Text>
              <Text style={styles.miniValue}>{reportData.totalTransactions}</Text>
              <Text style={styles.miniLabel}>Transaksi</Text>
            </View>

            <View style={[styles.miniCard, { backgroundColor: '#f3e5f5' }]}>
              <Text style={styles.miniIcon}>👥</Text>
              <Text style={styles.miniValue}>{reportData.totalCustomers}</Text>
              <Text style={styles.miniLabel}>Konsumen</Text>
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: '#e8f5e9' }]}>
            <Text style={styles.summaryIcon}>📊</Text>
            <Text style={styles.summaryLabel}>Rata-rata Transaksi</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(reportData.avgTransaction)}
            </Text>
          </View>
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Produk Terlaris</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Lihat Semua ›</Text>
            </TouchableOpacity>
          </View>

          {topProducts.map((product, index) => (
            <View key={index} style={styles.productItem}>
              <View style={styles.productRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productSales}>{product.sales} terjual</Text>
              </View>
              <View style={styles.productRevenue}>
                <Text style={styles.productAmount}>
                  {formatCurrency(product.revenue)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Chart Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grafik Penjualan</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartIcon}>📈</Text>
            <Text style={styles.chartText}>Grafik akan ditampilkan di sini</Text>
            <Text style={styles.chartSubtext}>
              Gunakan library seperti react-native-chart-kit untuk visualisasi data
            </Text>
          </View>
        </View>

        {/* Export Section */}
        <View style={styles.exportSection}>
          <TouchableOpacity style={styles.exportButton} activeOpacity={0.8}>
            <Text style={styles.exportIcon}>📥</Text>
            <Text style={styles.exportText}>Export ke PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.exportButton} activeOpacity={0.8}>
            <Text style={styles.exportIcon}>📊</Text>
            <Text style={styles.exportText}>Export ke Excel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#312a7a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  periodContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  periodButtonActive: {
    backgroundColor: '#312a7a',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  periodTextActive: {
    color: '#fff',
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#312a7a',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changePositive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4caf50',
  },
  changeText: {
    fontSize: 12,
    color: '#999',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  miniCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  miniIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  miniValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#312a7a',
    marginBottom: 4,
  },
  miniLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#312a7a',
    fontWeight: '600',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0eef8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#312a7a',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  productSales: {
    fontSize: 12,
    color: '#666',
  },
  productRevenue: {
    alignItems: 'flex-end',
  },
  productAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#312a7a',
  },
  chartPlaceholder: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginTop: 12,
  },
  chartIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  chartText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  chartSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  exportSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  exportIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  exportText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#312a7a',
  },
  bottomSpace: {
    height: 20,
  },
});

export default ReportScreen;