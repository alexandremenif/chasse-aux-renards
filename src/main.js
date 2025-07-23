import './style.css';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";

// IMPORTANT :
// Pour être 100% sûr que le problème ne vient pas du chargement des variables d'environnement,
// mettez vos clés en dur DANS LE CODE juste pour ce test.
const firebaseConfig = {
  apiKey: "AIzaSyC-skTKkoruH3pPYwutjHMbOKTXkfN0BPs",
  authDomain: "la-chasse-aux-renards.firebaseapp.com",
  projectId: "la-chasse-aux-renards",
  storageBucket: "la-chasse-aux-renards.firebasestorage.app",
  messagingSenderId: "88287211693",
  appId: "1:88287211693:web:a34621086fd97a27aa9624",
  measurementId: "G-CZ4LF43PFQ"
};

// Initialisation
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const appDiv = document.getElementById('app');

// On affiche un état de chargement initial.
appDiv.innerHTML = `<h1>Vérification de l'authentification...</h1>`;

onAuthStateChanged(auth, (user) => {
  if (user) {
    // L'utilisateur EST connecté.
    console.log("Connexion réussie pour :", user.displayName);
    appDiv.innerHTML = `<h1>Hello world, ${user.displayName}</h1>`;
  } else {
    // L'utilisateur N'EST PAS connecté.
    // Le SDK a eu le temps de vérifier et confirme qu'il n'y a pas de session.
    console.log("Utilisateur non connecté, préparation de la redirection...");
    
    // On met un bouton pour ne pas boucler si un autre problème survient.
    appDiv.innerHTML = `
      <h1>Veuillez vous connecter</h1>
      <button id="login-button">Se connecter avec Google</button>
    `;
    document.getElementById('login-button').addEventListener('click', () => {
      const provider = new GoogleAuthProvider();
      signInWithRedirect(auth, provider);
    });
  }
});