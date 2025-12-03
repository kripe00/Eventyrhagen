import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Komponent for Barn og Ansatte
export const ListItem = ({ item, theme, onEdit, onDelete, type }) => (
  <View style={[styles.listItem, {backgroundColor: theme.card}]}>
    <View style={{flex: 1}}>
      <Text style={[styles.itemName, {color: theme.text}]}>
        {item.name} {item.allergy && <Text style={{color: '#dc2626', fontSize: 12}}> (Allergi)</Text>}
      </Text>
      <Text style={[styles.itemSub, {color: theme.subText}]}>{item.avdeling || item.department}</Text>
      {item.email && <Text style={[styles.itemDetail, {color: theme.subText}]}>{item.email}</Text>}
    </View>
    <View style={styles.actionIcons}>
      <TouchableOpacity onPress={() => onEdit(item, type)} style={{marginRight: 15}}>
        <Ionicons name="pencil" size={24} color="#4f46e5" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(type === 'child' ? 'children' : 'employees', item.id, item.name)}>
        <Ionicons name="trash-outline" size={24} color="#dc2626" />
      </TouchableOpacity>
    </View>
  </View>
);

// Komponent for Avdelinger
export const DepartmentItem = ({ item, theme, onEdit, onDelete, childrenList, employeeList }) => {
  const deptChildren = childrenList.filter(c => c.avdeling?.toLowerCase() === item.name.toLowerCase());
  const deptEmployees = employeeList.filter(e => e.department?.toLowerCase() === item.name.toLowerCase());
  
  return (
    <View style={[styles.deptCard, {backgroundColor: theme.card, borderColor: theme.borderColor}]}>
      <View style={[styles.deptHeader, {borderBottomColor: theme.borderColor}]}>
          <Text style={styles.deptTitle}>{item.name}</Text>
          <View style={styles.actionIcons}>
              <TouchableOpacity onPress={() => onEdit(item, 'department')} style={{marginRight: 15}}>
                <Ionicons name="pencil" size={20} color="#4f46e5" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete('departments', item.id, item.name)}>
                <Ionicons name="trash-outline" size={20} color="#dc2626" />
              </TouchableOpacity>
          </View>
      </View>
      <Text style={styles.sectionHeaderSmall}>Ansatte ({deptEmployees.length})</Text>
      {deptEmployees.length > 0 ? deptEmployees.map(e => <Text key={e.id} style={[styles.subItem, {color: theme.text}]}>• {e.name}</Text>) : <Text style={styles.emptySub}>Ingen ansatte</Text>}
      <Text style={[styles.sectionHeaderSmall, {marginTop: 10}]}>Barn ({deptChildren.length})</Text>
      {deptChildren.length > 0 ? deptChildren.map(c => <Text key={c.id} style={[styles.subItem, {color: theme.text}]}>• {c.name}</Text>) : <Text style={styles.emptySub}>Ingen barn</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, elevation: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold' },
  itemSub: { fontSize: 12, marginBottom: 4 },
  itemDetail: { fontSize: 12 },
  actionIcons: { flexDirection: 'row' },
  deptCard: { padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1 },
  deptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, paddingBottom: 8 },
  deptTitle: { fontSize: 18, fontWeight: 'bold', color: '#7c3aed' },
  sectionHeaderSmall: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 },
  subItem: { fontSize: 14, marginLeft: 8, marginBottom: 2 },
  emptySub: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic', marginLeft: 8 },
});