
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import firebaseApp, { db } from "./firebase";
import type { User } from 'firebase/auth';

const auth = getAuth(firebaseApp);

function generateConnectionCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createUser(name: string, email: string, password: string): Promise<{ user: User; connectionCode: string; }> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    const connectionCode = generateConnectionCode();

    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: user.email,
      connectionCode: connectionCode,
      createdAt: new Date(),
    });
    
    // The onAuthStateChanged listener will pick up the new user state.
    // We can return the user from the credential directly.
    return { user, connectionCode };
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Cette adresse e-mail est déjà utilisée.');
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
    }
    console.error("Error creating user:", error);
    throw new Error("Impossible de créer le compte.");
  }
}

export async function loginWithEmailPassword(email: string, password: string): Promise<User | null> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Error logging in with email/password:", error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error("Email ou mot de passe invalide.");
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
