import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, getDocs, query, where, collection, limit } from "firebase/firestore";
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

    const connectionCode = generateConnectionCode();

    // Store user info and connection code in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: user.email,
      connectionCode: connectionCode,
      createdAt: new Date(),
    });

    return { user, connectionCode };
  } catch (error: any) {
    // Better error handling
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

export async function loginWithCode(email: string, connectionCode: string): Promise<User | null> {
  try {
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("email", "==", email),
      where("connectionCode", "==", connectionCode.toUpperCase()),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null; // No user found with this email/code combination
    }
    
    // We can't directly sign in the user without a password.
    // In a real app, you might use custom tokens, but for this simplified flow,
    // we'll just confirm they exist and manage session state on the client.
    // The limitation is that Firebase Auth state won't be "signed in".
    // For this prototype, we'll return a mock user object.
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    // This is not a real Firebase User object, but it contains the necessary info.
    return {
        uid: userDoc.id,
        email: userData.email,
        displayName: userData.name,
    } as unknown as User;

  } catch (error) {
    console.error("Error logging in with code:", error);
    throw new Error("Une erreur s'est produite lors de la connexion.");
  }
}
