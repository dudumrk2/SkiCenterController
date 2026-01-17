import { initializeApp } from 'firebase/app';
import { getFirestore, doc, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

// Config provided by User
const firebaseConfig = {
  apiKey: "AIzaSyBPVYizs4ouACivESHa1hvAIYl0Fe8niNw",
  authDomain: "myskiapp-d2e86.firebaseapp.com",
  projectId: "myskiapp-d2e86",
  storageBucket: "myskiapp-d2e86.firebasestorage.app",
  messagingSenderId: "671681089185",
  appId: "1:671681089185:web:9060a61d7a231cc77beae0",
  measurementId: "G-YBVR6K3EDP"
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
