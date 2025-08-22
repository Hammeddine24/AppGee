
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, setPersistence, browserLocalPersistence } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import firebaseApp, { db } from "./firebase";
import type { User } from 'firebase/auth';

const auth = getAuth(firebaseApp);

// Set session persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting session persistence:", error);
  });


function generateConnectionCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createUser(name: string, email: string): Promise<{ user: User; connectionCode: string; }> {
  try {
    const connectionCode = generateConnectionCode();
    // Use the connection code as the password for Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, connectionCode);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: user.email,
      connectionCode: connectionCode,
      createdAt: new Date(),
      plan: 'free',
      donationCount: 0,
      contactCount: 0,
    });
    
    return { user, connectionCode };
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Cette adresse e-mail est déjà utilisée.');
    }
    console.error("Error creating user:", error);
    throw new Error("Impossible de créer le compte.");
  }
}

export async function loginWithConnectionCode(email: string, code: string): Promise<User | null> {
  try {
    // The connection code is used as the password
    const userCredential = await signInWithEmailAndPassword(auth, email, code);
    return userCredential.user;
  } catch (error: any) {
    console.error("Error logging in with connection code:", error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error("Email ou code de connexion invalide.");
    }
    throw new Error("Une erreur s'est produite lors de la connexion.");
  }
}


export function getCurrentUser(): User | null {
    return auth.currentUser;
}

export async function handleSignOut() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out: ", error);
        throw new Error("Impossible de se déconnecter.");
    }
}
