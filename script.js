// 1. NAVEGAÇÃO ENTRE ABAS PRINCIPAIS
function abrirAba(idAba, botaoClicado) {
    var abas = document.querySelectorAll('.tab-content');
    for (var i = 0; i < abas.length; i++) {
        abas[i].style.display = 'none';
        abas[i].classList.remove('active');
    }

    var botoes = document.querySelectorAll('.tab-btn');
    for (var j = 0; j < botoes.length; j++) {
        botoes[j].classList.remove('active');
    }

    var alvo = document.getElementById(idAba);
    if (alvo) {
        alvo.style.display = 'block';
        alvo.classList.add('active');
    }
    if (botaoClicado) {
        botaoClicado.classList.add('active');
    }

    if (idAba !== 'tab-robotica') {
        pararMorse();
    }
}

// 2. CARROSSEL DE SLIDES
var slideAtual = 0;

function mostrarSlide(indice) {
    var slides = document.querySelectorAll('.slide');
    var dots = document.querySelectorAll('.dot');
    if (slides.length === 0) return;

    if (indice >= slides.length) slideAtual = 0;
    else if (indice < 0) slideAtual = slides.length - 1;
    else slideAtual = indice;

    for (var i = 0; i < slides.length; i++) {
        slides[i].style.display = 'none';
        slides[i].classList.remove('active');
    }
    for (var j = 0; j < dots.length; j++) {
        dots[j].classList.remove('active');
    }

    slides[slideAtual].style.display = 'block';
    slides[slideAtual].classList.add('active');
    if (dots[slideAtual]) dots[slideAtual].classList.add('active');
}

function mudarSlide(direcao) {
    mostrarSlide(slideAtual + direcao);
}

function irParaSlide(indice) {
    mostrarSlide(indice);
}

setInterval(function () {
    var abaProg = document.getElementById('tab-programacao');
    if (abaProg && abaProg.classList.contains('active')) {
        mudarSlide(1);
    }
}, 5500);

// 3. SIMULADOR DO COFRE DIGITAL (ATIVIDADE 1)
function executarCofre(modo) {
    var msgEl = document.getElementById('cofre-msg');
    var chaveEl = document.getElementById('cofre-chave');
    var outEl = document.getElementById('cofre-resultado');
    if (!msgEl || !chaveEl || !outEl) return;

    var texto = msgEl.value;
    var chave = chaveEl.value;

    if (!texto || !chave) {
        outEl.textContent = 'Preencha a mensagem e a chave secreta.';
        return;
    }

    var deslocamento = 0;
    for (var i = 0; i < chave.length; i++) {
        deslocamento = (deslocamento + chave.charCodeAt(i)) % 256;
    }

    try {
        var encoder = new TextEncoder();
        var decoder = new TextDecoder();

        if (modo === 'criptografar') {
            var bytes = encoder.encode(texto);
            var binStr = '';
            for (var j = 0; j < bytes.length; j++) {
                binStr += String.fromCharCode((bytes[j] + deslocamento) % 256);
            }
            var cifrado = btoa(binStr);
            outEl.textContent = cifrado;
            msgEl.value = cifrado;
        } else {
            var raw = atob(texto.trim());
            var arr = new Uint8Array(raw.length);
            for (var k = 0; k < raw.length; k++) {
                arr[k] = (raw.charCodeAt(k) - deslocamento + 256) % 256;
            }
            var original = decoder.decode(arr);
            outEl.textContent = original;
            msgEl.value = original;
        }
    } catch (e) {
        outEl.textContent = 'Código inválido para descriptografar. Verifique o texto e a chave.';
    }
}

// 4. SIMULADOR NUTRICIONAL (ATIVIDADE 3)
var TABELA_NUTRI = {
    arroz:    { kcal: 130, carb: 28.0, fibras: 1.6, sodio: 1 },
    feijao:   { kcal: 76,  carb: 13.6, fibras: 8.5, sodio: 2 },
    frango:   { kcal: 159, carb: 0.0,  fibras: 0.0, sodio: 50 },
    salada:   { kcal: 20,  carb: 3.5,  fibras: 2.4, sodio: 12 },
    embutido: { kcal: 290, carb: 2.5,  fibras: 0.0, sodio: 980 }
};

function calcularNutricao() {
    var alim = document.getElementById('nutri-alimento').value;
    var gramas = parseFloat(document.getElementById('nutri-gramas').value);
    var alerta = document.getElementById('nutri-alerta');

    if (!gramas || gramas <= 0 || !TABELA_NUTRI[alim]) {
        alerta.className = 'alert-banner';
        alerta.textContent = '⚠️ Informe uma quantidade válida em gramas.';
        return;
    }

    var fator = gramas / 100.0;
    var d = TABELA_NUTRI[alim];
    var kcal = (d.kcal * fator).toFixed(1);
    var carb = (d.carb * fator).toFixed(1);
    var fibras = (d.fibras * fator).toFixed(1);
    var sodio = Math.round(d.sodio * fator);

    document.getElementById('res-kcal').textContent = kcal + ' kcal';
    document.getElementById('res-carb').textContent = carb + ' g';
    document.getElementById('res-fibras').textContent = fibras + ' g';
    document.getElementById('res-sodio').textContent = sodio + ' mg';

    if (sodio > 400) {
        alerta.className = 'alert-banner';
        alerta.textContent = '⚠️ ALERTA PREVENTIVO: Alto teor de sódio (' + sodio + ' mg). Atenção para hipertensos!';
    } else if (parseFloat(carb) > 60) {
        alerta.className = 'alert-banner';
        alerta.textContent = '⚠️ ALERTA PREVENTIVO: Elevada carga de carboidratos (' + carb + ' g). Atenção para diabéticos!';
    } else {
        alerta.className = 'alert-banner ok';
        alerta.textContent = '✅ Valores equilibrados para a porção informada.';
    }
}

// 5. MATRIZ DE LEDS 5x5
var PADROES_MATRIZ = {
    feliz: {
        label: "Símbolo: Alegria / Bem-estar",
        grid: [0,1,0,1,0, 0,1,0,1,0, 0,0,0,0,0, 1,0,0,0,1, 0,1,1,1,0]
    },
    triste: {
        label: "Símbolo: Tristeza / Desconforto",
        grid: [0,1,0,1,0, 0,1,0,1,0, 0,0,0,0,0, 0,1,1,1,0, 1,0,0,0,1]
    },
    alerta: {
        label: "Símbolo: Atenção / Aviso (!)",
        grid: [0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,0,0,0, 0,0,1,0,0]
    },
    ajuda: {
        label: "Símbolo: Socorro / Atendimento (+)",
        grid: [0,0,1,0,0, 0,0,1,0,0, 1,1,1,1,1, 0,0,1,0,0, 0,0,1,0,0]
    },
    seta: {
        label: "Símbolo: Direção / Saída Acessível",
        grid: [0,0,1,0,0, 0,0,0,1,0, 1,1,1,1,1, 0,0,0,1,0, 0,0,1,0,0]
    }
};

function desenharMatriz(tipo) {
    var box = document.getElementById('led-matrix-grid');
    var legenda = document.getElementById('matrix-label');
    if (!box || !PADROES_MATRIZ[tipo]) return;

    var padrao = PADROES_MATRIZ[tipo];
    box.innerHTML = '';

    for (var i = 0; i < padrao.grid.length; i++) {
        var ponto = document.createElement('div');
        ponto.className = padrao.grid[i] === 1 ? 'matrix-dot on' : 'matrix-dot';
        box.appendChild(ponto);
    }
    if (legenda) legenda.textContent = padrao.label;
}

// 6. SIMULADOR DE MORSE (LED + BUZZER)
var MORSE_MAP = {
    A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",
    K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",
    U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..",0:"-----",1:".----",2:"..---",
    3:"...--",4:"....-",5:".....",6:"-....",7:"--...",8:"---..",9:"----."," ":"/"
};

var transmissaoId = 0;
var audioCtx = null;

function tocarBuzzer(ms) {
    var chk = document.getElementById('buzzer-enabled');
    if (!chk || !chk.checked) return;
    try {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(680, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + ms / 1000);
    } catch (e) {}
}

function esperar(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function pararMorse() {
    transmissaoId++;
    var led = document.getElementById('led-lamp');
    var st = document.getElementById('led-status');
    if (led) led.className = 'led-off';
    if (st) st.textContent = 'Circuito em Espera';
}

function transmitirDigitado() {
    var inp = document.getElementById('morse-input');
    var txt = inp ? inp.value.trim() : '';
    if (!txt) {
        alert('Digite uma palavra ou clique em uma das mensagens rápidas.');
        return;
    }
    iniciarMorse(txt);
}

async function iniciarMorse(texto) {
    transmissaoId++;
    var meuId = transmissaoId;

    var inp = document.getElementById('morse-input');
    var out = document.getElementById('morse-output');
    var led = document.getElementById('led-lamp');
    var st = document.getElementById('led-status');

    if (inp) inp.value = texto;
    var limpo = texto.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    var codigo = limpo.split('').map(function (c) { return MORSE_MAP[c] || ''; }).filter(Boolean).join(' ');

    if (!codigo) {
        if (st) st.textContent = 'Digite letras ou números válidos.';
        if (out) out.textContent = '—';
        return;
    }

    if (out) out.textContent = codigo.replace(/\./g, '•').replace(/-/g, '—');

    for (var i = 0; i < codigo.length; i++) {
        if (meuId !== transmissaoId) return;
        var s = codigo[i];
        if (s === '.') {
            if (led) led.className = 'led-on';
            if (st) st.textContent = 'Transmitindo "' + texto.toUpperCase() + '" — Pulso Curto (•)';
            tocarBuzzer(200);
            await esperar(220);
            if (meuId !== transmissaoId) return;
            if (led) led.className = 'led-off';
            await esperar(200);
        } else if (s === '-') {
            if (led) led.className = 'led-on';
            if (st) st.textContent = 'Transmitindo "' + texto.toUpperCase() + '" — Pulso Longo (—)';
            tocarBuzzer(580);
            await esperar(600);
            if (meuId !== transmissaoId) return;
            if (led) led.className = 'led-off';
            await esperar(200);
        } else if (s === ' ') {
            await esperar(350);
        } else if (s === '/') {
            await esperar(700);
        }
    }

    if (meuId === transmissaoId) {
        if (led) led.className = 'led-off';
        if (st) st.textContent = 'Transmissão de "' + texto.toUpperCase() + '" concluída!';
    }
}

// 7. DISPLAY LCD 16x2
function mudarLcd(linha1, linha2) {
    var l1 = document.getElementById('lcd-line-1');
    var l2 = document.getElementById('lcd-line-2');
    if (l1) l1.textContent = linha1.padEnd(16, ' ').slice(0, 16);
    if (l2) l2.textContent = linha2.padEnd(16, ' ').slice(0, 16);
}

// INICIALIZA A MATRIZ DE LEDS AO CARREGAR
desenharMatriz('feliz');
