// src/services/user-service.js
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut as firebaseSignOut,
  getRedirectResult,
} from 'firebase/auth';
import { auth } from '../firebase'; // Import the initialized auth instance

// In-memory user data to simulate a Firestore collection.
const users_data = [
  {
    id: 'oBkOLU7OlPbAHIRiaqacIVmGpZu1', // This ID should match a Firebase Auth user's UID.
    isParent: true,
    boards: [
        { id: 'board_daniel', owner: 'Daniel' },
        { id: 'board_evelyne', owner: 'Evelyne' },
    ]
  },
  // Add other users here if needed for testing.
];

const provider = new GoogleAuthProvider();

class UserService {
  #loading;
  constructor() {
    this.currentUser = null;
    this.subscribers = [];
    
    // The #loading promise ensures that we wait for any redirect operations to complete
    // before we notify subscribers. This prevents race conditions on page load.
    this.#loading = getRedirectResult(auth).catch(error => console.error("Redirect Result Error:", error));

    onAuthStateChanged(auth, async (firebaseUser) => {
      // Wait for the redirect result to be processed
      await this.#loading; 
      
      if (firebaseUser) {
        // Find the corresponding application-specific user data.
        const userData = users_data.find(u => u.id === firebaseUser.uid);
        
        if (userData) {
          // Merge Firebase Auth data with our application data.
          this.currentUser = {
            id: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            isParent: userData.isParent,
            boards: userData.boards,
          };
        } else {
            // If the user is authenticated with Firebase but not in our user data,
            // treat them as logged out from the app's perspective.
            this.currentUser = null;
        }

      } else {
        this.currentUser = null;
      }
      // Notify all subscribers about the user change.
      this.#notifySubscribers();
    });
  }

  /**
   * Initiates the Google Sign-In process.
   */
  signIn() {
    signInWithRedirect(auth, provider);
  }

  /**
   * Signs the current user out.
   */
  signOut() {
    firebaseSignOut(auth);
  }

  /**
   * Gets the current application user synchronously.
   * Throws an error if no user is signed in or data is not yet loaded.
   * @returns {object} The merged user object.
   */
  getCurrentUser() {
    if (!this.currentUser) {
      throw new Error("User not available. This may be because the user is not authenticated or data is still loading.");
    }
    return this.currentUser;
  }

  /**
   * Registers a handler to be called whenever the authentication state changes.
   * @param {(user: object | null) => void} callback
   * @returns {() => void} A function to unsubscribe.
   */
  onUserChanged(callback) {
    this.subscribers.push(callback);
    
    // Immediately invoke the callback with the current user state,
    // but only after the initial redirect check is complete.
    this.#loading.then(() => callback(this.currentUser));
    
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }
  
  /**
   * Notifies all subscribers with the latest user data.
   */
  #notifySubscribers() {
    this.subscribers.forEach(handler => handler(this.currentUser));
  }
}

export const userService = new UserService();
