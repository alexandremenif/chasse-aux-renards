# <img src="public/renard-icon.svg" width="64" alt="Renard Icon" style="vertical-align: middle;"> Chasse aux Renards

> A digital reward board PWA built with Native Web Components and Material 3 Design.

**Chasse aux Renards** re-imagines the classic "token economy" reward system for children as a modern, interactive Progressive Web App (PWA). It replaces cardboard charts and physical tokens with a delightful digital experience, featuring animated counting mechanics and a parent-managed reward store.

---

## ✨ Functional Overview

The application gamifies positive reinforcement through a "Fox Token" (*Renard*) economy.

### 🪙 The Economy of "Renards"
The core interface is a visualized counter that helps children grasp numbers and savings through a tiered system:

*   **Units (Bronze)**: Basic currency.
*   **Tens (Silver)**: Reaching 10 units triggers a celebration, converting them into a Silver stack.
*   **Hundreds (Gold)**: Ten Silver stacks merge into a Gold stack.

**Gamified Delight**: The app features custom particle animations where tokens physically "fly" from one container to another when a threshold is reached, providing immediate visual feedback for saving progress.

### 🎁 Reward Store
*   **For Kids**: Children can browse a catalog of rewards (activities, gifts). If they have enough "Renards", they can select a reward (e.g., "Movie Night").
*   **Pending State**: Selected rewards are marked as "Pending" until approved.
*   **For Parents**: Parents act as the bank. They review pending requests and "confirm" them, which permanently deducts the cost from the child's balance.

---

## 🤖 AI-Driven Development

This project represents a modern **AI-Assisted workflow**, leveraging LLMs to accelerate development while maintaining strict architectural control.

1.  **Prototyping**: Initial concepts and rapid prototyping were generated using the **Gemini App**, allowing for quick iteration on the "Token Economy" logic.
2.  **Implementation**: The codebase was scaffolded and refined using AI agents in **Project IDX (Firebase Studio)**.
3.  **Refactoring & Features**: Complex architectural changes and specific feature implementations were handled by **Google Antigravity**.

**Impact on Architecture**:
The choice of Native Web Components often comes with a trade-offs regarding boilerplate. However, in this project, the boilerplate overhead was effectively nullified by the AI workflow, which handled the verbose syntactical requirements of the DOM API. This allowed the focus to remain on the *design* of the components rather than the *typing* of them.

---

## 🛠 Technical Highlights

This project relies purely on modern web standards, avoiding heavy frontend frameworks.

### Standard-Based Architecture (No Framework)
Instead of React, Vue, or Angular, this application uses **Vanilla JavaScript** and **Native Web Components**.

*   **Custom Elements**: Every UI piece, from the `renard-counter` to the `m3-button`, is a standard `HTMLElement` with its own Shadow DOM.
*   **Shadow DOM**: Ensures true style encapsulation and modularity.
*   **Lifecycle Management**: Manual handling of `connectedCallback` and `attributeChangedCallback` for granular performance control.

### Custom Material 3 Implementation
The app implements the **Google Material 3** design system from scratch:

*   **Design Tokens**: A comprehensive `style.css` maps M3 tokens (Systems Colors, Typography Typescales, Elevation, Motion) to CSS Variables.
*   **Theming**: Full support for Light and Dark modes using `prefers-color-scheme` and CSS `color-mix`.
*   **Components**: Hand-crafted implementations of M3 Cards, Ripples, Dialogs, and FABs that adhere to the spec.

### Backend & Security (Firebase)
*   **Firestore**: Real-time database synchronizes the token count across devices instantly.
*   **Role-Based Security**: Robust `firestore.rules` enforce business logic at the database level:
    *   **Parents**: Full read/write access.
    *   **Children**: can *read* their data but have restricted *write* access (e.g., they can request a reward, but cannot modify the token count or delete items).

### PWA (Progressive Web App)
Built with **Vite**, the app is installable on iOS and Android, offering a native-app-like experience with offline capabilities and a responsive mobile-first layout.

---

## 🏗 Development

The project is powered by **Vite** for the build tooling and **Firebase** for backend services.

### Prerequisites

*   Node.js & npm
*   Firebase CLI

### Quick Start

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the local environment**:
    This command starts the Firebase Emulator (database & hosting) and autoseeds it with test data, while launching the Vite dev server.
    ```bash
    npm run emulator
    npm run dev  # In a separate terminal
    ```

3.  **Test Users**:
    *   **Parent**: `john.doe@example.com`
    *   **Child**: `jane.doe@example.com`

---

## 🔍 Implementation Analysis

*(Self-Review for Portfolio Context)*

**Strengths**:
*   **Performance**: Zero framework overhead leads to an extremely small bundle size and fast TTI (Time to Interactive).
*   **Modern Workflow**: Demonstrates how AI tools can make "legacy" or "verbose" technologies (like raw DOM APIs) highly productive again.
*   **Longevity**: The resulting code is standard-compliant and dependency-free. This is critical for a "family app" intended to last for years with **zero maintenance**, immune to the "framework rot" that plagues modern stacks.

**Challenges & Trade-offs**:
*   **Boilerplate**: Native components are historically verbose. *Mitigation: AI tooling generated 90% of the boilerplate structures.*
*   **Complexity**: Manually managing DOM updates increases the risk of desync bugs compared to declarative frameworks, though it offers tighter control over animations.
