# Chasse aux Renards

A simple application to help children track rewards.

## Development

This project uses Vite for the development server and Firebase for the backend. The Firebase backend can be run locally using the Firebase Emulator Suite.

### Prerequisites

- [Node.js](https://nodejs.org/) (which includes npm)
- [Firebase CLI](https://firebase.google.com/docs/cli#install_the_cli)

### First-time Setup

1.  Install project dependencies:
    ```bash
    npm install
    ```

### Local Development Workflow

The intended workflow is to create users by interacting with the app, and then seed the database with data for those users.

1.  **Start the Firebase Emulator:**
    This will start the local Firebase services.
    ```bash
    npm run emulator
    ```

2.  **Start the Development Server:**
    In a **new terminal window**, start the Vite development server.
    ```bash
    npm run dev
    ```

3.  **Seed the Database:**
    Once the emulators are running, run the seed script in a **new terminal window**. This script will automatically create the test users in the Auth emulator and populate the database with their corresponding boards and rewards.

    ```bash
    npm run seed
    ```

    The following users will be created:
    *   `john.doe@example.com` (parent)
    *   `jane.doe@example.com` (child)
    *   `jimmy.doe@example.com` (child)

After seeding, you can refresh the app. The users will now have their data loaded correctly. You only need to run the seed script once. The emulator will persist the data for subsequent sessions.
