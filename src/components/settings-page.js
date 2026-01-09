
import { LitElement, html, css } from 'lit';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { userService } from '../services/user-service';
import { v4 as uuidv4 } from 'uuid';
import './m3/m3-icon.js';
import './m3/m3-ripple.js';

class SettingsPage extends LitElement {
    static properties = {
        apiKeys: { type: Array, state: true },
        loading: { type: Boolean, state: true }
    };

    static styles = css`
        :host {
            display: block;
            padding: var(--md-sys-spacing-24);
            max-width: 800px;
            margin: 0 auto;
        }

        h2 {
            font: var(--md-sys-typescale-headline-medium);
            color: var(--md-sys-color-on-surface);
            margin-bottom: var(--md-sys-spacing-24);
        }

        .card {
            background-color: var(--md-sys-color-surface-container-high);
            border-radius: var(--md-sys-shape-corner-large);
            padding: var(--md-sys-spacing-16);
            margin-bottom: var(--md-sys-spacing-16);
            box-shadow: var(--md-sys-elevation-1);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--md-sys-spacing-16);
        }
        
        .card-title {
             font: var(--md-sys-typescale-title-medium);
             color: var(--md-sys-color-on-surface);
        }
        
        .empty-state {
            color: var(--md-sys-color-on-surface-variant);
            font: var(--md-sys-typescale-body-medium);
            text-align: center;
            padding: var(--md-sys-spacing-16);
        }

        .key-item {
            display: flex;
            align-items: center;
            background-color: var(--md-sys-color-surface);
            padding: var(--md-sys-spacing-12);
            border-radius: var(--md-sys-shape-corner-medium);
            margin-bottom: var(--md-sys-spacing-8);
            border: 1px solid var(--md-sys-color-outline-variant);
        }
        
        .key-content {
            flex: 1;
            overflow: hidden;
        }

        .key-value {
             font-family: monospace;
             font-size: 1.1em;
             color: var(--md-sys-color-on-surface);
             white-space: nowrap;
             overflow: hidden;
             text-overflow: ellipsis;
             display: block;
        }
        
        .key-date {
             font: var(--md-sys-typescale-body-small);
             color: var(--md-sys-color-on-surface-variant);
        }

        button.action-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 8px;
            color: var(--md-sys-color-primary);
            position: relative;
            overflow: hidden;
        }
        button.action-btn:hover {
            background-color: var(--md-sys-color-surface-variant);
        }
        button.action-btn.delete {
            color: var(--md-sys-color-error);
        }

        .primary-btn {
            background-color: var(--md-sys-color-primary);
            color: var(--md-sys-color-on-primary);
            border: none;
            padding: 10px 24px;
            border-radius: 100px;
            font: var(--md-sys-typescale-label-large);
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: box-shadow 0.2s;
        }
        .primary-btn:hover {
            box-shadow: var(--md-sys-elevation-2);
        }
    `;

    #unsubscribe = null;

    constructor() {
        super();
        this.apiKeys = [];
        this.loading = true;
    }

    connectedCallback() {
        super.connectedCallback();
        this.#subscribeToKeys();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.#unsubscribe) this.#unsubscribe();
    }

    #subscribeToKeys() {
        const user = userService.getCurrentUser();
        if (!user) return;

        const q = query(
            collection(db, 'api_keys'), 
            where('uid', '==', user.id) // Security rule matches this
        );

        this.#unsubscribe = onSnapshot(q, (snapshot) => {
            this.apiKeys = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.loading = false;
        }, (error) => {
            console.error("Error fetching keys:", error);
            this.loading = false;
        });
    }

    async #generateKey() {
        const user = userService.getCurrentUser();
        if (!user) return;

        // Generate a random secure key (using uuid for simplicity, but could be longer)
        // Format: sk_live_<random_string>
        const newKey = `sk_live_${uuidv4().replace(/-/g, '')}`;

        try {
            await addDoc(collection(db, 'api_keys'), {
                uid: user.id,
                key: newKey,
                createdAt: serverTimestamp(),
                label: 'Mistral Le Chat' // Default label
            });
        } catch (e) {
            console.error("Failed to create key", e);
            alert("Erreur lors de la création de la clé.");
        }
    }

    async #deleteKey(docId) {
        if (!confirm("Voulez-vous vraiment révoquer cette clé ? L'accès sera immédiatement coupé.")) return;
        
        try {
            await deleteDoc(doc(db, 'api_keys', docId));
        } catch (e) {
            console.error("Failed to delete key", e);
            alert("Erreur lors de la suppression.");
        }
    }
    
    async #copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            // Could show a toast here
            alert("Clé copiée !");
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }
    
    #handleBack() {
        this.dispatchEvent(new CustomEvent('navigate', { 
            detail: { view: 'home' },
            bubbles: true, 
            composed: true 
        }));
    }

    render() {
        return html`
            <div class="header">
                 <button class="action-btn" @click="${this.#handleBack}" style="margin-left: -8px; margin-bottom: 16px;">
                    <m3-icon icon="arrow_back"></m3-icon>
                 </button>
                 <h2>Paramètres</h2>
            </div>
            
            <section class="card">
                <div class="card-header">
                    <span class="card-title">Clés API (MCP)</span>
                    <button class="primary-btn" @click="${this.#generateKey}">
                        <m3-icon icon="add"></m3-icon>
                        Générer une clé
                    </button>
                </div>
                
                ${this.loading ? html`<p class="empty-state">Chargement...</p>` : ''}
                
                ${!this.loading && this.apiKeys.length === 0 ? html`
                    <p class="empty-state">Aucune clé API active. Générez-en une pour connecter un agent IA.</p>
                ` : ''}
                
                ${this.apiKeys.map(key => html`
                    <div class="key-item">
                        <div class="key-content">
                            <span class="key-value">${key.key}</span>
                            <span class="key-date">Créée le ${key.createdAt?.toDate().toLocaleDateString() || '...'}</span>
                        </div>
                        <button class="action-btn" @click="${() => this.#copyToClipboard(key.key)}" title="Copier">
                             <m3-icon icon="content_copy"></m3-icon>
                             <m3-ripple></m3-ripple>
                        </button>
                        <button class="action-btn delete" @click="${() => this.#deleteKey(key.id)}" title="Révoquer">
                             <m3-icon icon="delete"></m3-icon>
                             <m3-ripple></m3-ripple>
                        </button>
                    </div>
                `)}
                
                <p class="key-date" style="margin-top: 16px;">
                    Utilisez ces clés avec le serveur MCP pour donner accès à Chasse aux Renards à votre assistant IA.
                    <strong>Ne partagez jamais ces clés.</strong>
                </p>
            </section>
        `;
    }
}

customElements.define('settings-page', SettingsPage);
