
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionCode, setConnectionCode] = useState<string>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            setConnectionCode(userDoc.data().connectionCode);
        }
      } else {
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
