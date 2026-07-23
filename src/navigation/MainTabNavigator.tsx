import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardScreen from '../screens/DashboardScreen';
import KonsumenScreen from '../screens/KonsumenScreen';
import ReportScreen from '../screens/ReportScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import KavlingScreen from '../screens/KavlingScreen'; // ✅ tambah
import NotFoundScreen from '../screens/NotFoundScreen';
import BottomTabBar from '../components/BottomTabBar';

const { width } = Dimensions.get('window');

const MainTabNavigator = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState('Home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <DashboardScreen />;
      case 'Konsumen':
        return <KonsumenScreen navigation={navigation} />;
      case 'Report':
        return <ReportScreen />;
      case 'Profile':
        return <ProfileScreen />;
      case 'Jadwal':
        return <ScheduleScreen />;
      case 'Kavling':               // ✅ tambah
        return <KavlingScreen />;
      default:
        return <NotFoundScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  screenContainer: {
    flex: 1,
  },
});

export default MainTabNavigator;