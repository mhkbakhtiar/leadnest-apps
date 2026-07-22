import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { authService } from './src/services/authService';
import notificationService from './src/services/notificationService';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Setup notifikasi begitu user diketahui sudah login (baik dari cek awal maupun habis login manual)
  useEffect(() => {
    if (!isLoggedIn) return;

    let unsubscribeForeground: (() => void) | undefined;
    let unsubscribeTokenRefresh: (() => void) | undefined;

    const setupNotifications = async () => {
      await notificationService.registerToken();

      unsubscribeForeground = notificationService.setupForegroundListener(
        (title, body) => {
          console.log('Notif masuk:', title, body);
        }
      );

      notificationService.setupBackgroundOpenListener((data) => {
        console.log('Data notif saat dibuka:', data);
        // TODO: navigasi ke screen tertentu sesuai data, kalau perlu
      });

      unsubscribeTokenRefresh = notificationService.setupTokenRefreshListener();
    };

    setupNotifications();

    return () => {
      unsubscribeForeground?.();
      unsubscribeTokenRefresh?.();
    };
  }, [isLoggedIn]);

  const checkLoginStatus = async () => {
    try {
      const loggedIn = await authService.isAuthenticated();
      setIsLoggedIn(loggedIn);
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#165044" />
        <SplashScreen onFinish={handleSplashFinish} />
      </SafeAreaProvider>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#165044" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isLoggedIn ? 'Main' : 'Login'}
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={MainTabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default App;