import React from 'react';
import { 
    View, Text, TouchableOpacity, StyleSheet, 
    Platform, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { AppInput } from '../ui/AppInput';  
import { AppButton } from '../ui/AppButton';

const styles = StyleSheet.create({
  card: { 
    borderRadius: 20, 
    padding: 24, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    elevation: 5 
  },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', marginBottom: 24 },
  switchButton: { marginTop: 20, alignItems: 'center', padding: 10 },
  switchText: { fontWeight: '600' }
});

export const DismissKeyboard = ({ children }) => {
  if (Platform.OS === 'web') return children; 
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {children}
    </TouchableWithoutFeedback>
  );
};

export const LoginCard = ({ 
    theme, email, setEmail, password, setPassword, 
    loading, isLoginMode, setIsLoginMode, onAuthAction 
}) => {
    return (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.title, { color: theme.text }]}>Eventyrhagen</Text>
            <Text style={[styles.subtitle, { color: theme.subText }]}>
                {isLoginMode ? 'Logg inn for å fortsette' : 'Opprett ny brukerkonto'}
            </Text>
            
            <AppInput 
                label="E-post"
                placeholder="din@epost.no"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            
            <AppInput 
                label="Passord"
                placeholder="********"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <AppButton 
                title={isLoginMode ? 'Logg Inn' : 'Opprett Bruker'}
                onPress={onAuthAction}
                loading={loading}
                style={{ marginTop: 10 }} 
            />

            <TouchableOpacity style={styles.switchButton} onPress={() => setIsLoginMode(!isLoginMode)}>
                <Text style={[styles.switchText, { color: theme.button }]}>
                    {isLoginMode ? 'Har du ikke bruker? Registrer deg' : 'Har du allerede bruker? Logg inn'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};