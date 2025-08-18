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
        // If user is logged in via standard Firebase Auth, fetch their custom data
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            // Augment user object with display name and connection code
            user.displayName = userData.name;
            setConnectionCode(userData.connectionCode);
        }
        setUser(user);
      } else {
        // Handle client-side session for code-based login
        const sessionUser = sessionStorage.getItem('user');
        if (sessionUser) {
            setUser(JSON.parse(sessionUser));
        } else {
            setUser(null);
        }
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
