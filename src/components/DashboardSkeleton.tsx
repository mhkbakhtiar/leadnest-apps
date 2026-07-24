import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import SkeletonBox from './SkeletonBox';

const { width } = Dimensions.get('window');

export const DashboardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header skeleton */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.profileRow}>
            <SkeletonBox width={48} height={48} borderRadius={24} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <View style={{ marginLeft: 12 }}>
              <SkeletonBox width={120} height={16} style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 6 }} />
              <SkeletonBox width={90} height={12} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
            </View>
          </View>
          <SkeletonBox width={40} height={40} borderRadius={20} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
        </View>

        {/* Quick stats skeleton */}
        {/* <View style={styles.quickStatsRow}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.quickStatItem}>
              <SkeletonBox width={40} height={20} style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 4 }} />
              <SkeletonBox width={60} height={10} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
            </View>
          ))}
        </View> */}

        {/* Target cards skeleton */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12, marginTop: 4 }}>
          {[1, 2, 3].map((i) => (
            <SkeletonBox
              key={i}
              width={width * 0.7}
              height={170}
              borderRadius={16}
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {/* Stats grid skeleton */}
        <SkeletonBox width={160} height={18} style={{ marginBottom: 12 }} />
        <View style={styles.statsGrid}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.statCard}>
              <SkeletonBox width={48} height={48} borderRadius={24} style={{ marginBottom: 8 }} />
              <SkeletonBox width={40} height={20} style={{ marginBottom: 4 }} />
              <SkeletonBox width={60} height={12} />
            </View>
          ))}
        </View>

        {/* Status list skeleton */}
        <SkeletonBox width={140} height={18} style={{ marginTop: 20, marginBottom: 12 }} />
        <View style={styles.card}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.listRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <SkeletonBox width={12} height={12} borderRadius={6} style={{ marginRight: 12 }} />
                <SkeletonBox width={80} height={14} />
              </View>
              <SkeletonBox width={30} height={16} />
            </View>
          ))}
        </View>

        {/* Card list skeleton (mitra/followup/dst) */}
        <SkeletonBox width={180} height={18} style={{ marginTop: 20, marginBottom: 12 }} />
        <View style={styles.card}>
          {[1, 2].map((i) => (
            <View key={i} style={styles.mitraRow}>
              <SkeletonBox width={100} height={16} style={{ marginBottom: 10 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {[1, 2, 3, 4].map((j) => (
                  <SkeletonBox key={j} width={40} height={24} borderRadius={4} />
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#165044', paddingTop: 16, paddingBottom: 24 },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 16,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  quickStatsRow: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, paddingVertical: 14,
  },
  quickStatItem: { flex: 1, alignItems: 'center' },
  content: { padding: 16, marginTop: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    flex: 1, minWidth: '30%', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, alignItems: 'center', gap: 6,
  },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 },
  listRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  mitraRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
});

export default DashboardSkeleton;