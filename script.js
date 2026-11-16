// ==========================================
// 1. NAVEGAÇÃO ENTRE ABAS
// ==========================================
function openTab(btnElement, tabId) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');
    if (btnElement) btnElement.classList.add('active');

    if (tabId !== 'tab-fisica') {
        pararTransmissao();
    }
}

// ==========================================
// 2. CARROSSEL / SLIDES DOS PROJETOS
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

document.addEventListener('DOMContentLoaded', () => {
    showSlide(0);
    startTimer();
});

// ==========================================
// 3. SIMULADOR DE FÍSICA: LED + CÓDIGO MORSE
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
    if (status) status.textContent = 'Painel em Espera';
}

function transmitirInput() {
    const texto = document.getElementById('morse-input').value.trim();
    if (!texto) {
        alert("Digite uma palavra ou clique em uma das frases rápidas.");
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
            await esperar(220);
            if (myId !== currentTransmissionId) return;
            led.className = 'led-off';
            await esperar(200);
        } else if (simbolo === '-') {
            led.className = 'led-on';
            status.textContent = `Transmitindo "${texto.toUpperCase()}" — Pulso Longo (—)`;
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
