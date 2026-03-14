// Check for browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    alert('Your browser does not support the Web Speech API.');
}

const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

// DOM Elements
const micBtn = document.getElementById('mic-btn');
const langToggle = document.getElementById('lang-toggle');
const leftLabel = document.getElementById('lang-left');
const rightLabel = document.getElementById('lang-right');
const statusText = document.getElementById('status-text');
const subtitlesDisplay = document.getElementById('subtitles-display');
const userVideo = document.getElementById('user-video');

// State
let isListening = false;
let currentMode = 'en-fi'; // 'en-fi' or 'fi-en'
let finalIndex = 0;
let finalTranslations = []; 
let lastInterimTranslation = '';
let mediaStream = null;

updateMode();

langToggle.addEventListener('change', () => {
    const wasListening = isListening;
    if (wasListening) stopListening();
    
    currentMode = langToggle.checked ? 'fi-en' : 'en-fi';
    updateMode();
    
    // Clear subtitles
    subtitlesDisplay.innerHTML = '';
    finalIndex = 0;
    finalTranslations = [];
    lastInterimTranslation = '';
    
    if (wasListening) {
        setTimeout(() => startListening(), 300);
    }
});

function updateMode() {
    if (currentMode === 'en-fi') {
        recognition.lang = 'en-US';
        leftLabel.classList.add('active-left');
        rightLabel.classList.remove('active-right');
        if (isListening) micBtn.classList.remove('fi-mode');
    } else {
        recognition.lang = 'fi-FI';
        leftLabel.classList.remove('active-left');
        rightLabel.classList.add('active-right');
        if (isListening) micBtn.classList.add('fi-mode');
    }
}

micBtn.addEventListener('click', () => {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
});

async function startVideo() {
    try {
        if (!mediaStream) {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            userVideo.srcObject = mediaStream;
        }
    } catch (err) {
        console.error("Error accessing camera:", err);
        statusText.textContent = "Camera access denied. Video disabled.";
    }
}

function stopVideo() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        userVideo.srcObject = null;
        mediaStream = null;
    }
}

async function startListening() {
    try {
        await startVideo();
        recognition.start();
        isListening = true;
        micBtn.classList.add('listening');
        if (currentMode === 'fi-en') micBtn.classList.add('fi-mode');
        
        statusText.textContent = 'Listening and translating in real-time...';
        statusText.classList.add('active');
        
        if (finalTranslations.length === 0 && !lastInterimTranslation) {
            subtitlesDisplay.innerHTML = '';
        }
    } catch (e) {
        console.error(e);
        statusText.textContent = 'Error starting microphone';
    }
}

function stopListening() {
    recognition.stop();
    stopVideo();
    isListening = false;
    micBtn.classList.remove('listening');
    micBtn.classList.remove('fi-mode');
    statusText.textContent = 'Click the mic to start listening and view camera';
    statusText.classList.remove('active');
}

recognition.onend = () => {
    if (isListening) {
        try {
            recognition.start();
        } catch(e) {
            console.error("Failed to restart", e);
        }
    }
};

recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
    if (event.error === 'not-allowed') {
        stopListening();
        statusText.textContent = 'Microphone access denied. Please allow it.';
    }
};

recognition.onresult = (event) => {
    let interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
            translateChunk(transcript, finalIndex);
            finalIndex++;
        } else {
            interimTranscript += transcript;
        }
    }

    if (interimTranscript) {
        debounceTranslateInterim(interimTranscript);
    } else {
        lastInterimTranslation = '';
        updateSubtitlesUI();
    }
};

function translateChunk(text, index) {
    const sourceLang = currentMode === 'en-fi' ? 'en' : 'fi';
    const targetLang = currentMode === 'en-fi' ? 'fi' : 'en';
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const translatedText = data[0].map(item => item[0]).join('');
            finalTranslations[index] = translatedText + ' ';
            updateSubtitlesUI();
        })
        .catch(err => console.error(err));
}

let translateTimeout;
let currentInterimRequest = null;

function debounceTranslateInterim(text) {
    clearTimeout(translateTimeout);
    translateTimeout = setTimeout(() => {
        const sourceLang = currentMode === 'en-fi' ? 'en' : 'fi';
        const targetLang = currentMode === 'en-fi' ? 'fi' : 'en';
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        
        if (currentInterimRequest) currentInterimRequest.abort();
        const controller = new AbortController();
        currentInterimRequest = controller;

        fetch(url, { signal: controller.signal })
            .then(res => res.json())
            .then(data => {
                lastInterimTranslation = data[0].map(item => item[0]).join('');
                updateSubtitlesUI();
            })
            .catch(err => {
                if (err.name !== 'AbortError') console.error(err);
            });
    }, 250);
}

function updateSubtitlesUI() {
    let html = '';
    const recentFinals = finalTranslations.filter(t => t).slice(-2);
    
    if (recentFinals.length > 0) {
        html += `<span class="subtitle-line">${recentFinals.join(' ')}</span>`;
    }
    
    if (lastInterimTranslation) {
        html += `<span class="subtitle-line interim-sub">${lastInterimTranslation}</span>`;
    }
    
    subtitlesDisplay.innerHTML = html;
}
