
/**
 * Simple Router to handle URL changes and dispatch events.
 * It listens to popstate and intercepts link clicks if needed (though we mostly use programmatic navigation).
 */
export class Router {
    constructor() {
        this.routes = [];
        window.addEventListener('popstate', this.handlePopState.bind(this));
    }

    /**
     * @param {string} path - The path to match (e.g., '/home')
     * @param {Function} callback - Function to call when route matches
     */
    addRoute(path, callback) {
        this.routes.push({ path, callback });
    }

    handlePopState() {
        this.resolve(window.location.pathname);
    }

    navigateTo(path) {
        window.history.pushState({}, '', path);
        this.resolve(path);
    }

    resolve(pathname) {
        // Simple exact match for now, can be expanded to regex if needed
        const route = this.routes.find(r => r.path === pathname) || this.routes.find(r => r.path === '/');
        
        if (route) {
            route.callback();
        } else {
             // Fallback to home or 404
             console.warn(`No route found for ${pathname}`);
        }
    }
    
    init() {
        this.resolve(window.location.pathname);
    }
}

export const router = new Router();
