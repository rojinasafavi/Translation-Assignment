# Vocalize - Live Voice Translator

Vocalize is a real-time, low-latency web application that listens to your live voice and instantly translates it between English and Finnish. 

Built entirely with frontend technologies (HTML, CSS, JavaScript), it leverages the browser's native Web Speech API for continuous voice recognition and seamlessly translates the text on-the-fly. The project features a stunning, premium UI with a modern glassmorphism design.

## ✨ Features

- **Real-Time Live Translation:** Translates your speech dynamically as you talk, updating the text with zero perceptible delays.
- **Bi-Directional Support:** Easily toggle between **English ➔ Finnish** and **Finnish ➔ English** translation modes.
- **Live Voice Input:** Listens directly from your microphone and processes continuous speech chunks.
- **Instant Text Output:** Displays both your original recognized speech and the live translated output simultaneously.
- **Smart Auto-Correction:** The application handles interim speech results, meaning it can contextually correct the translation as you finish your sentence.
- **Modern UI/UX:** A visually captivating clean green and white theme featuring glass panels, smooth color gradients, and pulsing state animations.

## 🚀 How to Run

Since Vocalize is a lightweight, client-side application, running it is incredibly simple:

1. Clone or download this repository.
2. Open the project folder (`translation_app`).
3. If you have an active local server (like `npx serve`), navigate to the local URL (e.g., `http://localhost:3000`).
4. Alternatively, you can simply double-click on `index.html` to open it in your browser.
5. Grant the browser permission to use your microphone when prompted.
6. Click the glowing microphone button and start speaking!

> **Note:** For the best experience and compatibility with the Web Speech API, it is highly recommended to use **Google Chrome** or **Microsoft Edge**.

## 🛠️ Technologies Used

- **HTML5:** Structure and semantics.
- **CSS3:** Styling, variables, animations, and glassmorphism UI.
- **JavaScript (ES6):** Logic for DOM manipulation, Web Speech API integration, and asynchronous data fetching.
- **Google Translate API:** Used for instantaneous translations under the hood.
