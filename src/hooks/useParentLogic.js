import {
    addDoc,
    arrayUnion,
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
// --- HER VAR FEILEN, NÅ ER DEN RETTET: ---
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebaseconfig';

export const useParentLogic = () => {
  const [children, setChildren] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Modal states
  const [msgModalVisible, setMsgModalVisible] = useState(false);
  const [msgContent, setMsgContent] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);

  // 1. Sjekk bruker og lytt til Auth
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

  // 2. Hent barn og meldinger når bruker er logget inn
  useEffect(() => {
    if (!user) return;

    // Hent barn koblet til forelderen
    const qChildren = query(
        collection(db, 'children'), 
        where('guardianEmails', 'array-contains', user.email)
    );

    const unsubChildren = onSnapshot(qChildren, (snapshot) => {
      const childList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChildren(childList);
      
      // Når vi har barna, kan vi hente meldinger for deres avdelinger
      if (childList.length > 0) {
          const avdelinger = [...new Set(childList.map(c => c.avdeling))]; // Unike avdelinger
          
          // Merk: 'in'-spørringer i Firestore støtter maks 10 verdier
          const qMessages = query(
              collection(db, 'messages'),
              where('author', 'in', ['alle', ...avdelinger]), // Endret fra 'target' til 'author' basert på din EmployeeLogic
              orderBy('createdAt', 'desc')
          );

          const unsubMessages = onSnapshot(qMessages, (msgSnap) => {
              const msgs = msgSnap.docs.map(d => ({ 
                  id: d.id, 
                  ...d.data(),
                  // Konverter Timestamp til lesbar string hvis nødvendig
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
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
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
    } catch (error) {
      console.error("Error sending message:", error);
      alert('Noe gikk galt ved sending av melding.');
    }
  };

  const toggleStatus = async (child) => {
    // Hvis barnet er sykt, må vi først friskmelde (fjerne isSick)
    if (child.isSick) {
        try {
            await updateDoc(doc(db, 'children', child.id), {
                isSick: false,
                status: 'home' // Setter til hjemme når friskmeldt
            });
        } catch (error) {
            console.error("Kunne ikke friskmelde:", error);
        }
        return;
    }

    // Vanlig Sjekk inn / Sjekk ut
    const newStatus = child.status === 'home' ? 'present' : 'home';
    try {
        const updates = { status: newStatus };
        if (newStatus === 'present') {
            const now = new Date();
            updates.checkInTime = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
        } else {
            updates.checkInTime = null;
        }
        await updateDoc(doc(db, 'children', child.id), updates);
    } catch (error) {
        console.error("Error updating status:", error);
    }
  };

  const reportSickness = async (child) => {
      try {
          await updateDoc(doc(db, 'children', child.id), {
              isSick: true,
              status: 'home', // Syke barn er hjemme
              checkInTime: null
          });
      } catch (error) {
          console.error("Error reporting sickness:", error);
      }
  };

  // --- READ-FUNKSJON ---
  const markMessageAsRead = async (messageId) => {
    if (!user?.email) return;

    // 1. Oppdater UI lokalt med en gang
    setMessages(currentMessages => 
        currentMessages.map(msg => 
            msg.id === messageId 
            ? { ...msg, readBy: [...(msg.readBy || []), user.email] }
            : msg
        )
    );

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
    children,
    messages,
    loading,
    logout,
    user,
    msgModalVisible, setMsgModalVisible,
    msgContent, setMsgContent,
    selectedChild, setSelectedChild,
    handleSendMessage,
    toggleStatus,
    reportSickness,
    markMessageAsRead 
  };
};