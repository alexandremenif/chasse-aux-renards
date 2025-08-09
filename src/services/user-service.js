// src/services/user-service.js
import { onAuthStateChanged, GoogleAuthProvider, signInWithRedirect, signOut as firebaseSignOut, getRedirectResult } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const provider = new GoogleAuthProvider();

class UserService {
  #loading;
  constructor() {
    this.currentUser = null;
    this.subscribers = [];
    this.#loading = getRedirectResult(auth).catch(error => console.error("Redirect Result Error:", error));

    onAuthStateChanged(auth, async (firebaseUser) => {
      await this.#loading;

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const boardPromises = userData.boardIds.map(id => getDoc(doc(db, 'boards', id)));
          const boardDocs = await Promise.all(boardPromises);
          
          const boards = boardDocs.map(doc => ({ id: doc.id, owner: doc.data().owner }));

          this.currentUser = {
            id: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            isParent: userData.isParent,
            boards,
          };
        } else {
          this.currentUser = null;
          console.warn(`Firestore user document not found for UID: ${firebaseUser.uid}`);
        }
      } else {
        this.currentUser = null;
      }
      this.#notifySubscribers();
    });
  }

  signIn() {
    signInWithRedirect(auth, provider);
  }

  signOut() {
    firebaseSignOut(auth);
  }

  getCurrentUser() {
    if (!this.currentUser) {
      throw new Error("User not available. This may be because the user is not authenticated or data is still loading.");
    }
    return this.currentUser;
  }

  onUserChanged(callback) {
    this.subscribers.push(callback);
    this.#loading.then(() => callback(this.currentUser));
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  #notifySubscribers() {
    this.subscribers.forEach(handler => handler(this.currentUser));
  }
}

export const userService = new UserService();
