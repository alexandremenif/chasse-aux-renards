// stores/user-store.js

const users = [
  {
    id: 'parent1',
    role: 'parent',
    name: 'Alexandre',
    children: [
      { id: 'child1', name: 'Daniel' },
      { id: 'child2', name: 'Evelyne' },
    ],
  },
  {
    id: 'child1',
    role: 'child',
    name: 'Daniel',
    children: [],
  },
  {
    id: 'child2',
    role: 'child',
    name: 'Evelyne',
    children: [],
  },
];

class UserStore {
  constructor() {
    this.currentUser = users[0]; // Default to parent view
    this.subscribers = [];
  }

  /**
   * Creates the data payload for subscribers, including the user's ID.
   */
  #createUserDataPayload() {
    return {
      id: this.currentUser.id,
      role: this.currentUser.role,
      children: this.currentUser.children || [],
      name: this.currentUser.name,
    };
  }

  /**
   * Notifies all subscribers with the latest user data.
   */
  #notifySubscribers() {
    const userData = this.#createUserDataPayload();
    this.subscribers.forEach(handler => handler(userData));
  }

  /**
   * Temporary method to get all users for the user selector UI.
   * @returns {{id: string, name: string}[]}
   */
  getUsers() {
    return users.map(u => ({ id: u.id, name: u.name }));
  }

  /**
   * Temporary method to switch the current user.
   * @param {string} userId
   */
  selectUser(userId) {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser && selectedUser.id !== this.currentUser.id) {
      this.currentUser = selectedUser;
      this.#notifySubscribers();
    }
  }

  /**
   * Registers a handler to be called with the current user's data.
   * @param {(userData: {id: string, role: 'parent' | 'child', children: {id: string, name: string}[], name: string}) => void} handler
   * @returns {() => void} A function to unsubscribe.
   */
  onAuthenticatedUser(handler) {
    this.subscribers.push(handler);

    // Immediately call the handler with the initial user's data
    handler(this.#createUserDataPayload());

    // Return an unsubscribe function to prevent memory leaks
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== handler);
    };
  }
}

export const userStore = new UserStore();
