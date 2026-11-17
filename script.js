document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     1. BARRA DE ACESSIBILIDADE (Contraste, Fonte e Leitura)
     ========================================================= */
  const root = document.documentElement;
  const btnContrast = document.getElementById("btn-contrast");
  const btnFontDec = document.getElementById("btn-font-dec");
  const btnFontReset = document.getElementById("btn-font-reset");
  const btnFontInc = document.getElementById("btn-font-inc");
  const btnReading = document.getElementById("btn-reading");
  const a11yStatus = document.getElementById("a11y-status");

  let fontScale = 100;

  function announceA11y(message) {
    a11yStatus.textContent = message;
  }

  btnContrast.addEventListener("click", () => {
    const isHigh = root.getAttribute("data-theme") === "high-contrast";
    if (isHigh) {
      root.removeAttribute("data-theme");
      btnContrast.setAttribute("aria-pressed", "false");
      announceA11y("Modo de alto contraste desativado.");
    } else {
      root.setAttribute("data-theme", "high-contrast");
      btnContrast.setAttribute("aria-pressed", "true");
      announceA11y("Modo de alto contraste ativado.");
    }
  });

  btnFontInc.addEventListener("click", () => {
    if (fontScale < 130) {
      fontScale += 10;
      root.style.setProperty("--font-scale", `${fontScale}%`);
      announceA11y(`Tamanho da fonte aumentado para ${fontScale}%.`);
    }
  });

  btnFontDec.addEventListener("click", () => {
    if (fontScale > 80) {
      fontScale -= 10;
      root.style.setProperty("--font-scale", `${fontScale}%`);
      announceA11y(`Tamanho da fonte reduzido para ${fontScale}%.`);
    }
  });

  btnFontReset.addEventListener("click", () => {
    fontScale = 100;
    root.style.setProperty("--font-scale", "100%");
    announceA11y("Tamanho da fonte restaurado para 100%.");
  });

  btnReading.addEventListener("click", () => {
    const isWide = root.getAttribute("data-reading") === "wide";
    if (isWide) {
      root.removeAttribute("data-reading");
      btnReading.setAttribute("aria-pressed", "false");
      announceA11y("Espaçamento padrão restaurado.");
    } else {
      root.setAttribute("data-reading", "wide");
      btnReading.setAttribute("aria-pressed", "true");
      announceA11y("Espaçamento ampliado de leitura ativado.");
    }
  });

  /* =========================================================
     2. SIMULADOR DA MATRIZ DE LEDs 8x8
     ========================================================= */
  const ledGrid = document.getElementById("led-matrix-grid");
  const ledCaption = document.getElementById("led-caption");
  const btnLedClear = document.getElementById("btn-led-clear");

  const ledPatterns = {
    alegria: {
      label: "Alegria (Bem-estar) — Comunica estado emocional positivo sem depender da fala.",
      matrix: [
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [1, 0, 1, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 1, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 1],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
      ],
    },
    tristeza: {
      label: "Tristeza / Desconforto — Sinaliza necessidade de acolhimento ou atenção.",
      matrix: [
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [1, 0, 1, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 1],
        [1, 0, 1, 0, 0, 1, 0, 1],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
      ],
    },
    atencao: {
      label: "Atenção (!) — Alerta visual imediato para ambientes ruidosos.",
      matrix: [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
      ],
    },
    ajuda: {
      label: "Ajuda / Atendimento Médico (+) — Pedido rápido de suporte.",
      matrix: [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
      ],
    },
    direcao: {
      label: "Direção (→) — Indica rota acessível ou saída de emergência.",
      matrix: [
        [0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0],
      ],
    },
  };

  function buildLedGrid() {
    ledGrid.innerHTML = "";
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "led-cell";
        cell.setAttribute("aria-label", `LED linha ${r + 1}, coluna ${c + 1}`);
        cell.addEventListener("click", () => {
          cell.classList.toggle("active");
          ledCaption.innerHTML =
            "Símbolo atual: <strong>Personalizado pelo usuário</strong> — Desenho livre na matriz 8×8.";
        });
        ledGrid.appendChild(cell);
      }
    }
  }

  function applyLedPattern(patternKey) {
    const pattern = ledPatterns[patternKey];
    if (!pattern) return;
    const cells = ledGrid.querySelectorAll(".led-cell");
    pattern.matrix.forEach((row, r) => {
      row.forEach((val, c) => {
        const idx = r * 8 + c;
        cells[idx].classList.toggle("active", val === 1);
      });
    });
    ledCaption.innerHTML = `Símbolo atual: <strong>${pattern.label}</strong>`;
  }

  buildLedGrid();
  applyLedPattern("alegria");

  document.querySelectorAll("[data-pattern]").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyLedPattern(btn.getAttribute("data-pattern"));
    });
  });

  btnLedClear.addEventListener("click", () => {
    ledGrid.querySelectorAll(".led-cell").forEach((cell) => cell.classList.remove("active"));
    ledCaption.innerHTML = "Símbolo atual: <strong>Matriz apagada</strong>.";
  });

  /* =========================================================
     3. SIMULADOR DE CÓDIGO MORSE (LED + Buzzer Web Audio)
     ========================================================= */
  const morseMap = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
    G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
    M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
    S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
    Y: "-.--", Z: "--..",
    0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-",
    5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----.",
  };

  const morseInput = document.getElementById("morse-input");
  const morseOutput = document.getElementById("morse-output");
  const morseLedBulb = document.getElementById("morse-led-bulb");
  const morseBuzzerIcon = document.getElementById("morse-buzzer-icon");
  const btnMorsePlay = document.getElementById("btn-morse-play");
  const btnMorseStop = document.getElementById("btn-morse-stop");
  const morseSoundToggle = document.getElementById("morse-sound-toggle");

  let audioCtx = null;
  let isPlayingMorse = false;

  function textToMorse(text) {
    return text
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .split("")
      .map((char) => (char === " " ? "/" : morseMap[char] || ""))
      .filter(Boolean)
      .join(" ");
  }

  morseInput.addEventListener("input", () => {
    const code = textToMorse(morseInput.value);
    morseOutput.textContent = code || "Digite letras ou números válidos";
  });

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function playBeep(durationMs) {
    if (!morseSoundToggle.checked) return;
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(650, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + durationMs / 1000);
  }

  async function runMorseTransmission() {
    if (isPlayingMorse) return;
    const code = textToMorse(morseInput.value);
    if (!code) return;

    isPlayingMorse = true;
    btnMorsePlay.disabled = true;

    for (const symbol of code) {
      if (!isPlayingMorse) break;

      if (symbol === "." || symbol === "-") {
        const duration = symbol === "." ? 180 : 480;
        morseLedBulb.classList.add("on");
        if (morseSoundToggle.checked) {
          morseBuzzerIcon.classList.add("on");
          playBeep(duration);
        }
        await sleep(duration);
        morseLedBulb.classList.remove("on");
        morseBuzzerIcon.classList.remove("on");
        await sleep(160);
      } else if (symbol === " ") {
        await sleep(320);
      } else if (symbol === "/") {
        await sleep(550);
      }
    }

    isPlayingMorse = false;
    btnMorsePlay.disabled = false;
    morseLedBulb.classList.remove("on");
    morseBuzzerIcon.classList.remove("on");
  }

  btnMorsePlay.addEventListener("click", runMorseTransmission);
  btnMorseStop.addEventListener("click", () => {
    isPlayingMorse = false;
    btnMorsePlay.disabled = false;
    morseLedBulb.classList.remove("on");
    morseBuzzerIcon.classList.remove("on");
  });

  /* =========================================================
     4. SIMULADOR DO DISPLAY LCD 16x2
     ========================================================= */
  const lcdScreen = document.getElementById("lcd-screen");
  const lcdLine1 = document.getElementById("lcd-line-1");
  const lcdLine2 = document.getElementById("lcd-line-2");
  const customLcd1 = document.getElementById("custom-lcd-1");
  const customLcd2 = document.getElementById("custom-lcd-2");
  const btnLcdTheme = document.getElementById("btn-lcd-theme");

  const lcdPresets = {
    hospital: ["SENHA P04 - SALA 2", "ATEND. PRIORITARIO"],
    onibus: ["LINHA 402 CENTRO", "PROX: TERM. NORTE"],
    alerta: ["ATENCAO: SAIDA", "SIGA SETA VERDE"],
  };

  function updateLcd(l1, l2) {
    const line1Text = (l1 || "").padEnd(16, " ").slice(0, 16);
    const line2Text = (l2 || "").padEnd(16, " ").slice(0, 16);
    lcdLine1.textContent = line1Text;
    lcdLine2.textContent = line2Text;
    customLcd1.value = l1 || "";
    customLcd2.value = l2 || "";
  }

  document.querySelectorAll("[data-lcd]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = lcdPresets[btn.getAttribute("data-lcd")];
      if (preset) updateLcd(preset[0], preset[1]);
    });
  });

  customLcd1.addEventListener("input", () => updateLcd(customLcd1.value, customLcd2.value));
  customLcd2.addEventListener("input", () => updateLcd(customLcd1.value, customLcd2.value));

  btnLcdTheme.addEventListener("click", () => {
    lcdScreen.classList.toggle("blue-mode");
  });

  /* =========================================================
     5. COFRE DIGITAL (Simulação de Criptografia Python)
     ========================================================= */
  const vaultText = document.getElementById("vault-text");
  const vaultKey = document.getElementById("vault-key");
  const vaultResult = document.getElementById("vault-result");
  const btnEncrypt = document.getElementById("btn-encrypt");
  const btnDecrypt = document.getElementById("btn-decrypt");

  function shiftCipher(text, shift) {
    let output = "";
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code >= 32 && code <= 126) {
        const range = 95;
        const shifted = ((((code - 32 + shift) % range) + range) % range) + 32;
        output += String.fromCharCode(shifted);
      } else {
        output += text[i];
      }
    }
    return output;
  }

  btnEncrypt.addEventListener("click", () => {
    const key = parseInt(vaultKey.value, 10) || 3;
    const encrypted = shiftCipher(vaultText.value, key);
    vaultText.value = encrypted;
    vaultResult.textContent = `Dado Criptografado (chave ${key}): ${encrypted}`;
  });

  btnDecrypt.addEventListener("click", () => {
    const key = parseInt(vaultKey.value, 10) || 3;
    const decrypted = shiftCipher(vaultText.value, -key);
    vaultText.value = decrypted;
    vaultResult.textContent = `Dado Descriptografado (chave ${key}): ${decrypted}`;
  });

  /* =========================================================
     6. MODELO COMPUTACIONAL DE SAÚDE E NUTRIÇÃO
     ========================================================= */
  const foodDatabase = {
    arroz: { kcal: 128, carb: 28, sodium: 1 },
    feijao: { kcal: 76, carb: 14, sodium: 2 },
    frango: { kcal: 159, carb: 0, sodium: 65 },
    embutido: { kcal: 260, carb: 3, sodium: 1120 },
    banana: { kcal: 89, carb: 23, sodium: 1 },
  };

  let totalKcal = 0;
  let totalCarb = 0;
  let totalSodium = 0;

  const foodSelect = document.getElementById("food-select");
  const foodQty = document.getElementById("food-qty");
  const btnAddFood = document.getElementById("btn-add-food");
  const btnClearFood = document.getElementById("btn-clear-food");
  const nutritionSummary = document.getElementById("nutrition-summary");

  function renderNutrition() {
    let alertHtml = "";
    if (totalSodium > 800) {
      alertHtml += `<p class="alert-warning">Alerta de Sódio Elevado (${totalSodium} mg): atenção redobrada para pessoas hipertensas.</p>`;
    }
    if (totalCarb > 75) {
      alertHtml += `<p class="alert-warning">Alerta de Carboidratos (${totalCarb} g): monitorar glicemia em caso de diabetes.</p>`;
    }

    nutritionSummary.innerHTML = `
      <p><strong>Resumo da Refeição:</strong> ${totalKcal} kcal | ${totalCarb}g Carboidratos | ${totalSodium}mg Sódio</p>
      ${alertHtml}
      <p class="small-note">Aviso ético: Este modelo educativo apoia a organização alimentar, mas não substitui acompanhamento médico ou nutricional.</p>
    `;
  }

  btnAddFood.addEventListener("click", () => {
    const food = foodDatabase[foodSelect.value];
    const qty = Math.max(1, parseInt(foodQty.value, 10) || 1);
    if (!food) return;

    totalKcal += food.kcal * qty;
    totalCarb += food.carb * qty;
    totalSodium += food.sodium * qty;
    renderNutrition();
  });

  btnClearFood.addEventListener("click", () => {
    totalKcal = 0;
    totalCarb = 0;
    totalSodium = 0;
    renderNutrition();
  });
});
