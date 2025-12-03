import React from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Felles stiler for skjemaene
const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 10 },
  input: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 15, fontSize: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 8, marginBottom: 15 },
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 10, marginBottom: 10 },
  pillActive: { backgroundColor: '#e0e7ff', borderColor: '#4f46e5' },
  pillTextActive: { color: '#4f46e5', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  addButtonSmall: { backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', width: 50, borderRadius: 8, marginLeft: 10 },
  emailTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
});

// --- BARN SKJEMA ---
export const ChildForm = ({ 
    theme, name, setName, dept, setDept, allergy, setAllergy, 
    emailInput, setEmailInput, emails, addEmail, removeEmail, 
    deptList, onSubmit, loading 
}) => (
  <View>
    <Text style={[styles.label, {color: theme.text}]}>Fullt Navn</Text>
    <TextInput style={[styles.input, {backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor}]} value={name} onChangeText={setName} placeholder="F.eks. Ola Nordmann" placeholderTextColor={theme.subText} />
    
    <Text style={[styles.label, {color: theme.text}]}>Avdeling</Text>
    <View style={styles.pillContainer}>
      {deptList.map(d => (
          <TouchableOpacity key={d.id} onPress={() => setDept(d.name)} style={[styles.pill, dept === d.name ? styles.pillActive : {backgroundColor: theme.card, borderColor: theme.borderColor}]}>
              <Text style={dept === d.name ? styles.pillTextActive : {color: theme.text}}>{d.name}</Text>
          </TouchableOpacity>
      ))}
    </View>

    <View style={[styles.switchRow, {backgroundColor: theme.card}]}>
        <Text style={[styles.label, {marginBottom: 0, color: theme.text}]}>Har Allergi?</Text>
        <Switch value={allergy} onValueChange={setAllergy} trackColor={{false: "#767577", true: "#ef4444"}} />
    </View>

    <Text style={[styles.label, {color: theme.text}]}>Foresattes E-poster</Text>
    <View style={{flexDirection: 'row', marginBottom: 10}}>
        <TextInput style={[styles.input, {flex:1, marginBottom: 0, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor}]} value={emailInput} onChangeText={setEmailInput} placeholder="ola@email.com" placeholderTextColor={theme.subText} autoCapitalize="none" keyboardType="email-address" />
        <TouchableOpacity onPress={addEmail} style={styles.addButtonSmall}><Ionicons name="add" size={24} color="white" /></TouchableOpacity>
    </View>
    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        {emails.map((email, idx) => (
            <TouchableOpacity key={idx} onPress={() => removeEmail(email)} style={[styles.emailTag, {backgroundColor: theme.linkedItem}]}>
                <Text style={{color: theme.text, marginRight: 5}}>{email}</Text>
                <Ionicons name="close-circle" size={16} color={theme.subText} />
            </TouchableOpacity>
        ))}
    </View>

    <TouchableOpacity style={styles.saveButton} onPress={onSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Lagre Barn</Text>}
    </TouchableOpacity>
  </View>
);

// --- ANSATT SKJEMA ---
export const EmployeeForm = ({ 
    theme, name, setName, email, setEmail, phone, setPhone, 
    dept, setDept, deptList, onSubmit, loading 
}) => (
  <View>
    <Text style={[styles.label, {color: theme.text}]}>Fullt Navn</Text>
    <TextInput style={[styles.input, {backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor}]} value={name} onChangeText={setName} placeholder="Navn" placeholderTextColor={theme.subText} />
    
    <Text style={[styles.label, {color: theme.text}]}>E-post (Innlogging)</Text>
    <TextInput style={[styles.input, {backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor}]} value={email} onChangeText={setEmail} placeholder="ansatt@barnehage.no" autoCapitalize="none" keyboardType="email-address" placeholderTextColor={theme.subText} />

    <Text style={[styles.label, {color: theme.text}]}>Telefon</Text>
    <TextInput style={[styles.input, {backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor}]} value={phone} onChangeText={setPhone} placeholder="12345678" keyboardType="phone-pad" placeholderTextColor={theme.subText} />

    <Text style={[styles.label, {color: theme.text}]}>Avdeling</Text>
    <View style={styles.pillContainer}>
      {deptList.map(d => (
          <TouchableOpacity key={d.id} onPress={() => setDept(d.name)} style={[styles.pill, dept === d.name ? styles.pillActive : {backgroundColor: theme.card, borderColor: theme.borderColor}]}>
              <Text style={dept === d.name ? styles.pillTextActive : {color: theme.text}}>{d.name}</Text>
          </TouchableOpacity>
      ))}
    </View>

    <TouchableOpacity style={styles.saveButton} onPress={onSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Lagre Ansatt</Text>}
    </TouchableOpacity>
  </View>
);

// --- AVDELING SKJEMA ---
export const DepartmentForm = ({ theme, name, setName, onSubmit, loading }) => (
  <View>
    <Text style={[styles.label, {color: theme.text}]}>Avdelingsnavn</Text>
    <TextInput style={[styles.input, {backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor}]} value={name} onChangeText={setName} placeholder="F.eks. Solstrålen" placeholderTextColor={theme.subText} />
    
    <TouchableOpacity style={styles.saveButton} onPress={onSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Lagre Avdeling</Text>}
    </TouchableOpacity>
  </View>
);