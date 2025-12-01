import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ParentScreen() {
  return (
    <View style={styles.container}>
      <Text>Foreldre-skjerm (Kommer snart)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});