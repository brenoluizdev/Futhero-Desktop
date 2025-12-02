# Security Policy

The FUTHERO Desktop project takes security seriously. Because this application interacts with external web content, native system APIs, and Electron processes, every contribution must respect strict security guidelines.

## 🔐 Reporting a Vulnerability

If you discover a security issue, **do NOT open a public issue**.

Instead, report it privately via:

- Email: **futhero.contact@gmail.com**
- Discord DM to a maintainer

Please include:
- A detailed description of the vulnerability  
- Steps to reproduce  
- Your environment (OS, steps, version)  
- Any potential impact  

We will respond as quickly as possible.

---

## 🛡️ Security Requirements for Contributions

All code changes **must** preserve the fundamental security architecture of the project:

### ✔ Electron Best Practices
- **Context Isolation must stay enabled**
- **Sandbox must stay enabled**
- `nodeIntegration` must remain **disabled**
- No untrusted scripts or remote code execution paths may be introduced

### ✔ Preload & IPC Rules
- Only minimal, tightly scoped APIs may be exposed through the **contextBridge**
- No sensitive operations may be performed in the renderer
- All IPC channels must be explicit, validated, and documented
- Never expose Node.js primitives or file system access directly to the WebView or renderer

### ✔ WebView Rules
- WebViews must remain sandboxed  
- Navigation, redirects, and external content must be validated  
- Any dynamic content loading requires review  

---

## 🔍 Code Review & Approval

Every Pull Request goes through **manual security review** before merging.  
Reviewers will check:

- If the code follows project security architecture  
- If new IPC channels or APIs are safe  
- If Electron best practices are followed  
- If the logic introduces any potential attack surface  
- If dependencies are safe  

**No code is merged without review.**

---

## ⚠️ Dependencies

- New dependencies require justification and review  
- Suspicious or unmaintained packages will not be accepted  
- Updates must not introduce known vulnerabilities  

---

## 🧪 Security Testing

Contributors are encouraged to test:
- Isolation between processes  
- Injection attempts  
- WebView restrictions  
- IPC validation  
- Unexpected input and malformed messages  

---

Security is a shared responsibility — thank you for helping keep FUTHERO Desktop safe and trustworthy.
