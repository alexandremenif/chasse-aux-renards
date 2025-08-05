// stores/user-store.js
import { authService } from '../services/auth-service';

// Hardcoded user data, now with emails
const users = [
  {
    id: 'parent1',
    role: 'parent',
    name: 'Alexandre',
    email: 'alex.menif@gmail.com',
    children: [
      { id: 'child1', name: 'Daniel' },
      { id: 'child2', name: 'Evelyne' },
    ],
  },
  {
    id: 'child1',
    role: 'child',
    name: 'Daniel',
    email: 'daniel.menif@gmail.com',
    children: [],
  },
  {
    id: 'child2',
    role: 'child',
    name: 'Evelyne',
    email: 'evelyne.menif@gmail.com',
    children: [],
  },
];

class UserStore {
  constructor() {
    this.currentUser = null;
    this.subscribers = [];

    authService.onUserChanged((firebaseUser) => {
      if (firebaseUser) {
        // Find the corresponding application user
        this.currentUser = users.find(u => u.email === firebaseUser.email) || null;
      } else {
        this.currentUser = null;
      }
      this.#notifySubscribers();
    });
  }

  /**
   * Gets the current application user.
   * Throws an error if no user is signed in.
   * @returns {object}
   */
  getCurrentUser() {
    if (!this.currentUser) {
      throw new Error("Application user not found. This should not have happened.");
    }
    return this.currentUser;
  }

  /**
   * Notifies all subscribers with the latest user data.
   */
  #notifySubscribers() {
    this.subscribers.forEach(handler => handler(this.currentUser));
  }

  /**
   * Registers a handler to be called with the current user's data.
   * @param {(user: object | null) => void} handler
   * @returns {() => void} A function to unsubscribe.
   */
  onAuthenticatedUser(handler) {
    this.subscribers.push(handler);
    handler(this.currentUser);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== handler);
    };
  }
}

export const userStore = new UserStore();
