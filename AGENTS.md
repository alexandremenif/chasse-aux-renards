# Project Context for AI Agents

## Project Overview
**Name**: Chasse aux Renards
**Description**: A reward tracking application for children.
**Architecture**: Single Page Application (SPA) using Vanilla JavaScript and Vite, backed by Firebase.

## Technology Stack
- **Runtime**: Node.js
- **Build Tool**: Vite
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Backend / BaaS**: Firebase
  - **Authentication**: Google Auth (Emulator)
  - **Database**: Cloud Firestore
  - **Hosting**: Firebase Hosting
- **Local Environment**: Firebase Emulator Suite

## Directory Structure
- `src/`: Application source code
  - `components/`: Reusable UI components
  - `services/`: Data access and business logic (e.g., `user-service.js`)
  - `firebase.js`: Firebase app initialization
  - `main.js`: Application entry point
- `scripts/`: Backend/Maintenance scripts
  - `seed.js`: Database seeding script
- `firebase-emulator-data/`: Persisted emulator state

## Development Workflow
See [README.md](./README.md) for detailed instructions on starting the environment and seeding data.

## Coding Guidelines

### Web Components
- **Framework-Free**: This project uses **native Web Components** (Vanilla JS). Do not introduce frameworks like React, Vue, or Lit.
- **Structure**: Components extend `HTMLElement` and are registered with `customElements.define`.
- **Shadow DOM**: Use `attachShadow({ mode: 'open' })` for style encapsulation.
- **Lifecycle**: Use `connectedCallback` for setup (listeners, initial render) and `disconnectedCallback` for cleanup.
- **Naming**: Use kebab-case for component tags (e.g., `renard-app`).

### Styling
- **Scoped CSS**: Styles should be defined within the component's Shadow DOM (inside a `<style>` tag in the `innerHTML`).
- **Global Styles**: Only use `style.css` for truly global variables (CSS custom properties) or reset styles.

### State Management & Events
- **Services**: Use singleton services (e.g., `user-service.js`) for shared state and business logic.
- **Events**: Use native `CustomEvent` for child-to-parent communication.
- **Observables**: Services may expose methods to subscribe to state changes (e.g., `onUserChanged`).

### Firebase
- **Modular SDK**: Use the modular functional syntax (e.g., `getAuth()`, `doc()`, `getDoc()`).
- **Emulators**: Ensure code works with the local emulator suite.

### Code Hygiene
- **Minimal Changes**: Avoid irrelevant changes (e.g., formatting, style tweaks, or comment updates) in files or sections unrelated to the current task.
- **Comments**:
  - Do NOT leave "process" comments (e.g., `// Changed this because...`, `// TODO: Fix later`).
  - Only write comments that explain the *why* or *how* of complex logic.
  - Remove commented-out code.

## Important Files
- `package.json`: Dependency management and scripts.
- `firebase.json`: Firebase configuration (emulators, hosting).
- `scripts/seed.js`: Logic for populating the database. Crucial for setting up a testable state.
