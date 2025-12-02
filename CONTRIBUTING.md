# Contributing to FUTHERO Desktop

Thank you for your interest in contributing!
FUTHERO Desktop is an open-source launcher focused on performance, security, and a smooth desktop experience.
We welcome contributions of all kinds — bug fixes, improvements, new features, documentation, and security reviews.

By contributing, you agree to follow our Code of Conduct and Security Policy.

---

## 📌 How to Contribute

### 1. Reporting Bugs
Before reporting a bug:
- Check existing issues to avoid duplicates.

When opening a new issue, please include:
- Clear and descriptive title
- Steps to reproduce
- Expected vs. actual behavior
- OS and Electron version (if known)
- Logs or screenshots (if applicable)

---

### 2. Suggesting Enhancements
Feature requests are welcome!

When suggesting a new idea:
- Check if it already exists
- Describe the feature clearly
- Explain why it benefits the project
- Provide examples or mockups if possible

---

## 🧩 Code Contributions

We follow a simple Git workflow.

### Prerequisites
- Follow the installation steps in the `README.md`
- Understand the basics of our **Security Architecture**:
  - Context Isolation enabled
  - Sandboxed renderers
  - IPC strictly controlled via `contextBridge`

---

### 🔧 Steps to Contribute

1. **Fork** the repository  
2. **Clone** your fork  
3. Create a new branch:  
   ```bash
   git checkout -b feature/my-feature
   ```  
   or  
   ```bash
   git checkout -b fix/123
   ```
4. **Make your changes**, following our security rules  
5. Test your changes locally using:  
   ```bash
   npm run dev
   ```
6. Commit with a clear message  
7. Push your branch:  
   ```bash
   git push origin feature/my-feature
   ```
8. Open a **Pull Request** to the main repository  

---

## 🧹 Code Style
- The project uses **TypeScript**
- Follow existing patterns and naming conventions
- Run build checks with:
  ```bash
  npm run build
  ```
- Keep code clean, readable, and minimal

---

## 🔒 Security Guidelines (Important)

Because FUTHERO Desktop loads external content and interacts with system-level features, all contributions must prioritize security:

- **NEVER enable `nodeIntegration`**
- **NEVER expose Node.js modules directly to the renderer**
- **All renderer-to-main communication MUST use `contextBridge`**
- **APIs must be small, explicit, and validated**
- **Sensitive logic must remain in the main process**

If unsure about any security concern, ask in the discussion before submitting a PR.

---

## 🎉 Thank You!
Your contributions — whether small or large — help move the project forward and make the launcher safer and better for everyone.
