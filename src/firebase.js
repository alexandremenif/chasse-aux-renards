// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-skTKkoruH3pPYwutjHMbOKTXkfN0BPs",
  authDomain: "la-chasse-aux-renards.firebaseapp.com",
  projectId: "la-chasse-aux-renards",
  storageBucket: "la-chasse-aux-renards.appspot.com",
  messagingSenderId: "88287211693",
  appId: "1:88287211693:web:b9a3bc7a8391a860aa9624",
  measurementId: "G-00VK3FFKTQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
