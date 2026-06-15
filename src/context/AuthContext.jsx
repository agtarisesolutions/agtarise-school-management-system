import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch additional user data (role, schoolName) from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...data,
              role: data.role || 'student' // ensure role exists
            });
          } else {
            // Fallback if doc doesn't exist yet
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: 'student', // default
              name: firebaseUser.displayName || 'User'
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Fallback if Firestore read fails
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: 'admin', // default to admin for this specific fallback or as needed
          name: firebaseUser.displayName || 'User'
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    return signOut(auth);
  };

  const signup = async (email, password, userData) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", res.user.uid), {
      ...userData,
      createdAt: new Date().toISOString()
    });
    return res;
  };

  const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, resetPassword, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
