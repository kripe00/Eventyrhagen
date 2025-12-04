import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppInput } from '../ui/AppInput';   // <--- NY
import { AppButton } from '../ui/AppButton'; // <--- NY

// Felles stiler (Mye mindre nå som input/knapp stiler er flyttet)
const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 10 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 8, marginBottom: 15 },
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 10, marginBottom: 10 },
  pillActive: { backgroundColor: '#e0e7ff', borderColor: '#4f46e5' },
  pillTextActive: { color: '#4f46e5', fontWeight: 'bold' },
  addButtonSmall: { backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', width: 50, height: 50, borderRadius: 12, marginLeft: 10, marginTop: 24 },
  emailTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
});

// --- BARN SKJEMA ---
export const ChildForm = ({ 
    theme, name, setName, dept, setDept, allergy, setAllergy, 
    emailInput, setEmailInput, emails, addEmail, removeEmail, 
    deptList, onSubmit, loading 
}) => (
  <View>
    <AppInput label="Fullt Navn" value={name} onChangeText={setName} placeholder="F.eks. Ola Nordmann" />
    
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

    <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
        <View style={{flex: 1}}>
            <AppInput label="Foresattes E-poster" value={emailInput} onChangeText={setEmailInput} placeholder="ola@email.com" keyboardType="email-address" autoCapitalize="none" />
        </View>
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

    <AppButton title="Lagre Barn" onPress={onSubmit} loading={loading} />
  </View>
);

// --- ANSATT SKJEMA ---
export const EmployeeForm = ({ 
    theme, name, setName, email, setEmail, phone, setPhone, 
    dept, setDept, deptList, onSubmit, loading 
}) => (
  <View>
    <AppInput label="Fullt Navn" value={name} onChangeText={setName} placeholder="Navn" />
    <AppInput label="E-post (Innlogging)" value={email} onChangeText={setEmail} placeholder="ansatt@barnehage.no" keyboardType="email-address" autoCapitalize="none" />
    <AppInput label="Telefon" value={phone} onChangeText={setPhone} placeholder="12345678" keyboardType="phone-pad" />

    <Text style={[styles.label, {color: theme.text}]}>Avdeling</Text>
    <View style={styles.pillContainer}>
      {deptList.map(d => (
          <TouchableOpacity key={d.id} onPress={() => setDept(d.name)} style={[styles.pill, dept === d.name ? styles.pillActive : {backgroundColor: theme.card, borderColor: theme.borderColor}]}>
              <Text style={dept === d.name ? styles.pillTextActive : {color: theme.text}}>{d.name}</Text>
          </TouchableOpacity>
      ))}
    </View>

    <AppButton title="Lagre Ansatt" onPress={onSubmit} loading={loading} />
  </View>
);

// --- AVDELING SKJEMA ---
export const DepartmentForm = ({ theme, name, setName, onSubmit, loading }) => (
  <View>
    <AppInput label="Avdelingsnavn" value={name} onChangeText={setName} placeholder="F.eks. Solstrålen" />
    <AppButton title="Lagre Avdeling" onPress={onSubmit} loading={loading} />
  </View>
);