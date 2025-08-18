import { db } from './firebase';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Donation } from './types';

export async function getDonations(): Promise<Donation[]> {
  const donationsCollection = collection(db, 'donations');
  const q = query(donationsCollection, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  const donations = querySnapshot.docs.map(doc => {
    const data = doc.data();
    // Convert Firestore Timestamp to ISO string if it's not already
    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      category: data.category,
      imageUrl: data.imageUrl,
      imageHint: data.imageHint,
      user: {
        name: data.user.name,
        avatarUrl: data.user.avatarUrl,
      },
      createdAt: createdAt,
    } as Donation;
  });
  
  return donations;
}

type NewDonation = Omit<Donation, 'id' | 'user' | 'createdAt'>;
type User = Donation['user'];

export async function addDonation(donation: NewDonation, user: User): Promise<string> {
  try {
    const donationsCollection = collection(db, 'donations');
    const newDocRef = await addDoc(donationsCollection, {
      ...donation,
      user: user,
      createdAt: serverTimestamp(),
    });
    return newDocRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error('Failed to add donation to database.');
  }
}
