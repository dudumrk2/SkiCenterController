import { initializeApp } from 'firebase/app';
import { getFirestore, doc, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

// Config provided by User
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
// Optional: Initialize analytics if needed, though strictly not required for core features
// const analytics = getAnalytics(app); 

// Application ID for pathing
export const APP_ID = 'pila-ski-2025';

// Helper to get the base path for public data
export const getPublicDataRef = (collectionName) => {
  return collection(db, `artifacts/${APP_ID}/public/data/${collectionName}`);
};

// Helper for user-specific paths (if needed later)
export const getUserRef = (uid) => {
  return doc(db, `artifacts/${APP_ID}/public/data/users/${uid}`);
};
