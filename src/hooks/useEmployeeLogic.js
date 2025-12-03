import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { addDoc, collection, doc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
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
    let q = userData?.department 
        ? query(collection(db, "children"), where("avdeling", "==", userData.department))
        : collection(db, "children");

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
          where("department", "==", userData.department),
          orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
          setInboxMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
      setLoading(true);
      try {
          const dateStr = new Date().toLocaleDateString('no-NO', { day: 'numeric', month: 'long' });
          await addDoc(collection(db, "messages"), { 
              title: msgTitle, content: msgContent, date: dateStr,
              author: userData?.department || "Ansatt", createdAt: new Date() 
          });
          Alert.alert("Suksess", "Beskjed sendt!");
          setMsgTitle(''); setMsgContent(''); setMsgModalVisible(false);
      } catch (error) { Alert.alert("Feil", error.message); } finally { setLoading(false); }
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
    // Data
    children: filteredChildren,
    allChildrenCount: totalCount,
    presentCount,
    inboxMessages,
    userData,
    
    // State
    filter, setFilter,
    selectedChild, setSelectedChild,
    msgModalVisible, setMsgModalVisible,
    inboxVisible, setInboxVisible,
    loading,
    msgTitle, setMsgTitle,
    msgContent, setMsgContent,

    // Actions
    toggleCheckIn,
    handlePublishMessage,
    logout
  };
};