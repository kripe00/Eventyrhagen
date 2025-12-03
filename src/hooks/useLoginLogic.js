import { useState } from 'react';
import { Alert, Platform, useColorScheme } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { auth, db } from '../config/firebaseconfig';
import { useAuth } from '../context/Authcontext';

// Farger for lys og mørk modus (kopiert fra din original)
const Colors = {
  light: {
    background: '#4f46e5',
    card: 'white',
    text: '#1f2937',
    subText: '#6b7280',
    inputBg: '#f3f4f6',
    inputBorder: '#e5e7eb',
    inputText: '#000',
    button: '#4f46e5',
    buttonText: 'white'
  },
  dark: {
    background: '#1e1b4b', 
    card: '#1f2937',       
    text: '#f3f4f6',      
    subText: '#9ca3af',    
    inputBg: '#374151',    
    inputBorder: '#4b5563',
    inputText: '#fff',     
    button: '#6366f1',     
    buttonText: 'white'
  }
};

export const useLoginLogic = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(true);

    const { login } = useAuth();

    // Hent system tema
    const systemTheme = useColorScheme(); 
    const theme = Colors[systemTheme] || Colors.light;

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

    return {
        email, setEmail,
        password, setPassword,
        loading,
        isLoginMode, setIsLoginMode,
        theme,
        handleAuthAction
    };
};