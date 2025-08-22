import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// IMPORTANT: Replace with your actual service account credentials
// You can download this from your Firebase project settings
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, connectionCode } = req.body;

  if (!email || !connectionCode) {
    return res.status(400).json({ message: 'Email and connection code are required.' });
  }

  try {
    // 1. Find the user by email in Firestore to verify the connection code
    const usersRef = db.collection('users');
    const q = usersRef.where('email', '==', email).where('connectionCode', '==', connectionCode).limit(1);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      // If no user is found, the credentials are wrong.
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;

    // 2. Update the user's password in Firebase Auth to match the connection code
    await getAuth().updateUser(userId, {
      password: connectionCode,
    });
    
    // 3. Return success
    res.status(200).json({ message: 'Password updated successfully.' });

  } catch (error: any) {
    console.error('Error in update-password API:', error);
     if (error.code === 'auth/user-not-found') {
        return res.status(404).json({ message: 'User not found.' });
    }
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
}
