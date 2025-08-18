import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  "projectId": "re-life-hub",
  "appId": "1:509031975989:web:c1935389dfe5b858bdb57c",
  "storageBucket": "re-life-hub.appspot.com",
  "apiKey": "AIzaSyA-v7ZjqR3GPq7RdM6ELE5LDAzILMjQFzU",
  "authDomain": "re-life-hub.firebaseapp.com",
  "messagingSenderId": "509031975989"
};

// Initialize Firebase
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export default firebaseApp;
