// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
// Reverting to the previous, stable way of initializing Firestore
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from "firebase/firestore";

// For signInWitHRedirect, we must use the domain where the application is currently hosted
const authDomain = window.location.hostname;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get the Firestore instance
const db = getFirestore(app);

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, 'localhost', 8080);
}


// Enable offline persistence using the deprecated but functional method
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn("La persistance Firestore a échoué, probablement à cause de plusieurs onglets ouverts.");
    } else if (err.code == 'unimplemented') {
      console.error("Ce navigateur ne supporte pas la persistance hors ligne de Firestore.");
    }
  });

export { auth, db };
