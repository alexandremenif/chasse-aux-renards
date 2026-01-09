
import { db } from '../firebase.js';
import { collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { userService } from './user-service.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service to manage MCP API Keys stored in a subcollection: /users/{uid}/mcp_keys/{docId}
 * The token field is used for authentication queries, doc ID is managed by Firestore.
 */
class McpKeyService {
    
    /**
     * Subscribe to changes in the keys subcollection.
     * @param {Function} callback - Called with lists of keys
     * @returns {Function} unsubscribe function
     */
    onKeysChanged(callback) {
        const user = userService.getCurrentUser();
        if (!user) {
            callback([]);
            return () => {};
        }

        const colRef = collection(db, 'users', user.id, 'mcp_keys');

        return onSnapshot(colRef, (snapshot) => {
            const keys = snapshot.docs.map(doc => ({
                id: doc.id,  // Internal Firestore ID
                ...doc.data()
            }));
            callback(keys);
        }, (error) => {
            console.error("Error fetching keys:", error);
            callback([]);
        });
    }

    /**
     * Generate a new API Key for the current user
     * @param {string} label 
     * @param {string|null} expiresAt - YYYY-MM-DD string or null
     * @returns {string} The generated token (API key)
     */
    async generateKey(label, expiresAt = null) {
        const user = userService.getCurrentUser();
        if (!user) throw new Error("User not authenticated");

        const colRef = collection(db, 'users', user.id, 'mcp_keys');
        
        // Generate a unique token value (separate from Firestore doc ID)
        const token = uuidv4();
        
        // If no expiration provided, default to 1 year from now
        let finalExpiresAt = expiresAt;
        if (!finalExpiresAt) {
            const d = new Date();
            d.setFullYear(d.getFullYear() + 1);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            finalExpiresAt = `${year}-${month}-${day}`;
        }

        await addDoc(colRef, {
            token,  // Used for auth queries
            label: label,
            createdAt: new Date().toISOString(),
            expiresAt: finalExpiresAt
        });
        
        return token;
    }

    /**
     * Revoke (delete) an API Key by its token value
     * @param {string} token - The API token to revoke
     */
    async deleteKey(token) {
        const user = userService.getCurrentUser();
        if (!user) throw new Error("User not authenticated");

        // Query to find the document with this token
        const colRef = collection(db, 'users', user.id, 'mcp_keys');
        const q = query(colRef, where('token', '==', token));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            throw new Error("Key not found");
        }

        // Delete the found document
        await deleteDoc(snapshot.docs[0].ref);
    }
}

export const mcpKeyService = new McpKeyService();
