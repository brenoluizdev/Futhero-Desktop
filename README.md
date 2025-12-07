[![Watch the video](https://github.com/brenoluizdev/Futhero-Desktop/blob/main/assets/images/banner.png?raw=true)](https://youtu.be/c8OFBn18QJA)

Youtube video: https://www.youtube.com/watch?v=c8OFBn18QJA&t=80s

# ⚡ Futhero – Bonk.io & Haxball Secure Launcher

### A Safe, Fast, and Enhanced Desktop Experience for **Bonk.io** and **Haxball**

---

## 🧩 Overview

**Futhero Secure Launcher** is a modern desktop application built with **Electron**, **TypeScript**, and **Node.js**, designed to provide a **secure and optimized environment** for the web games [**Bonk.io**](https://bonk.io) and [**Haxball.com**](https://haxball.com).  

It acts as a **dedicated launcher** that improves performance, reduces ping, and allows safe **frontend customization**—similar to a browser extension—while maintaining strict security and isolation standards.

This launcher is also **Microsoft Store ready**, with packaging handled via **AppX** format using `electron-builder`.

---

## ✨ Features

✅ **Dual Game Support** – Seamlessly launch and play **Bonk.io** or **Haxball.com** from a single application.  
🔒 **Secure Architecture** – Implements Electron’s best practices, including **Context Isolation**, **Sandboxing**, and **disabled Node Integration** for web content.  
🧠 **Frontend Modding** – Safely injects custom JavaScript (`frontend-mod.js`) into the game’s context for UI enhancements or automation.  
⚡ **Reduced Ping & Improved Stability** – Runs independently from traditional browsers, providing a smoother and faster connection.  
🛠️ **TypeScript-Powered** – Ensures cleaner, type-safe, and scalable development.  
🏬 **Microsoft Store Ready** – Fully configured for **AppX** packaging and distribution via the Microsoft Store.  

---

## ⚙️ Prerequisites

Before starting, make sure you have:

- **Node.js (LTS version recommended)**  
- **npm** (included with Node.js)

---

## 📦 Installation

1. **Clone the repository (or navigate to your project folder):**
   ```bash
   git clone https://github.com/brenoluizdev/Futhero-Desktop.git
   cd futhero-desktop
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

---

## ▶️ Running the Application

### Development Mode
Run the app directly from the TypeScript source:
```bash
npm run dev
```

### Production Build
Compile and run the optimized version:
```bash
npm run build
npm start
```

---

## 🧠 Security Architecture

The application is built around isolating untrusted web content (**Bonk.io** or **Haxball**) from the powerful Node.js environment.

| Component | File | Role | Security Measures |
| :--- | :--- | :--- | :--- |
| **Main Process** | `src/main.ts` | Controls the app lifecycle and windows | Sandboxing and context isolation enabled |
| **Preload Script** | `src/preload.ts` | Secure communication bridge between renderer and main | Prevents direct access to Node APIs |
| **Frontend Mod** | `frontend-mod.js` | Custom UI scripts for Bonk.io/Haxball | Executed in the isolated web context |

---

## 🎮 Frontend Modding

The `frontend-mod.js` file is where you can add your custom scripts for either **Bonk.io** or **Haxball**.  
These scripts run directly within the game’s DOM but communicate securely with the launcher through the `contextBridge` API.

**Example:**
```javascript
if (window.futheroAPI) {
  window.futheroAPI.sendNotification("Custom event triggered in Bonk.io!");
}
```

---

## 🏬 Microsoft Store Publishing (AppX)

The project is configured to build an **AppX** package using `electron-builder`.

Before generating the final package, update your publisher details in `package.json`:

```json
"appx": {
  "publisher": "CN=YourPublisherID",
  "publisherDisplayName": "Your Publisher Name",
  "applicationId": "YourAppIdentity"
}
```

Then run:
```bash
npm run dist
```

---

## 🌐 Independent Mode (No Browser Required)

Unlike traditional browser-based gameplay, **Futhero** runs the official **Bonk.io** and **Haxball.com** pages inside a secure Electron window.  
This ensures:

- Lower ping and faster load times  
- A distraction-free gaming environment  
- Continued support for original game analytics (views and metrics still count for the official sites)  
- Enhanced security with no third-party browser extensions or ads  

---

## 🧩 Folder Structure

```
Futhero-Launcher/
├── src/
│   ├── main.ts          # Main Electron process
│   ├── preload.ts       # Secure preload communication
│   ├── renderer/        # UI files (React or HTML)
│   └── utils/           # Utility functions
├── assets/              # Icons, logos, and static assets
├── frontend-mod.js      # Game modification scripts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 💡 Technologies Used

- [Electron](https://www.electronjs.org/) – Cross-platform desktop framework  
- [TypeScript](https://www.typescriptlang.org/) – Type-safe JavaScript  
- [Node.js](https://nodejs.org/) – Backend runtime  
- [Electron Builder](https://www.electron.build/) – Packaging and distribution  

---

## 🧑‍💻 Author

Developed with ❤️ by **Breno (BonkTools Developer)**  
> Aiming to make Bonk.io and Haxball faster, safer, and more enjoyable for everyone.

---

## 📜 License

This project is licensed under the **MIT License**.  
Feel free to modify, fork, and contribute!
