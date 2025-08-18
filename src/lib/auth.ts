import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
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
      throw new Error("Email ou code de connexion invalide.");
    }
    
    // For this prototype, we'll manage the user session on the client side
    // after validating their code, without signing them into Firebase Auth directly.
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    const clientUser = {
        uid: userDoc.id,
        email: userData.email,
        displayName: userData.name,
    };

    // Store user in session storage to persist login state across page reloads
    sessionStorage.setItem('user', JSON.stringify(clientUser));
    
    return clientUser as unknown as User;

  } catch (error: any) {
    console.error("Error logging in with code:", error);
    throw new Error(error.message || "Une erreur s'est produite lors de la connexion.");
  }
}

export function getCurrentUser(): User | null {
    const userJson = sessionStorage.getItem('user');
    if (userJson) {
        return JSON.parse(userJson) as User;
    }
    return auth.currentUser;
}

export async function handleSignOut() {
    try {
        await signOut(auth);
        sessionStorage.removeItem('user');
    } catch (error) {
        console.error("Error signing out: ", error);
        throw new Error("Impossible de se déconnecter.");
    }
}
