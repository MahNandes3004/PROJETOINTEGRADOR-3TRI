function abrirAba(id, btn) {
  document.querySelectorAll('.tab-content').forEach(el => { el.style.display = 'none'; el.classList.remove('active'); });
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const alvo = document.getElementById(id);
  if (alvo) { alvo.style.display = 'block'; alvo.classList.add('active'); }
  if (btn) btn.classList.add('active');
  if (id !== 'tab-robotica') pararMorse();
}

let slideAtual = 0;
function mostrarSlide(n) {
  const slides = document.querySelectorAll('.slide'), dots = document.querySelectorAll('.dot');
  if (!slides.length) return;
  slideAtual = (n + slides.length) % slides.length;
  slides.forEach((s, i) => { s.style.display = i === slideAtual ? 'block' : 'none'; s.classList.toggle('active', i === slideAtual); });
  dots.forEach((d, i) => d.classList.toggle('active', i === slideAtual));
}
function mudarSlide(d) { mostrarSlide(slideAtual + d); }
function irParaSlide(i) { mostrarSlide(i); }
setInterval(() => { if (document.getElementById('tab-programacao')?.classList.contains('active')) mudarSlide(1); }, 5500);

function executarCofre(modo) {
  const msgEl = document.getElementById('cofre-msg'), chave = document.getElementById('cofre-chave').value, out = document.getElementById('cofre-resultado');
  if (!msgEl.value || !chave) { out.textContent = 'Preencha a mensagem e a chave secreta.'; return; }
  let d = 0;
  for (let i = 0; i < chave.length; i++) d = (d + chave.charCodeAt(i)) % 256;
  try {
    if (modo === 'criptografar') {
      const bytes = new TextEncoder().encode(msgEl.value);
      let bin = '';
      bytes.forEach(b => bin += String.fromCharCode((b + d) % 256));
      out.textContent = msgEl.value = btoa(bin);
    } else {
      const raw = atob(msgEl.value.trim()), arr = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) arr[i] = (raw.charCodeAt(i) - d + 256) % 256;
      out.textContent = msgEl.value = new TextDecoder().decode(arr);
    }
  } catch (e) { out.textContent = 'Codigo invalido ou chave incorreta.'; }
}

const NUTRI = { arroz:[130,28,1.6,1], feijao:[76,13.6,8.5,2], frango:[159,0,0,50], salada:[20,3.5,2.4,12], embutido:[290,2.5,0,980] };
function calcularNutricao() {
  const a = document.getElementById('nutri-alimento').value, g = parseFloat(document.getElementById('nutri-gramas').value), al = document.getElementById('nutri-alerta');
  if (!g || g <= 0 || !NUTRI[a]) { al.className = 'alert-banner'; al.textContent = 'Informe uma quantidade valida em gramas.'; return; }
  const f = g / 100, [kc, cb, fb, sd] = NUTRI[a], sodio = Math.round(sd * f), carb = (cb * f).toFixed(1);
  document.getElementById('res-kcal').textContent = (kc * f).toFixed(1) + ' kcal';
  document.getElementById('res-carb').textContent = carb + ' g';
  document.getElementById('res-fibras').textContent = (fb * f).toFixed(1) + ' g';
  document.getElementById('res-sodio').textContent = sodio + ' mg';
  if (sodio > 400) { al.className = 'alert-banner'; al.textContent = 'ALERTA: Alto teor de sodio (' + sodio + ' mg) - atencao hipertensos!'; }
  else if (parseFloat(carb) > 60) { al.className = 'alert-banner'; al.textContent = 'ALERTA: Alta carga de carboidratos (' + carb + ' g) - atencao diabeticos!'; }
  else { al.className = 'alert-banner ok'; al.textContent = 'Valores equilibrados para a porcao informada.'; }
}

const MATRIZ = {
  feliz: ['Simbolo: Alegria / Bem-estar', [0,1,0,1,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,1,0,1,1,1,0]],
  triste: ['Simbolo: Tristeza / Desconforto', [0,1,0,1,0,0,1,0,1,0,0,0,0,0,0,0,1,1,1,0,1,0,0,0,1]],
  alerta: ['Simbolo: Atencao / Aviso (!)', [0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0]],
  ajuda: ['Simbolo: Socorro / Atendimento (+)', [0,0,1,0,0,0,0,1,0,0,1,1,1,1,1,0,0,1,0,0,0,0,1,0,0]],
  seta: ['Simbolo: Direcao / Saida Acessivel', [0,0,1,0,0,0,0,0,1,0,1,1,1,1,1,0,0,0,1,0,0,0,1,0,0]]
};
function desenharMatriz(t) {
  const box = document.getElementById('led-matrix-grid'), leg = document.getElementById('matrix-label');
  if (!box || !MATRIZ[t]) return;
  box.innerHTML = MATRIZ[t][1].map(v => `<div class="matrix-dot${v ? ' on' : ''}"></div>`).join('');
  if (leg) leg.textContent = MATRIZ[t][0];
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
function pararMorse() {
  txId++;
  const l = document.getElementById('led-lamp'), s = document.getElementById('led-status');
  if (l) l.className = 'led-off';
  if (s) s.textContent = 'Circuito em Espera';
}
function transmitirDigitado() {
  const v = document.getElementById('morse-input')?.value.trim();
  if (v) iniciarMorse(v);
}
async function iniciarMorse(txt) {
  const id = ++txId, inp = document.getElementById('morse-input'), out = document.getElementById('morse-output'), l = document.getElementById('led-lamp'), s = document.getElementById('led-status');
  if (inp) inp.value = txt;
  const cod = txt.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split('').map(c => MORSE[c] || '').filter(Boolean).join(' ');
  if (!cod) { if (s) s.textContent = 'Digite letras validas.'; return; }
  if (out) out.textContent = cod.replace(/\./g, '\u2022').replace(/-/g, '\u2014');
  for (const ch of cod) {
    if (id !== txId) return;
    if (ch === '.' || ch === '-') {
      const dur = ch === '.' ? 220 : 600;
      if (l) l.className = 'led-on';
      if (s) s.textContent = 'Transmitindo "' + txt.toUpperCase() + '"';
      tocarBuzzer(dur - 20);
      await esperar(dur);
      if (id !== txId) return;
      if (l) l.className = 'led-off';
      await esperar(200);
    } else { await esperar(ch === '/' ? 700 : 350); }
  }
  if (id === txId && s) s.textContent = 'Transmissao concluida!';
}

function mudarLcd(l1, l2) {
  document.getElementById('lcd-line-1').textContent = l1.padEnd(16, ' ').slice(0, 16);
  document.getElementById('lcd-line-2').textContent = l2.padEnd(16, ' ').slice(0, 16);
}

desenharMatriz('feliz');
