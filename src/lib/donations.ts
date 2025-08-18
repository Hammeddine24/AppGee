import { db } from './firebase';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, where } from 'firebase/firestore';
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
  
  try {
    const donationsCollection = collection(db, 'donations');
    const newDocRef = await addDoc(donationsCollection, {
      ...donation,
      user: {
        id: user.uid,
        name: user.displayName || 'Utilisateur Anonyme',
      },
      createdAt: serverTimestamp(),
    });
    return newDocRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error('Failed to add donation to database.');
  }
}
