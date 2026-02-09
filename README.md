# <img src="public/renard-icon.svg" width="64" alt="Renard Icon" style="vertical-align: middle;"> Chasse aux Renards


> A digital reward board PWA built with **Lit** and Material 3 Design.

https://github.com/user-attachments/assets/0f09d1a9-3da9-4ffc-ba75-a837693d19e1


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
The choice of specific technologies was driven by a balance of standards and ergonomics. The project started with pure Vanilla Web Components but was migrated to **Lit** to reduce boilerplate while keeping the bundle size minimal and standard-compliant.

---

## 🛠 Technical Highlights

This project relies on modern web standards, avoiding heavy frontend frameworks.

### Standard-Based Architecture (Powered by Lit)
Instead of large frameworks like React or Angular, this application uses **Lit** to build lightweight, standard Web Components.

*   **Custom Elements**: Every UI piece, from the `renard-counter` to the `m3-button`, is a standard `HTMLElement` extended via `LitElement`.
*   **Shadow DOM**: Ensures true style encapsulation and modularity.
*   **Reactive Properties**: Declarative state management without the overhead of a virtual DOM for the entire app.

### Custom Material 3 Implementation
The app implements the **Google Material 3** design system from scratch:

*   **Design Tokens**: A comprehensive `style.css` maps M3 tokens (Systems Colors, Typography Typescales, Elevation, Motion) to CSS Variables.
*   **Theming**: Full support for Light and Dark modes using `prefers-color-scheme` and CSS `color-mix`.
*   **Components**: 16+ hand-crafted M3 components including Buttons, Cards, Dialogs, FABs, Menus, Text Fields, Date Pickers, and more.

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
    *   **Child 1**: `jane.doe@example.com`
    *   **Child 2**: `jimmy.doe@example.com`

---

## 🔌 MCP Integration (Model Context Protocol)

Instead of building a traditional "backoffice" UI for managing rewards, this project embraces a **chatbot-first approach** using the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/). Parents can manage rewards directly from their favorite AI assistant.

### Why MCP?

*   **No extra UI to build** — Let AI assistants handle CRUD operations via natural language.
*   **Works with multiple clients** — Use whichever chatbot you prefer.
*   **Conversational UX** — "Add a Nintendo Switch reward for Jimmy that costs 500 renards" is more intuitive than navigating forms.

### Compatibility

This MCP server uses **API key authentication** (Bearer token). It is compatible with any MCP client that supports custom headers for authentication (e.g., Claude Desktop, Mistral Le Chat). Clients that require OAuth2 are not currently supported.

### Setup

1. **Generate an API key** by navigating to `/mcp` in the app (hidden settings page).

![MCP Settings](https://github.com/user-attachments/assets/d1dbb8ad-3312-47a9-b61b-b77a3a59d249)

2. **Add the MCP server to your client config** (example for Claude Desktop):

```json
{
  "mcpServers": {
    "chasse-aux-renards": {
      "serverUrl": "https://europe-west9-la-chasse-aux-renards.cloudfunctions.net/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

3. **Start chatting!** Try commands like:
   - "List all reward boards"
   - "Add a 'Movie Night' reward for Jane that costs 20 renards"
   - "Delete the park reward from Jimmy's board"

![MCP Interaction](https://github.com/user-attachments/assets/59a2d95a-8261-42f7-a8fb-cbf61e2a51de)


### Available Tools

| Tool | Description |
|------|-------------|
| `list_boards` | List all reward boards you have access to |
| `list_rewards` | List rewards for a specific board |
| `add_reward` | Create a new reward (name, cost, icon) |
| `update_reward` | Modify an existing reward |
| `delete_reward` | Remove a reward from a board |

### Technical Details: HTTP-Only Transport

This MCP server uses **stateless HTTP-only transport** instead of Server-Sent Events (SSE). This design choice is driven by the **serverless deployment on Firebase Cloud Functions**:

*   **No persistent connections** — Each request is independent, avoiding idle connection costs.
*   **JSON responses** — The server returns JSON directly instead of opening SSE streams.
*   **GET requests rejected** — Only POST requests are accepted (`405 Method Not Allowed` for GET).

This approach follows the MCP HTTP transport specification, though it requires a client capable of sending custom authentication headers (API keys).