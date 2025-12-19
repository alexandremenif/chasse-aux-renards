# Project Context for AI Agents

## Project Overview
**Name**: Chasse aux Renards
**Description**: A reward tracking application for children.
**Architecture**: Single Page Application (SPA) using **Lit** and Vite, backed by Firebase.

## Technology Stack
- **Runtime**: Node.js
- **Build Tool**: Vite
- **Frontend**: **Lit** (Lightweight Web Component library), HTML, CSS
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
- **Framework**: This project uses **Lit** (`LitElement`) to build Web Components.
- **Lifecycle**: Use Lit's reactive lifecycle (`willUpdate`, `updated` for side effects) and `render()` for declarative UI.
- **Naming**: Use kebab-case for component tags (e.g., `renard-app`).

### Styling
- **Methods**: Use Lit's `static styles = css` block.
- **Variables**: Use `var(--token)` for CSS variables.
- **Interpolation**: If interpolating JavaScript values into CSS (e.g., breakpoints), wrap them with `unsafeCSS()` carefully.

### State Management & Events
- **Internal State**: Use Lit's `static properties`.
  - `{ type: Object/Boolean/String }` for reactive public properties.
  - `{ state: true }` for internal reactive state.
  - Use **private fields** (`#field`, `#method`) for ANY internal state, helpers, or handlers that are not part of the reactive public API. Do NOT use `_` prefix.
- **Services**: Use singleton services (e.g., `user-service.js`) for shared state and business logic.
- **Events**: Use `this.dispatchEvent(new CustomEvent(...))` for child-to-parent communication.
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
