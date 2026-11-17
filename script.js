document.addEventListener("DOMContentLoaded", function () {
    // ==========================================
    // 1. NAVEGAÇÃO ENTRE ABAS PRINCIPAIS
    // ==========================================
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            const targetId = btn.getAttribute("data-tab");

            tabButtons.forEach(function (b) { b.classList.remove("active"); });
            tabContents.forEach(function (c) { c.classList.remove("active"); });

            btn.classList.add("active");
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add("active");
            }

            if (targetId !== "tab-robotica") {
                pararTransmissao();
            }
        });
    });

    // ==========================================
    // 2. CARROSSEL / SLIDES (ABA PROGRAMAÇÃO)
    // ==========================================
    let currentSlideIndex = 0;
    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".dot");
    let slideTimer = null;

    function showSlide(index) {
        if (slides.length === 0) return;

        if (index >= slides.length) {
            currentSlideIndex = 0;
        } else if (index < 0) {
            currentSlideIndex = slides.length - 1;
        } else {
            currentSlideIndex = index;
        }

        slides.forEach(function (slide) { slide.classList.remove("active"); });
        dots.forEach(function (dot) { dot.classList.remove("active"); });

        slides[currentSlideIndex].classList.add("active");
        if (dots[currentSlideIndex]) {
            dots[currentSlideIndex].classList.add("active");
        }
    }

    function resetSlideTimer() {
        if (slideTimer) clearInterval(slideTimer);
        slideTimer = setInterval(function () {
            showSlide(currentSlideIndex + 1);
        }, 5500);
    }

    document.querySelectorAll("[data-slide-dir]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const dir = parseInt(btn.getAttribute("data-slide-dir"), 10);
            showSlide(currentSlideIndex + dir);
            resetSlideTimer();
        });
    });

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            const idx = parseInt(dot.getAttribute("data-slide-to"), 10);
            showSlide(idx);
            resetSlideTimer();
        });
    });

    showSlide(0);
    resetSlideTimer();

    // ==========================================
    // 3. MATRIZ DE LEDS 5x5 INTERATIVA (PARTE B)
    // ==========================================
    const MATRIX_PATTERNS = {
        feliz: {
            label: "Símbolo: Alegria / Bem-estar",
            grid: [
                0, 1, 0, 1, 0,
                0, 1, 0, 1, 0,
                0, 0, 0, 0, 0,
                1, 0, 0, 0, 1,
                0, 1, 1, 1, 0
            ]
        },
        alerta: {
            label: "Símbolo: Atenção / Aviso (!)",
            grid: [
                0, 0, 1, 0, 0,
                0, 0, 1, 0, 0,
                0, 0, 1, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 1, 0, 0
            ]
        },
        ajuda: {
            label: "Símbolo: Socorro / Atendimento (+)",
            grid: [
                0, 0, 1, 0, 0,
                0, 0, 1, 0, 0,
                1, 1, 1, 1, 1,
                0, 0, 1, 0, 0,
                0, 0, 1, 0, 0
            ]
        },
        seta: {
            label: "Símbolo: Direção / Saída Acessível",
            grid: [
                0, 0, 1, 0, 0,
                0, 0, 0, 1, 0,
                1, 1, 1, 1, 1,
                0, 0, 0, 1, 0,
                0, 0, 1, 0, 0
            ]
        }
    };

    function renderMatrix(type) {
        const container = document.getElementById("led-matrix-grid");
        const caption = document.getElementById("matrix-label");
        if (!container || !MATRIX_PATTERNS[type]) return;

        const pattern = MATRIX_PATTERNS[type];
        container.innerHTML = "";

        pattern.grid.forEach(function (cell) {
            const dot = document.createElement("div");
            dot.className = cell === 1 ? "matrix-dot on" : "matrix-dot";
            container.appendChild(dot);
        });

        if (caption) caption.textContent = pattern.label;
    }

    document.querySelectorAll("[data-matrix]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            renderMatrix(btn.getAttribute("data-matrix"));
        });
    });

    renderMatrix("feliz");

    // ==========================================
    // 4. SIMULADOR DE MORSE: LED + BUZZER (PARTE C)
    // ==========================================
    const DICIONARIO_MORSE = {
        "A": ".-",   "B": "-...", "C": "-.-.", "D": "-..",  "E": ".",
        "F": "..-.", "G": "--.",  "H": "....", "I": "..",   "J": ".---",
        "K": "-.-",  "L": ".-..", "M": "--",   "N": "-.",   "O": "---",
        "P": ".--.", "Q": "--.-", "R": ".-.",  "S": "...",  "T": "-",
        "U": "..-",  "V": "...-", "W": ".--",  "X": "-..-", "Y": "-.--",
        "Z": "--..", "0": "-----","1": ".----","2": "..---","3": "...--",
        "4": "....-","5": ".....","6": "-....","7": "--...","8": "---..",
        "9": "----.", " ": "/"
    };

    let currentTransmissionId = 0;
    let audioCtx = null;

    function tocarBuzzer(duracaoMs) {
        const soundCheck = document.getElementById("buzzer-enabled");
        if (!soundCheck || !soundCheck.checked) return;

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;

            if (!audioCtx) {
                audioCtx = new AudioContextClass();
            }
            if (audioCtx.state === "suspended") {
                audioCtx.resume();
            }

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(680, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duracaoMs / 1000);
        } catch (err) {
            // Continua o LED caso o navegador bloqueie áudio
        }
    }

    function esperar(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    function converterParaMorse(texto) {
        const limpo = texto
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        return limpo
            .split("")
            .map(function (char) { return DICIONARIO_MORSE[char] || ""; })
            .filter(function (code) { return code !== ""; })
            .join(" ");
    }

    function pararTransmissao() {
        currentTransmissionId++;
        const led = document.getElementById("led-lamp");
        const status = document.getElementById("led-status");
        if (led) led.className = "led-off";
        if (status) status.textContent = "Circuito em Espera";
    }

    async function iniciarTransmissao(texto) {
        currentTransmissionId++;
        const myId = currentTransmissionId;

        const inputEl = document.getElementById("morse-input");
        const outputEl = document.getElementById("morse-output");
        const led = document.getElementById("led-lamp");
        const status = document.getElementById("led-status");

        if (inputEl) inputEl.value = texto;
        const codigoMorse = converterParaMorse(texto);

        if (!codigoMorse) {
            if (status) status.textContent = "Digite letras ou números válidos.";
            if (outputEl) outputEl.textContent = "—";
            return;
        }

        if (outputEl) {
            outputEl.textContent = codigoMorse.replace(/\./g, "•").replace(/-/g, "—");
        }

        for (let i = 0; i < codigoMorse.length; i++) {
            if (myId !== currentTransmissionId) return;

            const simbolo = codigoMorse[i];

            if (simbolo === ".") {
                if (led) led.className = "led-on";
                if (status) status.textContent = 'Transmitindo "' + texto.toUpperCase() + '" — Pulso Curto (•)';
                tocarBuzzer(200);
                await esperar(220);
                if (myId !== currentTransmissionId) return;
                if (led) led.className = "led-off";
                await esperar(200);
            } else if (simbolo === "-") {
                if (led) led.className = "led-on";
                if (status) status.textContent = 'Transmitindo "' + texto.toUpperCase() + '" — Pulso Longo (—)';
                tocarBuzzer(580);
                await esperar(600);
                if (myId !== currentTransmissionId) return;
                if (led) led.className = "led-off";
                await esperar(200);
            } else if (simbolo === " ") {
                await esperar(350);
            } else if (simbolo === "/") {
                await esperar(700);
            }
        }

        if (myId === currentTransmissionId) {
            if (led) led.className = "led-off";
            if (status) status.textContent = 'Transmissão de "' + texto.toUpperCase() + '" concluída!';
        }
    }

    document.querySelectorAll("[data-morse]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            iniciarTransmissao(btn.getAttribute("data-morse"));
        });
    });

    const btnTransmit = document.getElementById("btn-transmit");
    if (btnTransmit) {
        btnTransmit.addEventListener("click", function () {
            const inputEl = document.getElementById("morse-input");
            const texto = inputEl ? inputEl.value.trim() : "";
            if (!texto) {
                alert("Digite uma palavra ou clique em uma das mensagens rápidas.");
                return;
            }
            iniciarTransmissao(texto);
        });
    }

    const btnStop = document.getElementById("btn-stop");
    if (btnStop) {
        btnStop.addEventListener("click", pararTransmissao);
    }

    // ==========================================
    // 5. DISPLAY LCD 16x2 SIMULADO (PARTE D)
    // ==========================================
    document.querySelectorAll("[data-lcd1]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const line1 = btn.getAttribute("data-lcd1") || "";
            const line2 = btn.getAttribute("data-lcd2") || "";
            const l1 = document.getElementById("lcd-line-1");
            const l2 = document.getElementById("lcd-line-2");
            if (l1) l1.textContent = line1.padEnd(16, " ").slice(0, 16);
            if (l2) l2.textContent = line2.padEnd(16, " ").slice(0, 16);
        });
    });
});
