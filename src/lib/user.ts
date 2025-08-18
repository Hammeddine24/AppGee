import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from './firebase';

export async function updateUserName(userId: string, newName: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    try {
        await updateDoc(userRef, {
            name: newName
        });
        
        // Update the session storage if it exists
        const sessionUser = sessionStorage.getItem('user');
        if(sessionUser) {
            const user = JSON.parse(sessionUser);
            user.displayName = newName;
            sessionStorage.setItem('user', JSON.stringify(user));
        }

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
