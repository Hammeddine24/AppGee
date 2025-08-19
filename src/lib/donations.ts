
import { db } from './firebase';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, where, doc, runTransaction } from 'firebase/firestore';
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


type NewDonation = Omit<Donation, 'id' | 'user' | 'createdAt'>;

export async function addDonation(donation: NewDonation): Promise<string> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error('User is not authenticated. Cannot add donation.');
    }

    const userRef = doc(db, 'users', user.uid);
    const donationCollection = collection(db, 'donations');

    try {
        const newDonationId = await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw "Document does not exist!";
            }

            const currentDonationCount = userDoc.data().donationCount || 0;
            const currentPlan = userDoc.data().plan || 'free';

            if (currentPlan === 'free' && currentDonationCount >= 3) {
                 throw new Error("Donation limit reached for free plan.");
            }
            
            const newDonationRef = doc(donationCollection);
            transaction.set(newDonationRef, {
                ...donation,
                user: {
                    id: user.uid,
                    name: user.displayName || 'Utilisateur Anonyme',
                },
                createdAt: serverTimestamp(),
            });

            transaction.update(userRef, { donationCount: currentDonationCount + 1 });
            
            return newDonationRef.id;
        });

        return newDonationId;
    } catch (error) {
        console.error("Error adding donation: ", error);
        if(error instanceof Error && error.message.includes("limit reached")) {
            throw new Error('Limite de dons atteinte. Veuillez passer au plan supérieur.');
        }
        throw new Error('Failed to add donation to database.');
    }
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
