
import { doc, updateDoc, getDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { getAuth, updateProfile, deleteUser } from "firebase/auth";
import { db } from './firebase';
import { deleteAllDonationsForUser } from "./donations";

export type UserData = {
    id: string;
    name: string;
    email: string;
    plan: 'free' | 'premium';
    donationCount: number;
    contactCount: number;
    connectionCode: string;
}

export async function updateUserName(userId: string, newName: string): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || user.uid !== userId) {
        throw new Error("User not found or mismatch.");
    }

    try {
        await updateProfile(user, { displayName: newName });
        
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            name: newName
        });
        
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

export async function deleteUserAccount(userId: string): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || user.uid !== userId) {
        throw new Error("User not found or mismatch.");
    }

    try {
        // 1. Delete all donations by the user
        await deleteAllDonationsForUser(userId);

        // 2. Delete the user document from Firestore
        const userRef = doc(db, 'users', userId);
        await deleteDoc(userRef);

        // 3. Delete the user from Firebase Authentication
        await deleteUser(user);
        
    } catch (error: any) {
        console.error("Error deleting user account: ", error);
        if (error.code === 'auth/requires-recent-login') {
            throw new Error("Cette opération est sensible et nécessite une ré-authentification. Veuillez vous déconnecter et vous reconnecter avant de réessayer.");
        }
        throw new Error("Failed to delete user account.");
    }
}


// --- Admin Functions ---

export async function getAllUsers(): Promise<UserData[]> {
    const usersCollection = collection(db, 'users');
    try {
        const querySnapshot = await getDocs(usersCollection);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as UserData));
    } catch (error) {
        console.error("Error fetching all users:", error);
        throw new Error("Failed to fetch users.");
    }
}

export async function updateUserPlan(userId: string, newPlan: 'free' | 'premium'): Promise<void> {
    const userRef = doc(db, 'users', userId);
    try {
        await updateDoc(userRef, { plan: newPlan });
    } catch (error) {
        console.error("Error updating user plan:", error);
        throw new Error("Failed to update user plan.");
    }
}
