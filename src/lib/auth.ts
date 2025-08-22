
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
    // Method 1: Try signing in directly. This works for all new users.
    const userCredential = await signInWithEmailAndPassword(auth, email, code);
    return userCredential.user;
  } catch (error: any) {
     // Check if it's an invalid credential error, likely an old user
    if (error.code === 'auth/invalid-credential') {
      try {
        // Method 2: It's an old user. Let's try to update their password.
        const response = await fetch('/api/update-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, connectionCode: code }),
        });
        
        if (!response.ok) {
           // If the backend validation fails, the credentials are truly wrong.
           throw new Error("Email ou code de connexion invalide.");
        }

        // The password is now updated. Try signing in again.
        const userCredential = await signInWithEmailAndPassword(auth, email, code);
        return userCredential.user;

      } catch (updateError: any) {
        // Handle errors from the update process
        console.error("Error during password update and re-login:", updateError);
        throw new Error("Email ou code de connexion invalide.");
      }
    } else {
       // For other auth errors (network, etc.), throw a generic message.
       console.error("Error logging in with connection code:", error);
       throw new Error("Une erreur s'est produite lors de la connexion.");
    }
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
