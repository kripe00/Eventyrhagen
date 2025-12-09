import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  doc, 
  updateDoc, 
  arrayUnion, 
  Timestamp,
  limit
} from 'firebase/firestore';
import { db, auth } from '../config/firebaseconfig';
import { signOut } from 'firebase/auth';

export const useParentLogic = () => {
  const [children, setChildren] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Modal states
  const [msgModalVisible, setMsgModalVisible] = useState(false);
  const [msgContent, setMsgContent] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);

  
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setChildren([]);
        setMessages([]);
        setLoading(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  //  Hent barn og meldinger
  useEffect(() => {
    if (!user) return;

    const qChildren = query(
        collection(db, 'children'), 
        where('guardianEmails', 'array-contains', user.email)
    );

    const unsubChildren = onSnapshot(qChildren, (snapshot) => {
      const childList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChildren(childList);
      
      if (childList.length > 0) {
          const avdelinger = [...new Set(childList.map(c => c.avdeling))];
          
          // Hent meldinger for avdelingene + 'alle'
          const qMessages = query(
              collection(db, 'messages'),
              where('author', 'in', ['alle', ...avdelinger]),
              orderBy('createdAt', 'desc'),
              limit(20) // Begrens til siste 20 for ytelse
          );

          const unsubMessages = onSnapshot(qMessages, (msgSnap) => {
              const msgs = msgSnap.docs.map(d => ({ 
                  id: d.id, 
                  ...d.data(),
                  date: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toLocaleDateString('no-NO') : ''
              }));
              setMessages(msgs);
              setLoading(false);
          });

          return () => unsubMessages();
      } else {
          setLoading(false);
      }
    });

    return () => unsubChildren();
  }, [user]);

  // --- Handlers ---

  const logout = async () => {
    try { await signOut(auth); } catch (e) { console.error(e); }
  };

  const handleSendMessage = async () => {
    if (!msgContent.trim() || !selectedChild) return;
    try {
      await addDoc(collection(db, 'departmentMessages'), {
        content: msgContent,
        childName: selectedChild.name,
        childId: selectedChild.id,
        department: selectedChild.avdeling,
        fromEmail: user.email,
        createdAt: Timestamp.now(),
        read: false
      });
      setMsgModalVisible(false);
      setMsgContent('');
      alert('Melding sendt!');
    } catch (e) { alert('Noe gikk galt.'); }
  };

  const toggleStatus = async (child) => {
    try {
        if (child.isSick) {
            await updateDoc(doc(db, 'children', child.id), { isSick: false, status: 'home' });
        } else {
            const newStatus = child.status === 'home' ? 'present' : 'home';
            const updates = { status: newStatus };
            if (newStatus === 'present') {
                const now = new Date();
                updates.checkInTime = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
            } else { updates.checkInTime = null; }
            await updateDoc(doc(db, 'children', child.id), updates);
        }
    } catch (e) { console.error(e); }
  };

  const reportSickness = async (child) => {
      try {
          await updateDoc(doc(db, 'children', child.id), { isSick: true, status: 'home', checkInTime: null });
      } catch (e) { console.error(e); }
  };

  // --- MARKER SOM LEST ---
  const markMessageAsRead = async (messageId) => {
    if (!user?.email) return;
    
    try {
        const messageRef = doc(db, 'messages', messageId);
        await updateDoc(messageRef, {
            readBy: arrayUnion(user.email)
        });
    } catch (error) {
        console.error("Feil ved markering av lest:", error);
    }
  };

  return {
    children, messages, loading, logout, user,
    msgModalVisible, setMsgModalVisible,
    msgContent, setMsgContent,
    selectedChild, setSelectedChild,
    handleSendMessage, toggleStatus, reportSickness,
    markMessageAsRead 
  };
};