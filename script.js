
    // ==========================================
// 1. NAVEGAÇÃO ENTRE ABAS PRINCIPAIS
// ==========================================
function openTab(btnElement, tabId) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');
    if (btnElement) btnElement.classList.add('active');

    if (tabId !== 'tab-robotica') {
        pararTransmissao();
    }
}

// ==========================================
// 2. CARROSSEL / SLIDES (ABA PROGRAMAÇÃO)
// ==========================================
let currentSlideIndex = 0;
let slideInterval = null;

function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    if (slides.length === 0) return;

    if (index >= slides.length) {
        currentSlideIndex = 0;
    } else if (index < 0) {
        currentSlideIndex = slides.length - 1;
    } else {
        currentSlideIndex = index;
    }

    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slides[currentSlideIndex].classList.add('active');
    if (dots[currentSlideIndex]) {
        dots[currentSlideIndex].classList.add('active');
    }
}

function moveSlide(direction) {
    showSlide(currentSlideIndex + direction);
    resetTimer();
}

function setSlide(index) {
    showSlide(index);
    resetTimer();
}

function startTimer() {
    slideInterval = setInterval(() => {
        moveSlide(1);
    }, 5500);
}

function resetTimer() {
    clearInterval(slideInterval);
    startTimer();
}

// ==========================================
// 3. MATRIZ DE LEDS 5x5 INTERATIVA (PARTE B)
// ==========================================
const MATRIX_PATTERNS = {
    feliz: {
        label: "Símbolo: Alegria / Bem-estar",
        grid: [
            0,1,0,1,0,
            0,1,0,1,0,
            0,0,0,0,0,
            1,0,0,0,1,
            0,1,1,1,0
        ]
    },
    alerta: {
        label: "Símbolo: Atenção / Aviso (!)",
        grid: [
            0,0,1,0,0,
            0,0,1,0,0,
            0,0,1,0,0,
            0,0,0,0,0,
            0,0,1,0,0
        ]
    },
    ajuda: {
        label: "Símbolo: Socorro / Atendimento (+)",
        grid: [
            0,0,1,0,0,
            0,0,1,0,0,
            1,1,1,1,1,
            0,0,1,0,0,
            0,0,1,0,0
        ]
    },
    seta: {
        label: "Símbolo: Direção / Saída Acessível",
        grid: [
            0,0,1,0,0,
            0,0,0,1,0,
            1,1,1,1,1,
            0,0,0,1,0,
            0,0,1,0,0
        ]
    }
};

function renderMatrix(type) {
    const container = document.getElementById('led-matrix-grid');
    const caption = document.getElementById('matrix-label');
    if (!container || !MATRIX_PATTERNS[type]) return;

    const pattern = MATRIX_PATTERNS[type];
    container.innerHTML = '';

    pattern.grid.forEach(cell => {
        const dot = document.createElement('div');
        dot.className = cell === 1 ? 'matrix-dot on' : 'matrix-dot';
        container.appendChild(dot);
    });

    if (caption) caption.textContent = pattern.label;
}

// ==========================================
// 4. SIMULADOR DE MORSE: LED + BUZZER (PARTE C)
// ==========================================
const DICIONARIO_MORSE = {
    'A': '.-',   'B': '-...', 'C': '-.-.', 'D': '-..',  'E': '.',
    'F': '..-.', 'G': '--.',  'H': '....', 'I': '..',   'J': '.---',
    'K': '-.-',  'L': '.-..', 'M': '--',   'N': '-.',   'O': '---',
    'P': '.--.', 'Q': '--.-', 'R': '.-.',  'S': '...',  'T': '-',
    'U': '..-',  'V': '...-', 'W': '.--',  'X': '-..-', 'Y': '-.--',
    'Z': '--..', '0': '-----','1': '.----','2': '..---','3': '...--',
    '4': '....-','5': '.....','6': '-....','7': '--...','8': '---..',
    '9': '----.', ' ': '/'
};

let currentTransmissionId = 0;
let audioCtx = null;

function tocarBuzzer(duracaoMs) {
    const soundCheck = document.getElementById('buzzer-enabled');
    if (!soundCheck || !soundCheck.checked) return;

    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(680, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duracaoMs / 1000);
    } catch (e) {
        // Ignora caso o navegador bloqueie áudio
    }
}

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function limparTexto(texto) {
    return texto
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function converterParaMorse(texto) {
    const limpo = limparTexto(texto);
    return limpo
        .split('')
        .map(char => DICIONARIO_MORSE[char] || '')
        .filter(code => code !== '')
        .join(' ');
}

function pararTransmissao() {
    currentTransmissionId++;
    const led = document.getElementById('led-lamp');
    const status = document.getElementById('led-status');
    if (led) led.className = 'led-off';
    if (status) status.textContent = 'Circuito em Espera';
}

function transmitirInput() {
    const texto = document.getElementById('morse-input').value.trim();
    if (!texto) {
        alert("Digite uma palavra ou clique em uma das mensagens rápidas.");
        return;
    }
    iniciarTransmissao(texto);
}

async function iniciarTransmissao(texto) {
    currentTransmissionId++;
    const myId = currentTransmissionId;

    const inputEl = document.getElementById('morse-input');
    const outputEl = document.getElementById('morse-output');
    const led = document.getElementById('led-lamp');
    const status = document.getElementById('led-status');

    inputEl.value = texto;
    const codigoMorse = converterParaMorse(texto);

    if (!codigoMorse) {
        status.textContent = 'Digite letras ou números válidos.';
        outputEl.textContent = '—';
        return;
    }

    outputEl.textContent = codigoMorse.replace(/\./g, '•').replace(/-/g, '—');

    for (let i = 0; i < codigoMorse.length; i++) {
        if (myId !== currentTransmissionId) return;

        const simbolo = codigoMorse[i];

        if (simbolo === '.') {
            led.className = 'led-on';
            status.textContent = `Transmitindo "${texto.toUpperCase()}" — Pulso Curto (•)`;
            tocarBuzzer(200);
            await esperar(220);
            if (myId !== currentTransmissionId) return;
            led.className = 'led-off';
            await esperar(200);
        } else if (simbolo === '-') {
            led.className = 'led-on';
            status.textContent = `Transmitindo "${texto.toUpperCase()}" — Pulso Longo (—)`;
            tocarBuzzer(580);
            await esperar(600);
            if (myId !== currentTransmissionId) return;
            led.className = 'led-off';
            await esperar(200);
        } else if (simbolo === ' ') {
            await esperar(350);
        } else if (simbolo === '/') {
            await esperar(700);
        }
    }

    if (myId === currentTransmissionId) {
        led.className = 'led-off';
        status.textContent = `Transmissão de "${texto.toUpperCase()}" concluída!`;
    }
}

// ==========================================
// 5. DISPLAY LCD 16x2 SIMULADO (PARTE D)
// ==========================================
function setLcdMessage(line1, line2) {
    const l1 = document.getElementById('lcd-line-1');
    const l2 = document.getElementById('lcd-line-2');
    if (l1) l1.textContent = line1.padEnd(16, ' ').slice(0, 16);
    if (l2) l2.textContent = line2.padEnd(16, ' ').slice(0, 16);
}

// ==========================================
// INICIALIZAÇÃO DA PÁGINA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    showSlide(0);
    startTimer();
    renderMatrix('feliz');
});
