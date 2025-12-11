import { addDoc, collection, doc, onSnapshot, query, updateDoc, where, setDoc, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { db } from '../config/firebaseconfig';
import { useAuth } from '../context/Authcontext';

export const useEmployeeLogic = () => {
  const { userData, logout } = useAuth();
  
  const [children, setChildren] = useState([]);
  const [inboxMessages, setInboxMessages] = useState([]);
  
  const [filter, setFilter] = useState('all'); 
  const [selectedChild, setSelectedChild] = useState(null);
  const [msgModalVisible, setMsgModalVisible] = useState(false); 
  const [inboxVisible, setInboxVisible] = useState(false); 
  const [loading, setLoading] = useState(false);

  const [msgTitle, setMsgTitle] = useState('');
  const [msgContent, setMsgContent] = useState('');

  // Hent barn
  useEffect(() => {
    if (!userData?.department) return;
    const q = query(collection(db, "children"), where("avdeling", "==", userData.department));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChildren(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [userData]);

  // Hent innboks
  useEffect(() => {
      if (!userData?.department) return;
      const q = query(
          collection(db, "departmentMessages"), 
          where("department", "==", userData.department)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const sorted = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => b.createdAt - a.createdAt);
          setInboxMessages(sorted);
      });
      return unsubscribe;
  }, [userData]);

  // --- SJEKK INN/UT MED LOGG  ---
  const toggleCheckIn = async (child) => {
    try {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
        const dateStr = now.toISOString().split('T')[0];

        const childRef = doc(db, "children", child.id);
        const logId = `${child.id}_${dateStr}`;
        const logRef = doc(db, "attendance_logs", logId);

        if (child.status === 'home') {
            // SJEKK INN
            await updateDoc(childRef, { 
                status: 'present', 
                checkInTime: timeStr 
            });

            await setDoc(logRef, {
                childId: child.id,
                childName: child.name,
                avdeling: child.avdeling,
                date: dateStr,
                checkIn: timeStr,
                createdAt: Timestamp.now()
            }, { merge: true });

        } else {
            // SJEKK UT
            await updateDoc(childRef, { 
                status: 'home', 
                checkInTime: null 
            });

            await setDoc(logRef, {
                checkOut: timeStr
            }, { merge: true });
        }
        setSelectedChild(null);
    } catch (e) { 
        console.error(e);
        Alert.alert("Feil", "Kunne ikke endre status."); 
    }
  };

  const handlePublishMessage = async () => {
      if (!msgTitle || !msgContent) return Alert.alert("Mangler info", "Skriv tittel og innhold.");
      const departmentName = userData?.department;
      if (!departmentName) return Alert.alert("Feil", "Mangler avdeling.");

      setLoading(true);
      try {
          const dateStr = new Date().toLocaleDateString('no-NO', { day: 'numeric', month: 'long' });
          await addDoc(collection(db, "messages"), { 
              title: msgTitle, content: msgContent, date: dateStr,
              author: departmentName, createdAt: new Date() 
          });
          
          Alert.alert("Suksess", `Beskjed sendt fra ${departmentName}!`);
          setMsgTitle(''); setMsgContent(''); setMsgModalVisible(false);
      } catch (error) { 
          Alert.alert("Feil", error.message); 
      } finally { 
          setLoading(false); 
      }
  };

  // Filtrering og telling
  const filteredChildren = children.filter(c => {
    if (filter === 'present') return c.status === 'present';
    if (filter === 'home') return c.status === 'home';
    if (filter === 'absence') return c.isSick; 
    return true;
  });
  
  const presentCount = children.filter(c => c.status === 'present').length;
  const sickCount = children.filter(c => c.isSick).length; 
  const totalCount = children.length;

  return {
    children: filteredChildren,
    allChildrenCount: totalCount,
    presentCount,
    sickCount, 
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