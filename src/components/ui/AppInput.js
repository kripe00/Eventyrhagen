import React from 'react';
import { View, Text, TextInput, StyleSheet, useColorScheme } from 'react-native';

const Colors = {
  light: { inputBg: '#f9fafb', text: '#1f2937', borderColor: '#e5e7eb', placeholder: '#6b7280' },
  dark: { inputBg: '#374151', text: '#f3f4f6', borderColor: '#4b5563', placeholder: '#9ca3af' }
};

export const AppInput = ({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry, autoCapitalize, multiline, style }) => {
  const scheme = useColorScheme();
  const theme = Colors[scheme] || Colors.light;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor: theme.inputBg, 
            color: theme.text, 
            borderColor: theme.borderColor 
          },
          multiline && { height: 100, textAlignVertical: 'top' }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
});