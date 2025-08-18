import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { Donation } from './types';

export async function getDonations(): Promise<Donation[]> {
  const donationsCollection = collection(db, 'donations');
  const q = query(donationsCollection, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  const donations = querySnapshot.docs.map(doc => {
    const data = doc.data();
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
      createdAt: data.createdAt,
    } as Donation;
  });
  
  return donations;
}
