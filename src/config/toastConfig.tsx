import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';

const CustomToast = ({
  text1,
  text2,
  backgroundColor,
  borderColor,
}: BaseToastProps & { backgroundColor: string; borderColor: string }) => (
  <View style={[styles.container, { backgroundColor, borderLeftColor: borderColor }]}>
    <View style={styles.textContainer}>
      {text1 && <Text style={styles.text1}>{text1}</Text>}
      {text2 && <Text style={styles.text2}>{text2}</Text>}
    </View>
  </View>
);

export const toastConfig = {
  success: (props: BaseToastProps) => (
    <CustomToast {...props} backgroundColor="#FFFFFF" borderColor="#165044" />
  ),
  error: (props: BaseToastProps) => (
    <CustomToast {...props} backgroundColor="#FFFFFF" borderColor="#EF4444" />
  ),
  info: (props: BaseToastProps) => (
    <CustomToast {...props} backgroundColor="#FFFFFF" borderColor="#3B82F6" />
  ),
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    borderRadius: 12,
    borderLeftWidth: 5,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  text2: {
    fontSize: 13,
    color: '#6B7280',
  },
});