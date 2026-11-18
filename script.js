// 1. CONTROLE DE TAMANHO DE FONTE (A-, A, A+)
let tamanhoFonte = 100;

function alterarFonte(delta) {
  if (delta === 0) {
    tamanhoFonte = 100;
  } else {
    tamanhoFonte = Math.min(140, Math.max(85, tamanhoFonte + delta));
  }
  document.documentElement.style.fontSize = tamanhoFonte + '%';
  falarTextoCurto('Tamanho da fonte em ' + tamanhoFonte + ' por cento.');
}

// 2. ALTO CONTRASTE
function alternarContraste() {
  const ativo = document.body.classList.toggle('alto-contraste');
  const btn = document.getElementById('btn-contraste');
  if (btn) {
    btn.classList.toggle('ativo', ativo);
    btn.setAttribute('aria-pressed', String(ativo));
  }
  falarTextoCurto(ativo ? 'Modo alto contraste ativado.' : 'Modo alto contraste desativado.');
}

// 3. AUDIODESCRIÇÃO (NARRAÇÃO DE CONTEÚDO E ELEMENTOS VISUAIS)
function falarTextoCurto(texto) {
  if (!('speechSynthesis' in window)) return;
  if (window.speechSynthesis.speaking) return;
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = 'pt-BR';
  u.rate = 1.05;
  window.speechSynthesis.speak(u);
}

function pararAudiodescricao() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  const btn = document.getElementById('btn-audiodesc');
  if (btn) {
    btn.textContent = '🔊 Audiodescrição';
    btn.classList.remove('ativo');
    btn.setAttribute('aria-pressed', 'false');
  }
}

function alternarAudiodescricao() {
  const btn = document.getElementById('btn-audiodesc');
  if (!('speechSynthesis' in window)) {
    alert('Seu navegador não suporta leitura por voz.');
    return;
  }

  if (window.speechSynthesis.speaking) {
    pararAudiodescricao();
    return;
  }

  const divisaoAtiva = document.querySelector('.tab-content.active');
  let roteiro = '';

  if (divisaoAtiva && divisaoAtiva.id === 'div-programacao') {
    const slide = divisaoAtiva.querySelector('.slide.active');
    const descSlide = slide ? slide.getAttribute('data-audiodesc') : '';
    roteiro = 'Audiodescrição da divisão Programação em Python. ' + descSlide + '. ' + divisaoAtiva.innerText;
  } else if (divisaoAtiva && divisaoAtiva.id === 'div-robotica') {
    const legendaMatriz = document.getElementById('matrix-label')?.innerText || '';
    const statusMorse = document.getElementById('led-status')?.innerText || '';
    const l1 = document.getElementById('lcd-line-1')?.innerText.trim() || '';
    const l2 = document.getElementById('lcd-line-2')?.innerText.trim() || '';
    roteiro = 'Audiodescrição da divisão Robótica, LEDs e Código Morse. ' +
              'Na matriz de LEDs 5 por 5 está exibido: ' + legendaMatriz + '. ' +
              'No simulador de Código Morse, estado atual: ' + statusMorse + '. ' +
              'No visor LCD está escrito: ' + l1 + ' ' + l2 + '. ' +
              divisaoAtiva.innerText;
  } else {
    roteiro = document.body.innerText;
  }

  const fala = new SpeechSynthesisUtterance(roteiro.slice(0, 4500));
  fala.lang = 'pt-BR';
  fala.rate = 1.0;
  fala.onend = pararAudiodescricao;
  fala.onerror = pararAudiodescricao;

  window.speechSynthesis.speak(fala);
  if (btn) {
    btn.textContent = '⏹️ Parar Áudio';
    btn.classList.add('ativo');
    btn.setAttribute('aria-pressed', 'true');
  }
}

// 4. TROCA ENTRE AS DUAS DIVISÕES (PROGRAMAÇÃO E ROBÓTICA)
function trocarDivisao(idDivisao, botaoClicado) {
  pararAudiodescricao();
  pararMorse();

  document.querySelectorAll('.tab-content').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });

  const alvo = document.getElementById(idDivisao);
  if (alvo) alvo.classList.add('active');
  if (botaoClicado) {
    botaoClicado.classList.add('active');
    botaoClicado.setAttribute('aria-selected', 'true');
  }
}

// 5. CARROSSEL DE SLIDES (DIVISÃO DE PROGRAMAÇÃO)
let slideAtual = 0;

function mostrarSlide(indice) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  if (!slides.length) return;

  slideAtual = (indice + slides.length) % slides.length;
  slides.forEach((s, i) => s.classList.toggle('active', i === slideAtual));
  dots.forEach((d, i) => d.classList.toggle('active', i === slideAtual));
}

function mudarSlide(direcao) {
  mostrarSlide(slideAtual + direcao);
}

function irParaSlide(indice) {
  mostrarSlide(indice);
}

function lerSlideAtual() {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const slide = document.querySelector('.slide.active');
  if (!slide) return;
  const desc = slide.getAttribute('data-audiodesc') || slide.innerText;
  const u = new SpeechSynthesisUtterance(desc);
  u.lang = 'pt-BR';
  window.speechSynthesis.speak(u);
}

// 6. SIMULADOR DO COFRE DIGITAL (PYTHON -> JS)
function executarCofre(modo) {
  const msgEl = document.getElementById('cofre-msg');
  const chave = document.getElementById('cofre-chave').value;
  const out = document.getElementById('cofre-resultado');

  if (!msgEl.value || !chave) {
    out.textContent = 'Preencha a mensagem e a chave secreta.';
    return;
  }

  let deslocamento = 0;
  for (let i = 0; i < chave.length; i++) {
    deslocamento = (deslocamento + chave.charCodeAt(i)) % 256;
  }

  try {
    if (modo === 'criptografar') {
      const bytes = new TextEncoder().encode(msgEl.value);
      let bin = '';
      bytes.forEach(b => bin += String.fromCharCode((b + deslocamento) % 256));
      const cifrado = btoa(bin);
      out.textContent = cifrado;
      msgEl.value = cifrado;
    } else {
      const raw = atob(msgEl.value.trim());
      const arr = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) {
        arr[i] = (raw.charCodeAt(i) - deslocamento + 256) % 256;
      }
      const original = new TextDecoder().decode(arr);
      out.textContent = original;
      msgEl.value = original;
    }
  } catch (e) {
    out.textContent = 'Código inválido ou chave incorreta.';
  }
}

// 7. SIMULADOR NUTRICIONAL (PYTHON -> JS)
const TABELA_NUTRI = {
  arroz:    [130, 28.0, 1.6, 1],
  feijao:   [76,  13.6, 8.5, 2],
  frango:   [159, 0.0,  0.0, 50],
  salada:   [20,  3.5,  2.4, 12],
  embutido: [290, 2.5,  0.0, 980]
};

function calcularNutricao() {
  const alim = document.getElementById('nutri-alimento').value;
  const gramas = parseFloat(document.getElementById('nutri-gramas').value);
  const alerta = document.getElementById('nutri-alerta');

  if (!gramas || gramas <= 0 || !TABELA_NUTRI[alim]) {
    alerta.textContent = '⚠️ Informe uma quantidade válida em gramas.';
    return;
  }

  const fator = gramas / 100;
  const [kc, cb, fb, sd] = TABELA_NUTRI[alim];
  const sodio = Math.round(sd * fator);
  const carb = (cb * fator).toFixed(1);

  document.getElementById('res-nutri').textContent =
    (kc * fator).toFixed(1) + ' kcal | Carb: ' + carb + ' g | Fibras: ' + (fb * fator).toFixed(1) + ' g | Sódio: ' + sodio + ' mg';

  if (sodio > 400) {
    alerta.textContent = '⚠️ ALERTA: Alto teor de sódio (' + sodio + ' mg) — atenção para hipertensos!';
  } else if (parseFloat(carb) > 60) {
    alerta.textContent = '⚠️ ALERTA: Alta carga de carboidratos (' + carb + ' g) — atenção para diabéticos!';
  } else {
    alerta.textContent = '✅ Valores equilibrados para a porção informada.';
  }
}

// 8. MATRIZ DE LEDS 5x5 COM AUDIODESCRIÇÃO DO DESENHO
const MATRIZES = {
  feliz: {
    titulo: 'Símbolo: Alegria / Bem-estar',
    desc: 'Matriz de LEDs desenhando um rosto sorridente.',
    pontos: [0,1,0,1,0, 0,1,0,1,0, 0,0,0,0,0, 1,0,0,0,1, 0,1,1,1,0]
  },
  triste: {
    titulo: 'Símbolo: Dor / Desconforto',
    desc: 'Matriz de LEDs desenhando um rosto triste indicando desconforto.',
    pontos: [0,1,0,1,0, 0,1,0,1,0, 0,0,0,0,0, 0,1,1,1,0, 1,0,0,0,1]
  },
  alerta: {
    titulo: 'Símbolo: Atenção (!)',
    desc: 'Matriz de LEDs desenhando um ponto de exclamação de alerta.',
    pontos: [0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,0,0,0, 0,0,1,0,0]
  },
  ajuda: {
    titulo: 'Símbolo: Pedido de Ajuda (+)',
    desc: 'Matriz de LEDs desenhando uma cruz de socorro e atendimento.',
    pontos: [0,0,1,0,0, 0,0,1,0,0, 1,1,1,1,1, 0,0,1,0,0, 0,0,1,0,0]
  },
  seta: {
    titulo: 'Símbolo: Direção / Saída Acessível',
    desc: 'Matriz de LEDs desenhando uma seta apontando para a direita.',
    pontos: [0,0,1,0,0, 0,0,0,1,0, 1,1,1,1,1, 0,0,0,1,0, 0,0,1,0,0]
  }
};

function desenharMatriz(tipo, narrar) {
  const grade = document.getElementById('led-matrix-grid');
  const legenda = document.getElementById('matrix-label');
  const item = MATRIZES[tipo];
  if (!grade || !item) return;

  grade.innerHTML = item.pontos.map(v => '<div class="matrix-dot' + (v ? ' on' : '') + '"></div>').join('');
  grade.setAttribute('aria-label', item.desc);
  if (legenda) legenda.textContent = item.titulo;
  if (narrar) falarTextoCurto(item.desc);
}

// 9. SIMULADOR VISUAL (LED) E AUDITIVO (BUZZER) DE CÓDIGO MORSE
const DICIONARIO_MORSE = {
  A:'.-', B:'-...', C:'-.-.', D:'-..', E:'.', F:'..-.', G:'--.', H:'....',
  I:'..', J:'.---', K:'-.-', L:'.-..', M:'--', N:'-.', O:'---', P:'.--.',
  Q:'--.-', R:'.-.', S:'...', T:'-', U:'..-', V:'...-', W:'.--', X:'-..-',
  Y:'-.--', Z:'--..', 0:'-----', 1:'.----', 2:'..---', 3:'...--', 4:'....-',
  5:'.....', 6:'-....', 7:'--...', 8:'---..', 9:'----.', ' ':'/'
};

let idTransmissao = 0;
let contextoAudio = null;

function tocarBuzzer(duracaoMs) {
  const somAtivo = document.getElementById('buzzer-enabled')?.checked;
  if (!somAtivo) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!contextoAudio) contextoAudio = new AudioCtx();
    if (contextoAudio.state === 'suspended') contextoAudio.resume();

    const osc = contextoAudio.createOscillator();
    const ganho = contextoAudio.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, contextoAudio.currentTime);
    ganho.gain.setValueAtTime(0.15, contextoAudio.currentTime);
    osc.connect(ganho);
    ganho.connect(contextoAudio.destination);
    osc.start();
    osc.stop(contextoAudio.currentTime + duracaoMs / 1000);
  } catch (e) {}
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function pararMorse() {
  idTransmissao++;
  const led = document.getElementById('led-lamp');
  const status = document.getElementById('led-status');
  if (led) {
    led.className = 'led-off';
    led.setAttribute('aria-label', 'LED desligado');
  }
  if (status) status.textContent = 'Circuito em Espera';
}

function transmitirDigitado() {
  const val = document.getElementById('morse-input')?.value.trim();
  if (val) iniciarMorse(val);
}

async function iniciarMorse(texto) {
  const meuId = ++idTransmissao;
  const inp = document.getElementById('morse-input');
  const out = document.getElementById('morse-output');
  const led = document.getElementById('led-lamp');
  const status = document.getElementById('led-status');

  if (inp) inp.value = texto;

  const limpo = texto.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const codigo = limpo.split('').map(c => DICIONARIO_MORSE[c] || '').filter(Boolean).join(' ');
  if (!codigo) {
    if (status) status.textContent = 'Digite letras ou números válidos.';
    return;
  }

  if (out) out.textContent = codigo.replace(/\./g, '•').replace(/-/g, '—');

  if (document.getElementById('morse-narrar')?.checked && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance('Transmitindo em Código Morse: ' + texto);
    u.lang = 'pt-BR';
    window.speechSynthesis.speak(u);
    await esperar(1400);
  }

  for (const simbolo of codigo) {
    if (meuId !== idTransmissao) return;
    if (simbolo === '.' || simbolo === '-') {
      const duracao = simbolo === '.' ? 220 : 600;
      if (led) {
        led.className = 'led-on';
        led.setAttribute('aria-label', simbolo === '.' ? 'LED aceso pulso curto' : 'LED aceso pulso longo');
      }
      if (status) {
        status.textContent = (simbolo === '.' ? 'Pulso Curto (•)' : 'Pulso Longo (—)') + ' — ' + texto.toUpperCase();
      }
      tocarBuzzer(duracao - 20);
      await esperar(duracao);
      if (meuId !== idTransmissao) return;
      if (led) led.className = 'led-off';
      await esperar(220);
    } else {
      await esperar(simbolo === '/' ? 700 : 380);
    }
  }

  if (meuId === idTransmissao && status) {
    status.textContent = 'Transmissão de "' + texto.toUpperCase() + '" concluída!';
  }
}

// 10. DISPLAY LCD 16x2
function mudarLcd(linha1, linha2) {
  const l1 = document.getElementById('lcd-line-1');
  const l2 = document.getElementById('lcd-line-2');
  if (l1) l1.textContent = linha1.padEnd(16, ' ').slice(0, 16);
  if (l2) l2.textContent = linha2.padEnd(16, ' ').slice(0, 16);
  falarTextoCurto('Visor LCD exibindo: ' + linha1 + ', ' + linha2);
}

// INICIALIZA A MATRIZ AO CARREGAR A PÁGINA
desenharMatriz('feliz', false);
