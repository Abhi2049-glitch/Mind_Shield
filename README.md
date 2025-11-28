# Mind_Shield
MindShield is an AI-powered Chrome Extension that acts as a "Cognitive Firewall" for your browser. Instead of just blocking bad URLs, it uses Google Gemini 2.0 to detect psychological manipulation—like Urgency, Fear, and False Authority—and highlights these triggers in real-time directly on the webpage.
# 🛡️ MindShield: Cognitive Security for the AI Era


## 🚨 The Problem
Traditional antivirus software protects your *computer*, but nothing protects your *mind*. 
Scammers have moved beyond simple malware; they now use **Social Engineering**—psychological manipulation tactics like **Urgency**, **Fear**, and **False Authority**—to bypass firewalls and hack humans directly.

## 💡 The Solution
**MindShield** is an AI-powered Chrome Extension that acts as a cognitive firewall. 
Instead of just checking blacklisted URLs, it uses **Google Gemini 2.0 Flash** to analyze the *semantic intent* of the text on your screen in real-time.

If it detects psychological manipulation, it:
1.  **Highlights the specific triggers** directly on the webpage (Red for Urgency, Yellow for Fear).
2.  **Explains the threat** via a popup dashboard.
3.  **Visualizes Safety** with a green protective border for safe sites.

## ⚙️ How It Works
1.  **Extraction:** The `content.js` script extracts visible text from the active tab.
2.  **Analysis:** The text is sent securely to the **Gemini 2.0 Flash API** with a specialized prompt designed to detect social engineering patterns.
3.  **Response:** Gemini returns a JSON object containing specific "trigger phrases" and their severity.
4.  **Injection:** The extension injects CSS and DOM elements to highlight these phrases in real-time, overlaying warnings directly on the scammer's text.

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3 (Custom Animations), JavaScript (ES6+)
* **AI Engine:** Google Gemini 2.0 Flash API
* **Platform:** Chrome Extension Manifest V3
* **Security:** Content Security Policy (CSP) compliant

## 📸 Features
* ✅ **Real-Time Page Scanning:** Scans entire websites with one click.
* ✅ **Text Analysis:** Analyze specific snippets of copied text.
* ✅ **Visual Feedback:** * 🔴 **Red/Yellow Highlights** for threats.
    * 🟢 **Green Glow** for verified safe content.
* ✅ **Privacy First:** No data is stored; analysis happens on-the-fly.

## 🚀 How to Run Locally
1.  Clone this repository.
2.  Open Chrome and navigate to `chrome://extensions`.
3.  Toggle **Developer Mode** (top right).
4.  Click **Load Unpacked** and select the project folder.
5.  Open any website (or the included `test_scam.html`) and click **"Scan Page"**.

---
*Built with ❤️ and ☕ by Abhinav Jha*
