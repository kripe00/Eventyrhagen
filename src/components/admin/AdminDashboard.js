import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AdminDashboard({ stats, theme }) {
  return (
    <ScrollView contentContainerStyle={{paddingBottom: 40}}>
      <Text style={[styles.sectionHeader, {color: theme.text}]}>Nøkkeltall</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, {backgroundColor: theme.statBlue}]}>
          <Text style={[styles.statNumber, {color: theme.statBlueText}]}>{stats.totalChildren}</Text>
          <Text style={[styles.statLabel, {color: theme.text}]}>Barn totalt</Text>
        </View>
        
        <View style={[styles.statCard, {backgroundColor: theme.statGreen}]}>
          <Text style={[styles.statNumber, {color: theme.statGreenText}]}>{stats.presentChildren}</Text>
          <Text style={[styles.statLabel, {color: theme.text}]}>Til stede</Text>
        </View>
        
        <View style={[styles.statCard, {backgroundColor: theme.statRed}]}>
          <Text style={[styles.statNumber, {color: theme.statRedText}]}>{stats.allergyChildren}</Text>
          <Text style={[styles.statLabel, {color: theme.text}]}>Med Allergi</Text>
        </View>
        
        <View style={[styles.statCard, {backgroundColor: theme.statOrange}]}>
          <Text style={[styles.statNumber, {color: theme.statOrangeText}]}>{stats.totalEmployees}</Text>
          <Text style={[styles.statLabel, {color: theme.text}]}>Ansatte</Text>
        </View>
      </View>

      <Text style={[styles.sectionHeader, {marginTop: 20, color: theme.text}]}>Fordeling per avdeling</Text>
      {stats.deptStats.map((dept, index) => (
        <View key={index} style={[styles.deptStatRow, {backgroundColor: theme.card}]}>
          <Text style={[styles.deptStatName, {color: theme.text}]}>{dept.name}</Text>
          <View style={[styles.deptStatBadge, {backgroundColor: theme.linkedItem}]}>
            <Text style={[styles.deptStatCount, {color: theme.subText}]}>{dept.count} barn</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', padding: 20, borderRadius: 16, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  statNumber: { fontSize: 32, fontWeight: 'bold', marginBottom: 5 },
  statLabel: { fontSize: 14, fontWeight: '500' },
  deptStatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, elevation: 1 },
  deptStatName: { fontSize: 16, fontWeight: '600' },
  deptStatBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  deptStatCount: { fontSize: 14, fontWeight: 'bold' },
});