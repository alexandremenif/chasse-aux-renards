import { LitElement, html, css } from 'lit';
import { mcpKeyService } from '../services/mcp-key-service.js';
import './m3/m3-icon.js';
import './m3/m3-ripple.js';
import './m3/m3-text-field.js';
import './m3/m3-date-picker.js';
import './m3/m3-button.js';
import './m3/m3-card.js';
import './m3/m3-icon-button.js';
import './m3/m3-dialog.js';

class McpKeys extends LitElement {
    static properties = {
        apiKeys: { type: Array, state: true },
        loading: { type: Boolean, state: true },
        newKeyName: { type: String, state: true },
        newKeyDate: { type: String, state: true },
        _visibleKeys: { type: Object, state: true }, // Set of key IDs that are visible
        
        // Dialog State
        _deleteDialogVisible: { type: Boolean, state: true },
        _keyToDelete: { type: String, state: true }
    };
    
    // ... class content ... (I'll need to use replace_file_content carefully or just update the class line and the end line)
    // Actually, I can just replace the top and bottom.



    static styles = css`
        :host {
            display: block;
            padding: var(--md-sys-spacing-24);
            max-width: 800px;
            margin: 0 auto;
            --md-sys-component-button-height: 40px;
        }

        h2 {
            font: var(--md-sys-typescale-headline-medium);
            color: var(--md-sys-color-on-surface);
            margin-bottom: var(--md-sys-spacing-24);
        }

        .section-title {
            font: var(--md-sys-typescale-title-medium);
            color: var(--md-sys-color-on-surface);
            margin-bottom: var(--md-sys-spacing-16);
            display: block;
        }

        m3-card {
            margin-bottom: var(--md-sys-spacing-24);
            --md-sys-color-surface-container-highest: var(--md-sys-color-surface); /* Make card background surface color for outlined variant default look */
        }
        
        /* New Key Form */
        .form-container {
            display: flex;
            flex-direction: column;
            gap: var(--md-sys-spacing-16);
        }

        .form-row {
            display: flex;
            gap: 16px;
            align-items: flex-start;
        }
        .form-row > * {
            flex: 1;
        }

        /* Keys List */
        .key-list {
            display: flex;
            flex-direction: column;
        }

        .key-item {
            padding: var(--md-sys-spacing-16) 0;
            border-bottom: 1px solid var(--md-sys-color-outline-variant);
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .key-item:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        .key-item:first-child {
            padding-top: 0;
        }

        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .item-label {
            font: var(--md-sys-typescale-title-medium);
            font-size: 16px; /* Adjustment to look like screenshot */
            color: var(--md-sys-color-on-surface);
            font-weight: 500;
        }

        .item-row-middle {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
        }

        .key-display {
            font-family: 'Roboto Mono', monospace;
            font-size: 14px;
            color: var(--md-sys-color-on-surface);
            background: transparent;
            border: none;
            padding: 0;
            margin: 0;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
             /* Letter spacing for masked dots to look nice */
            letter-spacing: 1px;
        }
        .key-display.masked {
            font-size: 24px; /* Big dots */
            line-height: 14px;
            letter-spacing: -2px; /* Denser dots */
            color: var(--md-sys-color-on-surface-variant);
        }

        .actions {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        /* Override icon button size for tighter list */
        m3-icon-button {
            --md-sys-component-icon-button-size: 32px;
            --md-sys-component-icon-button-icon-size: 20px;
            color: var(--md-sys-color-on-surface-variant);
        }
        m3-icon-button[delete-btn] {
            color: var(--md-sys-color-error); /* Optional: explicit delete color, or keep neutral */
            --md-sys-color-on-surface-variant: var(--md-sys-color-error); /* Hack to force color if component uses strict var */
        }
        m3-icon-button:hover {
            color: var(--md-sys-color-on-surface);
        }

        .item-footer {
            margin-top: 4px;
            font: var(--md-sys-typescale-body-small);
            color: var(--md-sys-color-on-surface-variant);
            font-size: 12px;
        }

        .expired-text {
            color: var(--md-sys-color-error);
        }

        .empty-state {
            text-align: center;
            padding: 32px;
            color: var(--md-sys-color-on-surface-variant);
            font: var(--md-sys-typescale-body-medium);
        }

        /* Label colors for expired items */
        .key-item.expired .item-label {
            color: var(--md-sys-color-error);
        }
        .key-item.expired .key-display.masked {
             color: var(--md-sys-color-error);
        }
    `;

    #unsubscribe = null;

    constructor() {
        super();
        this.apiKeys = [];
        this.loading = true;
        this.newKeyName = '';
        this.newKeyDate = '';
        this._visibleKeys = new Set();
        this._deleteDialogVisible = false;
        this._keyToDelete = null;
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
        this.#unsubscribe = mcpKeyService.onKeysChanged(keys => {
            this.apiKeys = keys.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            this.loading = false;
        });
    }

    async #generateKey() {
        if (!this.newKeyName) {
            throw new Error("Veuillez entrer un nom pour la clé.");
        }

        try {
            await mcpKeyService.generateKey(this.newKeyName, this.newKeyDate || null);
            this.newKeyName = '';
            this.newKeyDate = '';
        } catch (e) {
            console.error("Failed to create key", e);
            throw e;
        }
    }

    #requestDeleteKey(key) {
        this._keyToDelete = key;
        this._deleteDialogVisible = true;
    }

    async #confirmDeleteKey() {
        if (!this._keyToDelete) return;
        
        try {
            await mcpKeyService.deleteKey(this._keyToDelete);
            this._deleteDialogVisible = false;
            this._keyToDelete = null;
        } catch (e) {
            console.error("Failed to delete key", e);
            this._deleteDialogVisible = false; // Close anyway on error
            throw e; 
        }
    }
    
    async #copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy: ', err);
            throw new Error("Impossible de copier la clé.");
        }
    }

    #toggleVisibility(key) {
        const newSet = new Set(this._visibleKeys);
        if (newSet.has(key)) {
            newSet.delete(key);
        } else {
            newSet.add(key);
        }
        this._visibleKeys = newSet;
    }

    #isExpired(key) {
        if (!key.expiresAt) return false;
        // Use local date for comparison to avoid UTC shifts
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const localToday = `${year}-${month}-${day}`;
        
        return localToday > key.expiresAt;
    }

    #formatDate(isoDate) {
        if (!isoDate) return '';
        // If YYYY-MM-DD string, format manually to avoid timezone shift
        if (typeof isoDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
            const [y, m, d] = isoDate.split('-');
            return `${d}/${m}/${y}`;
        }
        return new Date(isoDate).toLocaleDateString();
    }

    render() {
        return html`
            <h2>Clés MCP</h2>
            
            <!-- Generate New Key Section -->
            <m3-card variant="outlined">
                <span class="section-title">Nouvelle clé API</span>
                <div class="form-container">
                    <div class="form-row">
                        <m3-text-field 
                            label="Nom de la clé" 
                            .value="${this.newKeyName}"
                            @input="${(e) => this.newKeyName = e.target.value}"
                        ></m3-text-field>
                        
                        <m3-date-picker 
                            label="Expiration (Optionnel)"
                            .value="${this.newKeyDate}"
                            @change="${(e) => this.newKeyDate = e.detail.value}"
                        ></m3-date-picker>
                    </div>

                    <div style="text-align: right; margin-top: 16px;">
                        <m3-button 
                            variant="filled" 
                            @click="${this.#generateKey}"
                            ?disabled="${!this.newKeyName}"
                        >
                            Générer
                        </m3-button>
                    </div>
                </div>
            </m3-card>

            <!-- Existing Keys Section -->
            <m3-card variant="outlined">
                <span class="section-title">Clés existantes</span>
                
                ${this.loading ? html`<div class="empty-state">Chargement...</div>` : ''}
                
                ${!this.loading && this.apiKeys.length === 0 ? html`
                    <div class="empty-state">Aucune clé API active.</div>
                ` : ''}

                <div class="key-list">
                    ${this.apiKeys.map(key => {
                        const expired = this.#isExpired(key);
                        const isVisible = this._visibleKeys.has(key.token);
                        
                        return html`
                        <div class="key-item ${expired ? 'expired' : ''}">
                            <!-- Row 1: Label -->
                            <div class="item-header">
                                <span class="item-label">${key.label || 'Sans nom'}</span>
                            </div>

                            <!-- Row 2: Key Value & Actions -->
                            <div class="item-row-middle">
                                ${isVisible 
                                    ? html`<span class="key-display">${key.token}</span>`
                                    : html`<span class="key-display masked">••••••••••••••••••••</span>`
                                }
                                
                                <div class="actions">
                                    <m3-icon-button 
                                        icon="${isVisible ? 'visibility_off' : 'visibility'}" 
                                        @click="${() => this.#toggleVisibility(key.token)}"
                                        title="${isVisible ? 'Masquer' : 'Afficher'}"
                                    ></m3-icon-button>
                                    
                                    <m3-icon-button 
                                        icon="content_copy" 
                                        @click="${() => this.#copyToClipboard(key.token)}"
                                        title="Copier"
                                    ></m3-icon-button>
                                    
                                    <m3-icon-button 
                                        delete-btn
                                        icon="delete" 
                                        @click="${() => this.#requestDeleteKey(key.token)}"
                                        title="Révoquer"
                                    ></m3-icon-button>
                                </div>
                            </div>

                            <!-- Row 3: Metadata -->
                            <div class="item-footer">
                                Créée le ${this.#formatDate(key.createdAt)}
                                ${key.expiresAt 
                                    ? html` • <span class="${expired ? 'expired-text' : ''}">${expired ? 'Expiré' : 'Expire'} le ${this.#formatDate(key.expiresAt)}</span>` 
                                    : ''
                                }
                            </div>
                        </div>
                    `})}
                </div>
            </m3-card>

            <!-- Delete Confirmation Dialog -->
            <m3-dialog
                headline="Révoquer la clé ?"
                .visible="${this._deleteDialogVisible}"
                @close="${() => this._deleteDialogVisible = false}"
            >
                <m3-icon slot="icon" icon="warning" style="font-size: 48px; color: var(--md-sys-color-error);"></m3-icon>
                <span>Voulez-vous vraiment révoquer cette clé ? L'accès sera immédiatement coupé. Cette action est irréversible.</span>
                
                <div slot="actions" style="display: flex; gap: 8px;">
                    <m3-button 
                        variant="text" 
                        @click="${() => this._deleteDialogVisible = false}"
                    >
                        Annuler
                    </m3-button>
                    <m3-button 
                        variant="filled" 
                        style="--md-sys-color-primary: var(--md-sys-color-error); --md-sys-color-on-primary: var(--md-sys-color-on-error);"
                        @click="${this.#confirmDeleteKey}"
                    >
                        Révoquer
                    </m3-button>
                </div>
            </m3-dialog>
        `;
    }
}

customElements.define('mcp-keys', McpKeys);
