"use client";

import React, { useState, useEffect, useContext, createContext } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import firebaseApp from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const auth = getAuth(firebaseApp);

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  connectionCode?: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isLoggedIn: false,
});

// This custom hook simplifies the process of user authentication
// and keeps user information in a shared state across the application
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionCode, setConnectionCode] = useState<string>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in. The user object from onAuthStateChanged is the source of truth.
        // It should have the displayName if it was set correctly during sign-up.
        setUser(user);

        // Fetch supplementary data from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            setConnectionCode(userData.connectionCode);
        }
      } else {
        // User is signed out
        setUser(null);
        setConnectionCode(undefined);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const value = {
    user,
    loading,
    isLoggedIn: !loading && !!user,
    connectionCode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
