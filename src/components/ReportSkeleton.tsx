import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SkeletonBox from './SkeletonBox';

const { width } = Dimensions.get('window');
const chartWidth = width - 32;

export const ReportSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Stat cards */}
        <View style={styles.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBox key={i} width="48%" height={90} borderRadius={12} />
          ))}
        </View>

        {/* Charts */}
        {[1, 2, 3].map((i) => (
          <View key={i} style={{ marginTop: 16 }}>
            <SkeletonBox width={160} height={18} style={{ marginBottom: 12 }} />
            <SkeletonBox width={chartWidth} height={200} borderRadius={8} />
          </View>
        ))}

        {/* List card */}
        <View style={{ marginTop: 16 }}>
          <SkeletonBox width={180} height={18} style={{ marginBottom: 12 }} />
          <View style={styles.card}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.listRow}>
                <SkeletonBox width={100} height={14} />
                <SkeletonBox width={40} height={14} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { backgroundColor: '#FFF', borderRadius: 8, padding: 16 },
  listRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
});

export default ReportSkeleton;