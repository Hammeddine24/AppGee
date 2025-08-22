
import { db } from './firebase';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, where, doc, runTransaction, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import type { Donation } from './types';
import { getAuth } from 'firebase/auth';

const mapDocToDonation = (doc: any): Donation => {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      imageHint: data.imageHint,
      contact: data.contact,
      user: {
        id: data.user.id,
        name: data.user.name,
      },
      createdAt: createdAt,
      isFeatured: data.isFeatured || false,
    } as Donation;
}


export async function getDonations(): Promise<Donation[]> {
  const donationsCollection = collection(db, 'donations');
  const q = query(donationsCollection, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(mapDocToDonation);
}

export async function getDonationsByUser(userId: string): Promise<Donation[]> {
  const donationsCollection = collection(db, 'donations');
  const q = query(
    donationsCollection, 
    where('user.id', '==', userId), 
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(mapDocToDonation);
}


type NewDonationData = {
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  contact: string;
};

export async function addDonation(donation: NewDonationData): Promise<string> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error('User is not authenticated. Cannot add donation.');
    }

    const newDonationRef = await addDoc(collection(db, 'donations'), {
         ...donation,
        user: {
            id: user.uid,
            name: user.displayName || 'Utilisateur Anonyme',
        },
        createdAt: serverTimestamp(),
        isFeatured: false,
    });
    
    return newDonationRef.id;
}


export async function incrementContactCount(userId: string): Promise<void> {
    if (!userId) {
        throw new Error('User ID is required to increment contact count.');
    }
    const userRef = doc(db, 'users', userId);

     try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error("User document not found");
            }
            const currentContactCount = userDoc.data().contactCount || 0;
            transaction.update(userRef, { contactCount: currentContactCount + 1 });
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
        throw new Error('Failed to update contact count.');
    }
}

// --- Admin Functions ---

export async function deleteDonation(donationId: string): Promise<void> {
    const donationRef = doc(db, 'donations', donationId);
    try {
        await deleteDoc(donationRef);
    } catch (error) {
        console.error("Error deleting donation: ", error);
        throw new Error("Failed to delete donation.");
    }
}

export async function toggleDonationFeaturedStatus(donationId: string, newStatus: boolean): Promise<void> {
    const donationRef = doc(db, 'donations', donationId);
    try {
        await updateDoc(donationRef, { isFeatured: newStatus });
    } catch (error) {
        console.error("Error updating donation feature status: ", error);
        throw new Error("Failed to update donation status.");
    }
}

// --- New function for account deletion ---
export async function deleteAllDonationsForUser(userId: string): Promise<void> {
    const donationsCollection = collection(db, 'donations');
    const q = query(donationsCollection, where('user.id', '==', userId));
    
    try {
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
    } catch (error) {
        console.error("Error deleting user's donations: ", error);
        throw new Error("Failed to delete user's donations.");
    }
}
