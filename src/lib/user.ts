import { doc, updateDoc, getDoc } from "firebase/firestore";
import { getAuth, updateProfile } from "firebase/auth";
import { db } from './firebase';

export async function updateUserName(userId: string, newName: string): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || user.uid !== userId) {
        throw new Error("User not found or mismatch.");
    }

    try {
        // Update Firebase Auth profile
        await updateProfile(user, { displayName: newName });
        
        // Update Firestore document
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            name: newName
        });
        
        // No need to manage sessionStorage, onAuthStateChanged will handle the update
    } catch (error) {
        console.error("Error updating user name: ", error);
        throw new Error("Failed to update user name.");
    }
}

export async function getUserData(userId: string) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data();
    } else {
        console.log("No such user!");
        return null;
    }
}
