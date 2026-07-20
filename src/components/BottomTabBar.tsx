import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface TabItem {
  key: string;
  label: string;
  icon: string;
}

interface BottomTabBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const TabIcon = ({ name, active }: { name: string; active: boolean }) => {
  const color = active ? '#165044' : '#999';
  const size = 24;

  switch (name) {
    case 'home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M9 21V12H15V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'konsumen':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" />
          <Path d="M2 21C2 17.134 5.13401 14 9 14C12.866 14 16 17.134 16 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Circle cx="17" cy="9" r="3" stroke={color} strokeWidth="2" />
          <Path d="M22 21C22 18.2386 19.7614 16 17 16C16.3128 16 15.6595 16.1362 15.0625 16.3843" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );
    case 'jadwal':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
          <Path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Path d="M8 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Path d="M16 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );
    case 'report':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M3 3V18C3 19.6569 4.34315 21 6 21H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Path d="M7 14L10.5 10.5L13.5 13.5L20 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M16 7H20V11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'profile':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="8" r="5" stroke={color} strokeWidth="2" />
          <Path d="M3 21C3 16.5817 6.58172 13 11 13H13C17.4183 13 21 16.5817 21 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );
    // ✅ Tambah icon kavling
    case 'kavling':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <Rect x="9" y="15" width="6" height="6" stroke={color} strokeWidth="2" />
        </Svg>
      );
    default:
      return null;
  }
};

// ✅ Tambah Kavling di tabs
const tabs: TabItem[] = [
  { key: 'Home',     label: 'Home',     icon: 'home' },
  { key: 'Konsumen', label: 'Konsumen', icon: 'konsumen' },
  { key: 'Kavling',  label: 'Kavling',  icon: 'kavling' },
  { key: 'Jadwal',   label: 'Jadwal',   icon: 'jadwal' },
  { key: 'Report',   label: 'Report',   icon: 'report' },
  { key: 'Profile',  label: 'Profile',  icon: 'profile' },
];

const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabPress }) => {
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              onPress={() => onTabPress(tab.key)}
              activeOpacity={0.7}>
              <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                <TabIcon name={tab.icon} active={isActive} />
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconContainerActive: {
    backgroundColor: '#e8f5f2',
    borderRadius: 20,
  },
  label: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    fontWeight: '500',
  },
  labelActive: {
    color: '#165044',
    fontWeight: '600',
  },
});

export default BottomTabBar;