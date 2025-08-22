
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, setPersistence, browserLocalPersistence } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import firebaseApp, { db } from "./firebase";
import type { User } from 'firebase/auth';

const auth = getAuth(firebaseApp);

setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting session persistence:", error);
  });


async function generateUniqueConnectionCode(length: number = 6): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  let isUnique = false;

  while(!isUnique) {
    result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const q = query(collection(db, "users"), where("connectionCode", "==", result));
    const querySnapshot = await getDocs(q);
    if(querySnapshot.empty) {
      isUnique = true;
    }
  }
  return result;
}

export async function createUser(name: string, email: string): Promise<{ user: User; connectionCode: string; }> {
  try {
    const connectionCode = await generateUniqueConnectionCode();
    // Use the connection code as the password for Firebase Auth for simplicity
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

export async function loginWithConnectionCode(code: string): Promise<User | null> {
  if (!code) {
    throw new Error("Le code de connexion ne peut pas être vide.");
  }
  try {
    const q = query(collection(db, "users"), where("connectionCode", "==", code));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // No user found with this connection code
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    // We can't sign in directly without a password.
    // So we will use the connection code which we stored as the password.
    // This is a simplification; in a production app, you might use a custom token.
    const userCredential = await signInWithEmailAndPassword(auth, userData.email, code);

    return userCredential.user;
    
  } catch (error: any) {
    console.error("Error logging in with connection code:", error);
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        throw new Error("Code de connexion invalide.");
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
