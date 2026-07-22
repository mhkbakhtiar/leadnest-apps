import React, { useState, useEffect } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import notificationService from '../services/notificationService';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
} from 'react-native';
import { authService } from '../services/authService';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

// ✅ PERBAIKAN 1: Tambahkan export
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

// ✅ PERBAIKAN 2: Gunakan type alias yang benar
type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    // Configure Google Sign In
    GoogleSignin.configure({
      webClientId: '154079047174-vjh742r8k65p8802ggrucjftjp58kl8f.apps.googleusercontent.com',
      offlineAccess: true, 
      forceCodeForRefreshToken: true,
    });
    
    console.log('Google SignIn configured');
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      
      console.log('🔵 Starting Google Sign In...');
      
      // Check Play Services (Android only)
      if (Platform.OS === 'android') {
        const hasPlayServices = await GoogleSignin.hasPlayServices({ 
          showPlayServicesUpdateDialog: true 
        });
        console.log('✅ Play Services available:', hasPlayServices);
      }
      
      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();

      // Cek struktur data yang sebenarnya
      const user = (userInfo as any).data.user;
      
      if (!user || !user.email) {
        console.error('❌ Invalid user data structure:', userInfo);
        showErrorToast('Failed to retrieve user data from Google');
        return;
      }

      // Extract data dari Google
      const googleData = {
        email: user.email,
        name: user.name || user.givenName || user.displayName || 'User',
        google_id: user.id,
        avatar: user.photo || null,
      };


      // Kirim data ke backend untuk cek email
      const response = await authService.googleLogin(googleData);

      if (response.success) {
        // setelah login sukses, sebelum/sesudah navigasi
        await notificationService.registerToken();

        navigation.replace('Main');
      } else {
        // Email tidak terdaftar
        Alert.alert(
          'Email Tidak Terdaftar', 
          response.message || 'Email Anda belum terdaftar. Silahkan hubungi admin untuk registrasi.'
        );
        
        // Sign out dari Google setelah gagal
        await GoogleSignin.signOut();
        console.log('🔴 User signed out from Google');
      }
    } catch (error: any) {
      console.error('❌ Google Sign In Error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', JSON.stringify(error, null, 2));
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('ℹ️ User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Info', 'Sign in sedang dalam proses');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showErrorToast('Play services tidak tersedia atau perlu diupdate');
      } else if (error.code === '12501') {
        console.log('ℹ️ Error 12501: User cancelled or configuration issue');
        Alert.alert(
          'Login Cancelled',
          'Google Sign In dibatalkan atau ada masalah konfigurasi'
        );
      } else if (error.code === 'DEVELOPER_ERROR' || error.code === '10') {
        console.error('🔴 DEVELOPER_ERROR Details:');
        console.error('- Make sure SHA-1 is registered in Google Cloud Console');
        console.error('- Make sure google-services.json is up to date');
        console.error('- Make sure webClientId is correct');
        console.error('- Current webClientId: 154079047174-vjh742r8k65p8802ggrucjftjp58kl8f.apps.googleusercontent.com');
        
        Alert.alert(
          'Configuration Error', 
          'Google Sign In belum dikonfigurasi dengan benar.\n\n' +
          'Kemungkinan masalah:\n' +
          '• SHA-1 certificate belum terdaftar\n' +
          '• google-services.json outdated\n' +
          '• Web Client ID tidak sesuai\n\n' +
          'Error: ' + error.message
        );
      } else {
        Alert.alert(
          'Error', 
          'Terjadi kesalahan saat login dengan Google: ' + 
          (error.message || 'Unknown error') + 
          '\n\nError code: ' + (error.code || 'N/A')
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          <View style={styles.content}>
            {/* Logo/Brand Section */}
            <View style={styles.brandSection}>
              <View style={styles.logoCircle}>
                <Image
                  source={require('../assets/leadnest-logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <Text style={styles.welcomeText}>Manage your leads efficiently</Text>
              <Text style={styles.tagline}>Track, organize, and nurture every lead to help you close deals faster.</Text>

              {/* Google Sign In Button */}
              <TouchableOpacity
                style={[styles.googleButton, googleLoading && styles.googleButtonDisabled]}
                onPress={handleGoogleLogin}
                disabled={loading || googleLoading}>
                {googleLoading ? (
                  <ActivityIndicator color="#312a7a" />
                ) : (
                  <>
                    <Image
                      source={require('../assets/google.png')}
                      style={styles.googleIcon}
                    />
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity 
                  onPress={() => Alert.alert('Info', 'Silahkan hubungi admin untuk registrasi')}
                  disabled={loading || googleLoading}>
                  <Text style={styles.signupText}>Contact Admin</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logo: {
    width: width * 0.6,
    height: height * 0.3,
    maxWidth: 80,
    maxHeight: 80,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  brandName: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tagline: {
    width: '70%',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 15,
    marginBottom: 32,
    fontFamily: 'Poppins-Regular',
    color: '#888',
  },
  formSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f8f8',
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular',
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#312a7a',
  },
  loginButton: {
    backgroundColor: '#312a7a',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#312a7a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#888',
  },
  googleButton: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  signupText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#312a7a',
  },
});

export default LoginScreen;