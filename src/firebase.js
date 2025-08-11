// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Reverting to the previous, stable way of initializing Firestore
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// For signInWitHRedirect, we must use the domain where the application is currently hosted
const authDomain = window.location.hostname;

console.log('authDomain:', authDomain)

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-skTKkoruH3pPYwutjHMbOKTXkfN0BPs",
  authDomain,
  projectId: "la-chasse-aux-renards",
  storageBucket: "la-chasse-aux-renards.appspot.com",
  messagingSenderId: "88287211693",
  appId: "1:88287211693:web:b9a3bc7a8391a860aa9624",
  measurementId: "G-00VK3FFKTQ"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get the Firestore instance
const db = getFirestore(app, 'chasse-aux-renards');

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
