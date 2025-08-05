// src/services/auth-service.js
import { auth } from '../firebase';
import { onAuthStateChanged, signInWithRedirect, GoogleAuthProvider, signOut as firebaseSignOut, getRedirectResult } from 'firebase/auth';

class AuthService {
  #provider;
  #loading;

  constructor() {
    this.#provider = new GoogleAuthProvider();
    this.#loading = this.handleRedirectResult();
  }
  
  /**
   * Handles the redirect result from Google Sign-In.
   * @returns {Promise<void>}
   */
  async handleRedirectResult() {
    try {
        await getRedirectResult(auth);
    } catch (error) {
        console.error("Error during sign-in redirect:", error);
    }
  }

  /**
   * Initiates the Google Sign-In redirect flow.
   */
  signInWithGoogle() {
    return signInWithRedirect(auth, this.#provider);
  }

  /**
   * Signs the current user out.
   * @returns {Promise<void>}
   */
  signOut() {
    return firebaseSignOut(auth);
  }

  /**
   * Gets the current authenticated user.
   * Throws an error if no user is signed in.
   * @returns {import('firebase/auth').User}
   */
  getUser() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User is not authenticated. This should not have happened.");
    }
    return user;
  }

  /**
   * Listens for changes to the user's authentication state.
   * @param {(user: import('firebase/auth').User | null) => void} callback
   * @returns {import('firebase/auth').Unsubscribe}
   */
  onUserChanged(callback) {
    return onAuthStateChanged(auth, async (user) => {
      await this.#loading; // Wait for the redirect result to be processed
      callback(user);
    });
  }
}

export const authService = new AuthService();
