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
  limit,
  setDoc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../config/firebaseconfig';

export const useParentLogic = () => {
  const [children, setChildren] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Modal states
  const [msgModalVisible, setMsgModalVisible] = useState(false);
  const [msgContent, setMsgContent] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);

  // Auth listener
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

  // Hent data (Barn og Meldinger)
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
          
          const qMessages = query(
              collection(db, 'messages'),
              where('author', 'in', ['alle', ...avdelinger]),
              orderBy('createdAt', 'desc'),
              limit(20) 
          );

          const unsubMessages = onSnapshot(qMessages, (msgSnap) => {
              const msgs = msgSnap.docs
                .map(d => ({ 
                    id: d.id, 
                    ...d.data(),
                    date: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toLocaleDateString('no-NO') : ''
                }))
                .filter(msg => !msg.deletedBy?.includes(user.email));

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
            return;
        }

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
        const dateStr = now.toISOString().split('T')[0];

        const childRef = doc(db, "children", child.id);
        const logId = `${child.id}_${dateStr}`;
        const logRef = doc(db, "attendance_logs", logId);

        if (child.status === 'home') {
            await updateDoc(childRef, { status: 'present', checkInTime: timeStr });
            await setDoc(logRef, {
                childId: child.id,
                childName: child.name,
                avdeling: child.avdeling,
                date: dateStr,
                checkIn: timeStr,
                createdAt: Timestamp.now()
            }, { merge: true });
        } else {
            await updateDoc(childRef, { status: 'home', checkInTime: null });
            await setDoc(logRef, { checkOut: timeStr }, { merge: true });
        }
    } catch (e) { console.error(e); }
  };

  const reportSickness = async (child) => {
      try {
          await updateDoc(doc(db, 'children', child.id), { isSick: true, status: 'home', checkInTime: null });
      } catch (e) { console.error(e); }
  };

  const markMessageAsRead = async (messageId) => {
    if (!user?.email) return;
    try {
        const messageRef = doc(db, 'messages', messageId);
        await updateDoc(messageRef, { readBy: arrayUnion(user.email) });
    } catch (error) { console.error("Feil ved markering av lest:", error); }
  };

  // --- SLETT MELDING (Skjul for meg) ---
  const deleteMessage = async (messageId) => {
    if (!user?.email) return;
    try {
        const messageRef = doc(db, 'messages', messageId);
        await updateDoc(messageRef, {
            deletedBy: arrayUnion(user.email)
        });
    } catch (error) {
        console.error("Feil ved sletting:", error);
    }
  };

  return {
    children, messages, loading, logout, user,
    msgModalVisible, setMsgModalVisible,
    msgContent, setMsgContent,
    selectedChild, setSelectedChild,
    handleSendMessage, toggleStatus, reportSickness,
    markMessageAsRead,
    deleteMessage 
  };
};