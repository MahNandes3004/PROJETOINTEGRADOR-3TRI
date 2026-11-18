let tamFonte = 100;
function mudarFonte(d) {
  tamFonte = d === 0 ? 100 : Math.min(135, Math.max(85, tamFonte + d));
  document.documentElement.style.fontSize = tamFonte + '%';
}
function alternarContraste() {
  document.body.classList.toggle('alto-contraste');
  document.getElementById('btn-contraste')?.classList.toggle('ativo');
}
function alternarLeitura() {
  const btn = document.getElementById('btn-escutar');
  if (!('speechSynthesis' in window)) { alert('Navegador sem suporte a voz.'); return; }
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    if (btn) { btn.textContent = 'Escutar'; btn.classList.remove('ativo'); }
    return;
  }
  const aba = document.querySelector('.tab-content.active');
  const fala = new SpeechSynthesisUtterance((aba ? aba.innerText : document.body.innerText).slice(0, 3500));
  fala.lang = 'pt-BR';
  fala.onend = () => { if (btn) { btn.textContent = 'Escutar'; btn.classList.remove('ativo'); } };
  speechSynthesis.speak(fala);
  if (btn) { btn.textContent = 'Parar audio'; btn.classList.add('ativo'); }
}
function abrirAba(id, btn) {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  const bEsc = document.getElementById('btn-escutar');
  if (bEsc) { bEsc.textContent = 'Escutar'; bEsc.classList.remove('ativo'); }
  document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  if (btn) btn.classList.add('active');
  if (id !== 'tab-robotica') pararMorse();
}
let slideAtual = 0;
function mostrarSlide(n) {
  const s = document.querySelectorAll('.slide'), d = document.querySelectorAll('.dot');
  if (!s.length) return;
  slideAtual = (n + s.length) % s.length;
  s.forEach((el, i) => el.classList.toggle('active', i === slideAtual));
  d.forEach((el, i) => el.classList.toggle('active', i === slideAtual));
}
function mudarSlide(d) { mostrarSlide(slideAtual + d); }
function irParaSlide(i) { mostrarSlide(i); }
function executarCofre(modo) {
  const m = document.getElementById('cofre-msg'), c = document.getElementById('cofre-chave').value, o = document.getElementById('cofre-resultado');
  if (!m.value || !c) { o.textContent = 'Preencha mensagem e chave.'; return; }
  let d = 0;
  for (let i = 0; i < c.length; i++) d = (d + c.charCodeAt(i)) % 256;
  try {
    if (modo === 'criptografar') {
      const bytes = new TextEncoder().encode(m.value); let bin = '';
      bytes.forEach(b => bin += String.fromCharCode((b + d) % 256));
      o.textContent = m.value = btoa(bin);
    } else {
      const raw = atob(m.value.trim()), arr = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) arr[i] = (raw.charCodeAt(i) - d + 256) % 256;
      o.textContent = m.value = new TextDecoder().decode(arr);
    }
  } catch (e) { o.textContent = 'Codigo invalido ou chave incorreta.'; }
}

const NUTRI = { arroz:[130,28,1.6,1], feijao:[76,13.6,8.5,2], frango:[159,0,0,50], salada:[20,3.5,2.4,12], embutido:[290,2.5,0,980] };
function calcularNutricao() {
  const a = document.getElementById('nutri-alimento').value, g = parseFloat(document.getElementById('nutri-gramas').value), al = document.getElementById('nutri-alerta');
  if (!g || g <= 0) { al.textContent = 'Informe gramas validas.'; return; }
  const f = g / 100, [kc, cb, fb, sd] = NUTRI[a], sodio = Math.round(sd * f), carb = (cb * f).toFixed(1);
  document.getElementById('res-nutri').textContent = (kc*f).toFixed(1)+' kcal | Carb: '+carb+' g | Fibras: '+(fb*f).toFixed(1)+' g | Sodio: '+sodio+' mg';
  al.textContent = sodio > 400 ? 'ALERTA: Alto sodio ('+sodio+' mg)!' : (parseFloat(carb) > 60 ? 'ALERTA: Alto carboidrato ('+carb+' g)!' : 'Valores equilibrados.');
}
const MATRIZ = {
  feliz: ['Alegria', [0,1,0,1,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,1,0,1,1,1,0]],
  triste: ['Tristeza', [0,1,0,1,0,0,1,0,1,0,0,0,0,0,0,0,1,1,1,0,1,0,0,0,1]],
  alerta: ['Atencao (!)', [0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0]],
  ajuda: ['Ajuda (+)', [0,0,1,0,0,0,0,1,0,0,1,1,1,1,1,0,0,1,0,0,0,0,1,0,0]],
  seta: ['Direcao', [0,0,1,0,0,0,0,0,1,0,1,1,1,1,1,0,0,0,1,0,0,0,1,0,0]]
};
function desenharMatriz(t) {
  const b = document.getElementById('led-matrix-grid'), l = document.getElementById('matrix-label');
  if (!b || !MATRIZ[t]) return;
  b.innerHTML = MATRIZ[t][1].map(v => '<div class="matrix-dot'+(v?' on':'')+'"></div>').join('');
  if (l) l.textContent = 'Simbolo: ' + MATRIZ[t][0];
}
const MORSE = { A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.',' ':'/' };
let txId = 0, audioCtx = null;
function tocarBuzzer(ms) {
  if (!document.getElementById('buzzer-enabled')?.checked) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
    osc.frequency.value = 680; g.gain.value = 0.12;
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + ms / 1000);
  } catch (e) {}
}
const esperar = ms => new Promise(r => setTimeout(r, ms));
function pararMorse() { txId++; document.getElementById('led-lamp').className = 'led-off'; document.getElementById('led-status').textContent = 'Em Espera'; }
function transmitirDigitado() { const v = document.getElementById('morse-input')?.value.trim(); if (v) iniciarMorse(v); }
async function iniciarMorse(txt) {
  const id = ++txId, inp = document.getElementById('morse-input'), out = document.getElementById('morse-output'), l = document.getElementById('led-lamp'), s = document.getElementById('led-status');
  if (inp) inp.value = txt;
  const cod = txt.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split('').map(c => MORSE[c] || '').filter(Boolean).join(' ');
  if (!cod) return;
  if (out) out.textContent = cod;
  for (const ch of cod) {
    if (id !== txId) return;
    if (ch === '.' || ch === '-') {
      const dur = ch === '.' ? 220 : 600;
      l.className = 'led-on'; s.textContent = 'Transmitindo: ' + txt.toUpperCase(); tocarBuzzer(dur - 20);
      await esperar(dur); if (id !== txId) return; l.className = 'led-off'; await esperar(200);
    } else await esperar(ch === '/' ? 700 : 350);
  }
  if (id === txId) s.textContent = 'Concluido!';
}
function mudarLcd(l1, l2) {
  document.getElementById('lcd-line-1').textContent = l1.padEnd(16, ' ').slice(0, 16);
  document.getElementById('lcd-line-2').textContent = l2.padEnd(16, ' ').slice(0, 16);
}
desenharMatriz('feliz');
