import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

function NotFoundScreen() {

  return (
    <View style={styles.container}>
      {/* Animated 404 */}
      <View style={styles.numberContainer}>
        <Text style={styles.number}>4</Text>
        <View style={styles.middleCircle}>
          <View style={styles.innerCircle}>
            <Text style={styles.questionMark}>?</Text>
          </View>
        </View>
        <Text style={styles.number}>4</Text>
      </View>

      {/* Message */}
      <View style={styles.messageContainer}>
        <Text style={styles.title}>Halaman Tidak Ditemukan</Text>
        <Text style={styles.subtitle}>
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </Text>
      </View>

      {/* Decorative elements */}
      <View style={styles.floatingDot1} />
      <View style={styles.floatingDot2} />
      <View style={styles.floatingDot3} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  numberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  number: {
    fontSize: 120,
    fontWeight: '800',
    color: '#3B82F6',
    textShadowColor: 'rgba(59, 130, 246, 0.1)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  middleCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 4,
    borderColor: '#3B82F6',
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionMark: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 48,
    maxWidth: width - 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  // Decorative floating dots
  floatingDot1: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    top: '10%',
    left: '-10%',
    opacity: 0.5,
  },
  floatingDot2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DBEAFE',
    bottom: '15%',
    right: '-15%',
    opacity: 0.3,
  },
  floatingDot3: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#93C5FD',
    top: '25%',
    right: '10%',
    opacity: 0.4,
  },
});

export default NotFoundScreen;