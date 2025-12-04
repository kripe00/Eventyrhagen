import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

export const AppButton = ({ title, onPress, loading = false, variant = 'primary', style }) => {
  const isDestructive = variant === 'destructive';
  
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        isDestructive ? styles.destructive : styles.primary, 
        style
      ]} 
      onPress={onPress} 
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 50,
  },
  primary: {
    backgroundColor: '#4f46e5', // Din standard lilla/blå
  },
  destructive: {
    backgroundColor: '#ef4444', // Rød for sletting/avbryt
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});