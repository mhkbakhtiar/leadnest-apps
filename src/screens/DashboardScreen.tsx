import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardWidgets } from '../components/DashboardWidgets';
import dashboardService, { DashboardData } from '../services/dashboardService';
import notificationApiService from '../services/notificationApiService';
import NotificationsModal from './NotificationsModal';

type RootStackParamList = {
  Konsumen: undefined;
  InputFollowup: undefined;
  FollowupDetail: { id: number };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifModalVisible, setNotifModalVisible] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchUnreadCount();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getDashboardData();
      if (response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationApiService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardData(), fetchUnreadCount()]);
    setRefreshing(false);
  };

  const handleKelolakonsumen = () => {
    navigation.navigate('Konsumen');
  };

  const handleSchedulePress = (scheduleId: number) => {
    navigation.navigate('FollowupDetail', { id: scheduleId });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#165044" />
      </View>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <DashboardWidgets
          data={dashboardData}
          unreadNotifCount={unreadCount}
          onKonsumenPress={handleKelolakonsumen}
          onSchedulePress={handleSchedulePress}
          onBellPress={() => setNotifModalVisible(true)}
        />
      </ScrollView>

      <NotificationsModal
        visible={notifModalVisible}
        onClose={() => setNotifModalVisible(false)}
        onUnreadCountChange={setUnreadCount}
      />
    </>
  );
};

export default DashboardScreen;