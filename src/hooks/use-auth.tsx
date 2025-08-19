
"use client";

import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import firebaseApp from '@/lib/firebase';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const auth = getAuth(firebaseApp);

export interface AuthContextType {
  user: User | null;
  userData: DocumentData | null;
  loading: boolean;
  isLoggedIn: boolean;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isLoggedIn: false,
  refreshUserData: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchUserData = useCallback(async (user: User | null) => {
    if (user) {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setUserData(userDoc.data());
            } else {
                setUserData(null);
            }
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            setUserData(null);
        }
    } else {
        setUserData(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      await fetchUserData(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserData]);
  
  const refreshUserData = useCallback(() => {
    if(user) {
        fetchUserData(user);
    }
  }, [user, fetchUserData]);

  const value = {
    user,
    userData,
    loading,
    isLoggedIn: !loading && !!user,
    refreshUserData,
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
