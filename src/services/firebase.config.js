import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Removed:  import { getStorage } from 'firebase/storage';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: import.meta.env. VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env. VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env. VITE_FIREBASE_STORAGE_BUCKET || "your-project. appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta. env.VITE_FIREBASE_APP_ID || "your-app-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Storage is not used - we use alternative image hosting
// export const storage = getStorage(app);

export default app;