# Bonk.io Secure Launcher

## Overview

This project is a secure desktop launcher for the popular web game **bonk.io**, built using **Electron**, **TypeScript**, and **Node.js**. Its primary function is to provide a secure environment for playing the game while allowing for **frontend manipulation**, similar to a browser extension, to enhance the user experience.

The launcher is configured for easy packaging and submission to the **Microsoft Store** using the AppX format via `electron-builder`.

## Features

*   **Secure Architecture:** Implements Electron's best practices, including **Context Isolation** and **Sandboxing**, to safely load the remote `bonk.io` content.
*   **Frontend Modding:** Uses a secure preload script to inject custom JavaScript (`frontend-mod.js`) into the game's web context, enabling safe frontend manipulation without exposing Node.js APIs.
*   **TypeScript:** Provides type safety and better maintainability for the main application logic.
*   **Microsoft Store Ready:** Pre-configured with `electron-builder` for AppX packaging.

## Prerequisites

To run and build this application, you need:

*   Node.js (LTS version recommended)
*   npm (comes with Node.js)

## Installation and Setup

1.  **Clone the repository (or navigate to the project directory):**
    \`\`\`bash
    cd bonk-launcher
    \`\`\`

2.  **Install dependencies:**
    \`\`\`bash
    npm install
    \`\`\`

## Running the Application

### Development Mode

Use `ts-node` to run the application directly from the TypeScript source files.

\`\`\`bash
npm run dev
\`\`\`

### Production Build (Testing)

First, compile the TypeScript code to JavaScript:

\`\`\`bash
npm run build
\`\`\`

Then, run the compiled application:

\`\`\`bash
npm start
\`\`\`

## Security Architecture

The application is designed around the principle of isolating untrusted remote content (`bonk.io`) from the powerful Node.js environment.

| Component | File | Role | Security Measures |
| :--- | :--- | :--- | :--- |
| **Main Process** | `src/main.ts` | Manages the application window and lifecycle. | **Sandboxing** and **Context Isolation** are enabled. |
| **Preload Script** | `src/preload.ts` | Secure bridge between the main process and the web content. | **Context Isolation** prevents the web content from accessing Node.js APIs. |
| **Frontend Mod** | `frontend-mod.js` | Contains the custom frontend manipulation logic. | Executed in the web context, communicating with the launcher only via a limited, exposed API (`contextBridge`). |

## Frontend Manipulation (`frontend-mod.js`)

The `frontend-mod.js` file is where you will write your custom modifications. It is a standard JavaScript file that has full access to the `bonk.io` DOM.

**Key Communication Point:**

To securely communicate back to the Electron main process (e.g., to save settings or trigger a native notification), use the exposed API:

\`\`\`javascript
// Example call from frontend-mod.js
if (window.bonkLauncherAPI) {
    window.bonkLauncherAPI.sendNotification('A custom event occurred in the game!');
}
\`\`\`

## Microsoft Store Publishing (AppX)

The `package.json` is configured to use `electron-builder` to generate the **AppX** package required for the Microsoft Store.

**Important:** Before building the final package, you **MUST** replace the placeholder values in the `build.appx` section of `package.json` with your actual developer information obtained from the Microsoft Partner Center:

```json
"appx": {
  "publisher": "CN=YourPublisherID",
  "publisherDisplayName": "Your Publisher Name",
  "applicationId": "YourIdentityName"
}
```

To generate the AppX package (requires Windows SDK and proper setup):

```bash
npm run dist
```

## References

[1] Electron. (n.d.). *Security*. Retrieved from https://electronjs.org/docs/latest/tutorial/security
