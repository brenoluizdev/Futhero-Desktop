# Contributing to Bonk.io Secure Launcher

We welcome contributions from the community to help improve the Bonk.io Secure Launcher. By participating in this project, you agree to abide by our code of conduct.

## How to Contribute

### 1. Reporting Bugs

If you find a bug, please check the existing issues to see if it has already been reported. If not, open a new issue and include the following information:

*   A clear and descriptive title.
*   The steps to reproduce the bug.
*   The expected behavior.
*   The actual behavior.
*   Your operating system and Electron version (if known).

### 2. Suggesting Enhancements

We are always looking for new features and improvements. Before submitting a feature request, please check the existing issues to avoid duplication. When suggesting an enhancement, clearly describe the proposed feature and why it would be valuable to the launcher.

### 3. Code Contributions

We follow a standard Git workflow for code contributions.

#### Prerequisites

*   Ensure you have completed the [Installation and Setup] in the `README.md`.
*   Familiarize yourself with the project's **Security Architecture**, especially the separation between the main process, preload script, and frontend mod.

#### Steps for Code Contribution

1.  **Fork** the repository.
2.  **Clone** your forked repository locally.
3.  **Create a new branch** for your feature or fix:
    \`\`\`bash
    git checkout -b feature/your-feature-name
    \`\`\`
    or
    \`\`\`bash
    git checkout -b fix/issue-number
    \`\`\`
4.  **Make your changes.** Ensure that any changes to the core Electron files (`src/main.ts`, `src/preload.ts`) adhere to the **security best practices** of Electron (Context Isolation, Sandboxing).
5.  **Test your changes** thoroughly using `npm run dev`.
6.  **Commit your changes** with a clear and descriptive commit message.
7.  **Push** your branch to your fork.
8.  **Open a Pull Request (PR)** to the main repository.

#### Code Style

*   We use **TypeScript** for the main application logic.
*   Please adhere to the existing code style and use clear, descriptive variable names.
*   Ensure your code compiles without errors by running `npm run build`.

## Security Policy

Given that this application loads remote content, security is paramount. All contributions must be reviewed with a focus on maintaining the integrity of the **Context Isolation** and **Sandboxing** features.

*   **NEVER** enable `nodeIntegration` for the web content.
*   **NEVER** expose unnecessary APIs from the main process to the preload script or the web content.
*   All communication between the web content and the main process **MUST** go through the secure `contextBridge` API.

Thank you for helping to make this launcher better and more secure!
