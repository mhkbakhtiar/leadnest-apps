import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardWidgets } from '../components/DashboardWidgets';
import dashboardService, { DashboardData } from '../services/dashboardService';

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getDashboardData();
      console.log(response, 'Dashboard Data');
      
      if (response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleKelolakonsumen = () => {
    navigation.navigate('Konsumen');
  };

  const handleInputFollowup = () => {
    navigation.navigate('InputFollowup');
  };

  const handleSchedulePress = (scheduleId: number) => {
    navigation.navigate('FollowupDetail', { id: scheduleId });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <DashboardWidgets
        data={dashboardData}
        onKelolakonsumen={handleKelolakonsumen}
        onInputFollowup={handleInputFollowup}
        onSchedulePress={handleSchedulePress}
      />
    </ScrollView>
  );
};

export default DashboardScreen;