// src/services/user-service.js
import { onAuthStateChanged, GoogleAuthProvider, signInWithRedirect, signOut as firebaseSignOut, getRedirectResult } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ApplicationError } from '../common/application-error';

const provider = new GoogleAuthProvider();

class UserService {
  #loading;
  constructor() {
    this.currentUser = undefined;
    this.subscribers = [];
    this.#loading = getRedirectResult(auth);

    onAuthStateChanged(auth, async (firebaseUser) => {
      try {
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
            throw new ApplicationError("Vous n'avez pas accès à l'application.");
          }
        } else {
          this.currentUser = null;
        }
      } catch (error) {
        // Ensure we are logged out on error to avoid sticking in loading state
        this.currentUser = null;
        throw error;
      } finally {
        this.#notifySubscribers();
      }
    });
  }

  signIn() {
    signInWithRedirect(auth, provider);
  }

  signOut() {
    firebaseSignOut(auth);
  }

  getCurrentUser() {
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
