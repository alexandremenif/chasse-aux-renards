// components/renard-icon.js

const iconCache = new Map();

/**
 * Un composant pour afficher une icône de renard, avec des types configurables.
 *
 * Attributs:
 * - type: 'normal' (défaut), 'gold', 'silver', 'white'.
 * - size: Une taille CSS (ex: '48px'), appliquée à la largeur et hauteur.
 */
class RenardIcon extends HTMLElement {

    constructor() {
        super();
        // Le Shadow DOM est créé UNE SEULE FOIS, ici.
        this.attachShadow({ mode: 'open' }); 
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['type', 'size'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    async render() {
        const type = this.getAttribute('type') || 'normal';
        const size = this.getAttribute('size');
        
        // On récupère la référence au Shadow DOM existant au lieu d'en créer un nouveau.
        const shadow = this.shadowRoot;

        // Charger le SVG de base s'il n'est pas en cache.
        if (!iconCache.has('base')) {
            try {
                const response = await fetch('assets/renard-token.svg');
                if (!response.ok) throw new Error('Network response was not ok');
                const svgText = await response.text();
                iconCache.set('base', svgText);
            } catch (error) {
                console.error('Failed to fetch renard-token.svg:', error);
                shadow.innerHTML = '⚠️'; // Affiche une erreur simple.
                return;
            }
        }
        
        const baseSvgText = iconCache.get('base');
        
        // Utilise DOMParser pour manipuler le SVG en mémoire.
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(baseSvgText, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;

        const circle = svgElement.querySelector('.token-circle');
        const icon = svgElement.querySelector('.token-icon');
        
        // Appliquer les styles en fonction du type
        switch (type) {
            case 'gold':
                circle.setAttribute('fill', '#FFD700');
                circle.setAttribute('stroke', '#B59600');
                icon.setAttribute('fill', '#B59600');
                break;
            case 'silver':
                circle.setAttribute('fill', '#D1D5DB');
                circle.setAttribute('stroke', '#9CA3AF');
                icon.setAttribute('fill', '#9CA3AF');
                break;
            case 'white':
                // Pour le type 'white', on cache le cercle et on met l'icône en blanc.
                circle.style.display = 'none';
                icon.setAttribute('fill', 'white');
                break;
            case 'normal':
            default:
                // Les couleurs par défaut sont déjà dans le SVG, rien à faire.
                break;
        }

        // Appliquer la taille si elle est définie
        if (size) {
            svgElement.style.width = size;
            svgElement.style.height = size;
        }

        shadow.innerHTML = ''; // Vider l'ancien contenu
        shadow.appendChild(svgElement);
    }
}

customElements.define('renard-icon', RenardIcon);
