// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC-skTKkoruH3pPYwutjHMbOKTXkfN0BPs",
  authDomain: "la-chasse-aux-renards.firebaseapp.com",
  projectId: "la-chasse-aux-renards",
  storageBucket: "la-chasse-aux-renards.firebasestorage.app",
  messagingSenderId: "88287211693",
  appId: "1:88287211693:web:a34621086fd97a27aa9624",
  measurementId: "G-CZ4LF43PFQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);

// You can initialize and export other services here as needed
// import { getFirestore } from "firebase/firestore";
// export const db = getFirestore(app);
