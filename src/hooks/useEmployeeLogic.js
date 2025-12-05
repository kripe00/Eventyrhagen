import { addDoc, collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { db } from '../config/firebaseconfig';
import { useAuth } from '../context/Authcontext';

export const useEmployeeLogic = () => {
  const { userData, logout } = useAuth();
  
  // Data State
  const [children, setChildren] = useState([]);
  const [inboxMessages, setInboxMessages] = useState([]);
  
  // UI State
  const [filter, setFilter] = useState('all'); 
  const [selectedChild, setSelectedChild] = useState(null);
  const [msgModalVisible, setMsgModalVisible] = useState(false); 
  const [inboxVisible, setInboxVisible] = useState(false); 
  const [loading, setLoading] = useState(false);

  // Form State
  const [msgTitle, setMsgTitle] = useState('');
  const [msgContent, setMsgContent] = useState('');

  // 1. Hent barn
  useEffect(() => {
    // Hvis userData.department mangler, henter vi ingenting (eller alle hvis logikken tilsier det)
    if (!userData?.department) return;

    const q = query(collection(db, "children"), where("avdeling", "==", userData.department));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChildren(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [userData]);

  // 2. Hent innboks
  useEffect(() => {
      if (!userData?.department) return;
      const q = query(
          collection(db, "departmentMessages"), 
          where("department", "==", userData.department)
          // orderBy("createdAt", "desc") // Kommenter ut midlertidig hvis indeks mangler
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
          // Sorterer manuelt i klienten for å unngå indeks-feil i startfasen
          const sorted = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => b.createdAt - a.createdAt);
          setInboxMessages(sorted);
      });
      return unsubscribe;
  }, [userData]);

  // Handlers
  const toggleCheckIn = async (child) => {
    try {
        const childRef = doc(db, "children", child.id);
        const newStatus = child.status === 'home' ? 'present' : 'home';
        const updates = { 
            status: newStatus, 
            checkInTime: newStatus === 'present' 
            ? `${new Date().getHours().toString().padStart(2,'0')}:${new Date().getMinutes().toString().padStart(2,'0')}` 
            : null 
        };
        await updateDoc(childRef, updates);
        setSelectedChild(null);
    } catch (e) {
        Alert.alert("Feil", "Kunne ikke endre status.");
    }
  };

  const handlePublishMessage = async () => {
      if (!msgTitle || !msgContent) return Alert.alert("Mangler info", "Skriv tittel og innhold.");
      
      // VIKTIG FIKS: Sjekk at vi vet hvem som sender (Avdeling)
      const departmentName = userData?.department;

      if (!departmentName) {
          return Alert.alert(
              "Manglende avdeling", 
              "Systemet vet ikke hvilken avdeling du tilhører. Logg ut og inn igjen, eller kontakt admin."
          );
      }

      setLoading(true);
      try {
          const dateStr = new Date().toLocaleDateString('no-NO', { day: 'numeric', month: 'long' });
          
          await addDoc(collection(db, "messages"), { 
              title: msgTitle, 
              content: msgContent, 
              date: dateStr,
              author: departmentName, // <--- HER MÅ DET STÅ "Solstrålen", ikke "Ansatt"
              createdAt: new Date() 
          });
          
          Alert.alert("Suksess", `Beskjed sendt fra ${departmentName}!`);
          setMsgTitle(''); 
          setMsgContent(''); 
          setMsgModalVisible(false);
      } catch (error) { 
          Alert.alert("Feil", error.message); 
      } finally { 
          setLoading(false); 
      }
  };

  // Filtrering
  const filteredChildren = children.filter(c => {
    if (filter === 'present') return c.status === 'present';
    if (filter === 'home') return c.status === 'home';
    return true;
  });
  
  const presentCount = children.filter(c => c.status === 'present').length;
  const totalCount = children.length;

  return {
    children: filteredChildren,
    allChildrenCount: totalCount,
    presentCount,
    inboxMessages,
    userData,
    filter, setFilter,
    selectedChild, setSelectedChild,
    msgModalVisible, setMsgModalVisible,
    inboxVisible, setInboxVisible,
    loading,
    msgTitle, setMsgTitle,
    msgContent, setMsgContent,
    toggleCheckIn,
    handlePublishMessage,
    logout
  };
};