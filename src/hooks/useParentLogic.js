import { useState, useEffect } from 'react';
import { Alert, useColorScheme } from 'react-native';
import { collection, query, where, onSnapshot, orderBy, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebaseconfig';
import { useAuth } from '../context/Authcontext';

// Fargepalett
const Colors = {
  light: {
    background: '#f3f4f6',
    card: 'white',
    text: '#1f2937',
    subText: '#6b7280',
    headerBg: 'white',
    borderColor: '#e5e7eb',
    modalBg: 'white',
    inputBg: '#f9fafb',
    messageCardBg: '#fff7ed',
    messageCardBorder: '#fed7aa',
    messageTitle: '#9a3412',
    messageContent: '#4b5563',
    sickBtn: '#fef2f2',
    sickBorder: '#fecaca',
    msgBtn: '#e0e7ff',
    msgBtnText: '#4f46e5',
    msgBtnIcon: '#4f46e5'
  },
  dark: {
    background: '#111827',
    card: '#1f2937',
    text: '#f3f4f6',
    subText: '#9ca3af',
    headerBg: '#111827',
    borderColor: '#374151',
    modalBg: '#1f2937',
    inputBg: '#374151',
    messageCardBg: '#431407', 
    messageCardBorder: '#7c2d12',
    messageTitle: '#fdba74',
    messageContent: '#e5e7eb',
    sickBtn: '#374151',
    sickBorder: '#991b1b',
    msgBtn: '#1e1b4b',
    msgBtnText: '#a5b4fc',
    msgBtnIcon: '#a5b4fc'
  }
};

export const useParentLogic = () => {
    const { user, logout } = useAuth();
    const [children, setChildren] = useState([]);
    const [messages, setMessages] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    // State for meldinger
    const [msgModalVisible, setMsgModalVisible] = useState(false);
    const [msgContent, setMsgContent] = useState('');
    const [selectedChild, setSelectedChild] = useState(null);

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] || Colors.light;

    // 1. Hent barn tilknyttet forelder
    useEffect(() => {
        if (!user?.email) return;
        const q = query(collection(db, "children"), where("guardianEmails", "array-contains", user.email));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          setChildren(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        });
        return unsubscribe;
    }, [user]);

    // 2. Hent beskjeder (FILTRERT PÅ AVDELING)
    useEffect(() => {
        // Vi må vente til vi vet hvilke avdelinger barna går i
        if (children.length === 0) {
            setMessages([]);
            return;
        }

        // Finn alle unike avdelinger barna tilhører 
        const myDepartments = [...new Set(children.map(child => child.avdeling).filter(d => d))];

        if (myDepartments.length === 0) return;

        // Spørring: Hent meldinger der 'author' (avdelingsnavn) er i listen over mine avdelinger
       
        const q = query(
            collection(db, "messages"), 
            where("author", "in", myDepartments), 
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.log("Feil ved henting av meldinger (sjekk indeks):", error);
        });
        
        return unsubscribe;
    }, [children]); // Kjøres på nytt når listen over barn endres

    // --- Actions ---

    const handleSendMessage = async () => {
        if (!msgContent.trim()) return Alert.alert("Tom melding", "Du må skrive noe.");
        try {
            await addDoc(collection(db, "departmentMessages"), {
                content: msgContent,
                childName: selectedChild.name,
                childId: selectedChild.id,
                department: selectedChild.avdeling, 
                fromEmail: user.email,
                createdAt: new Date(),
                read: false 
            });
            Alert.alert("Sendt", "Meldingen er sendt til avdelingen.");
            setMsgContent('');
            setMsgModalVisible(false);
        } catch (e) {
            Alert.alert("Feil", "Kunne ikke sende melding: " + e.message);
        }
    };

    const toggleStatus = async (child) => {
        try {
            const childRef = doc(db, "children", child.id);
            const newStatus = child.status === 'home' ? 'present' : 'home';
            const updates = { status: newStatus, isSick: false };
            if (newStatus === 'present') {
              const now = new Date();
              updates.checkInTime = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
            } else { updates.checkInTime = null; }
            await updateDoc(childRef, updates);
        } catch (error) { Alert.alert("Feil", "Kunne ikke oppdatere status."); }
    };

    const reportSickness = async (child) => {
        Alert.alert("Meld fravær", `Melde ${child.name} syk/fri i dag?`, [
            { text: "Avbryt", style: "cancel" },
            { text: "Bekreft", style: "destructive", onPress: async () => {
                try {
                    const childRef = doc(db, "children", child.id);
                    await updateDoc(childRef, { status: 'home', isSick: true, checkInTime: null });
                } catch (error) { Alert.alert("Feil", "Kunne ikke registrere fravær."); }
            }}
        ]);
    };

    return {
        user, logout,
        children, messages, loading,
        theme, colorScheme,
        msgModalVisible, setMsgModalVisible,
        msgContent, setMsgContent,
        selectedChild, setSelectedChild,
        handleSendMessage, toggleStatus, reportSickness
    };
};