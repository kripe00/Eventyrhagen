import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { useState } from 'react';
import {
  ActivityIndicator, Alert,
  Keyboard,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// egne imports
import { auth, db } from '../config/firebaseconfig';
import { useAuth } from '../context/Authcontext';

const DismissKeyboard = ({ children }) => {
  if (Platform.OS === 'web') return children; 
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {children}
    </TouchableWithoutFeedback>
  );
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const { login } = useAuth();

  const handleAuthAction = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if(!cleanEmail || !password) {
        const msg = "Vennligst fyll ut både e-post og passord";
        Platform.OS === 'web' ? alert(msg) : Alert.alert("Feil", msg);
        return;
    }

    setLoading(true);
    try {
      if (isLoginMode) {
      
        await login(cleanEmail, password);
      } else {
       
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const uid = userCredential.user.uid;

       
        const empQuery = query(collection(db, "employees"), where("email", "==", cleanEmail));
        const empSnapshot = await getDocs(empQuery);

        let role = 'parent';
        let department = null;

        if (!empSnapshot.empty) {
            
            const empData = empSnapshot.docs[0].data();
            role = 'employee';
            department = empData.department;
            console.log("Gjenkjente ansatt:", cleanEmail, "Avdeling:", department);
        } else {
            
            console.log("Registrerer som foresatt:", cleanEmail);
        }

      
        await setDoc(doc(db, "users", uid), {
            email: cleanEmail,
            role: role,
            department: department, 
            createdAt: new Date()
        });

        const msg = role === 'employee' 
            ? "Ansatt-konto gjenkjent! Du blir nå logget inn." 
            : "Bruker opprettet. Du blir nå logget inn.";
            
        Platform.OS === 'web' ? alert(msg) : Alert.alert("Velkommen!", msg);
      }
    } catch (error) {
      console.error("Auth Error:", error);
      let msg = "Noe gikk galt.";
      if (error.code === 'auth/email-already-in-use') msg = "Denne e-posten er allerede i bruk.";
      if (error.code === 'auth/invalid-email') msg = "Ugyldig e-postadresse.";
      if (error.code === 'auth/weak-password') msg = "Passordet må ha minst 6 tegn.";
      if (error.code === 'auth/invalid-credential') msg = "Feil brukernavn eller passord.";
      
      Platform.OS === 'web' ? alert(msg) : Alert.alert("Feil", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <DismissKeyboard>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              <Text style={styles.title}>Eventyrhagen</Text>
              <Text style={styles.subtitle}>{isLoginMode ? 'Logg inn for å fortsette' : 'Opprett ny brukerkonto'}</Text>
              
              <Text style={styles.label}>E-post</Text>
              <TextInput placeholder="din@epost.no" style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
              
              <Text style={styles.label}>Passord</Text>
              <TextInput placeholder="********" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

              <TouchableOpacity style={styles.button} onPress={handleAuthAction} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{isLoginMode ? 'Logg Inn' : 'Opprett Bruker'}</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.switchButton} onPress={() => setIsLoginMode(!isLoginMode)}>
                  <Text style={styles.switchText}>{isLoginMode ? 'Har du ikke bruker? Registrer deg' : 'Har du allerede bruker? Logg inn'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </DismissKeyboard>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#4f46e5' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#1f2937' },
  subtitle: { textAlign: 'center', color: '#6b7280', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginLeft: 4 },
  input: { backgroundColor: '#f3f4f6', padding: 16, borderRadius: 12, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  button: { backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  switchButton: { marginTop: 20, alignItems: 'center', padding: 10 },
  switchText: { color: '#4f46e5', fontWeight: '600' }
});