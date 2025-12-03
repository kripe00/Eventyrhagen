import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../config/firebaseconfig';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // Hent rolle og avdeling fra 'users' samlingen
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setRole(data.role);
            setUserData(data); 
          } else {
            setRole('parent'); 
            setUserData(null);
          }
        } catch (error) {
          console.error("Kunne ikke hente rolle:", error);
          setRole('parent');
        }
      } else {
        setUser(null);
        setRole(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, role, userData, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};