import { SERVER_URL } from './config.js';

const isTouchDevice = (() => {
  if ('ontouchstart' in window) return true;
  if (navigator.maxTouchPoints > 0) return true;
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return true;
  return false;
})();
const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(navigator.userAgent);
const isMobile = isTouchDevice || isMobileUA;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let W = window.innerWidth, H = window.innerHeight;
const dpr = Math.min(window.devicePixelRatio || 1, 2);

function resize() {
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = Math.floor(W * dpr);
  canvas.height = Math.floor(H * dpr);
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (isMobile) {
    updateJoystickRect();
    checkOrientation();
  }
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    resize();
    if (isMobile) { updateJoystickRect(); checkOrientation(); }
  }, 200);
});
resize();

const lengthEl = document.getElementById('length');
const killsEl = document.getElementById('kills');
const coinsEl = document.getElementById('coins');
const boostEl = document.getElementById('boost');
const statusEl = document.getElementById('status');
const lbListEl = document.getElementById('lb-list');
const deathScreen = document.getElementById('deathScreen');
const finalLengthEl = document.getElementById('finalLength');
const finalKillsEl = document.getElementById('finalKills');
const respawnBtn = document.getElementById('respawnBtn');
const touchControls = document.getElementById('touchControls');
const joystick = document.getElementById('joystick');
const joystickKnob = document.getElementById('joystickKnob');
const boostBtn = document.getElementById('boostBtn');
const rotateNotice = document.getElementById('rotateNotice');

function setStatus(text, cls = '') {
  statusEl.textContent = text;
  statusEl.className = cls;
}

let myId = null;
let worldW = 3500, worldH = 2500;
let lastState = null, prevState = null;
let lastStateTime = 0, prevStateTime = 0;
let camX = 0, camY = 0;
let inputAngle = 0;
let inputBoost = false;
let mouseX = W / 2, mouseY = H / 2;
let mouseActive = false;
let wasAlive = true;
const keys = {};

let joystickActive = false;
let joystickTouchId = null;
let joystickVector = { x: 0, y: 0 };
let boostTouchId = null;
const JOYSTICK_MAX_DIST = 55;
let joystickRect = null;

let ws = null;
let reconnectTimer = null;

// ============ МОБИЛЬНОЕ УПРАВЛЕНИЕ ============
function initTouchControls() {
  if (!isMobile) return;
  touchControls.classList.add('visible');
  checkOrientation();
  updateJoystickRect();
}

function updateJoystickRect() {
  if (!joystick) return;
  joystickRect = joystick.getBoundingClientRect();
}

function checkOrientation() {
  if (!isMobile) return;
  const isPortrait = window.innerHeight > window.innerWidth;
  if (isPortrait) rotateNotice.classList.add('show');
  else rotateNotice.classList.remove('show');
}

function onJoystickStart(e) {
  e.preventDefault();
  if (joystickTouchId !== null) return;
  const touch = e.changedTouches[0];
  joystickTouchId = touch.identifier;
  joystickActive = true;
  joystick.classList.add('active');
  updateJoystickRect();
  updateJoystickFromTouch(touch);
}

function onJoystickMove(e) {
  e.preventDefault();
  if (joystickTouchId === null) return;
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i];
    if (touch.identifier === joystickTouchId) {
      updateJoystickFromTouch(touch);
      break;
    }
  }
}

function onJoystickEnd(e) {
  e.preventDefault();
  if (joystickTouchId === null) return;
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i];
    if (touch.identifier === joystickTouchId) {
      resetJoystick();
      break;
    }
  }
}

function updateJoystickFromTouch(touch) {
  if (!joystickRect) updateJoystickRect();
  if (!joystickRect) return;
  const cx = joystickRect.left + joystickRect.width / 2;
  const cy = joystickRect.top + joystickRect.height / 2;
  let dx = touch.clientX - cx;
  let dy = touch.clientY - cy;
  const maxDist = joystickRect.width / 2;
  let nx = dx / maxDist;
  let ny = dy / maxDist;
  const nLen = Math.hypot(nx, ny);
  if (nLen > 1) { nx /= nLen; ny /= nLen; }
  const knobX = nx * JOYSTICK_MAX_DIST;
  const knobY = ny * JOYSTICK_MAX_DIST;
  joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
  if (Math.hypot(nx, ny) < 0.15) {
    joystickVector.x = 0;
    joystickVector.y = 0;
  } else {
    joystickVector.x = nx;
    joystickVector.y = ny;
    mouseActive = false;
  }
}

function resetJoystick() {
  joystickActive = false;
  joystickTouchId = null;
  joystick.classList.remove('active');
  joystickKnob.style.transform = 'translate(0, 0)';
  joystickVector.x = 0;
  joystickVector.y = 0;
}

function onBoostStart(e) {
  e.preventDefault();
  if (boostTouchId !== null) return;
  const touch = e.changedTouches[0];
  boostTouchId = touch.identifier;
  boostBtn.classList.add('pressed');
  inputBoost = true;
}

function onBoostEnd(e) {
  e.preventDefault();
  if (boostTouchId === null) return;
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i];
    if (touch.identifier === boostTouchId) {
      boostTouchId = null;
      boostBtn.classList.remove('pressed');
      inputBoost = false;
      break;
    }
  }
}

if (isMobile) {
  joystick.addEventListener('touchstart', onJoystickStart, { passive: false });
  joystick.addEventListener('touchmove', onJoystickMove, { passive: false });
  joystick.addEventListener('touchend', onJoystickEnd, { passive: false });
  joystick.addEventListener('touchcancel', onJoystickEnd, { passive: false });

  boostBtn.addEventListener('touchstart', onBoostStart, { passive: false });
  boostBtn.addEventListener('touchend', onBoostEnd, { passive: false });
  boostBtn.addEventListener('touchcancel', onBoostEnd, { passive: false });
}

initTouchControls();

// ============ СЕТЬ ============
function connect() {
  setStatus('Подключение...');
  try { ws = new WebSocket(SERVER_URL); }
  catch { setStatus('Не удалось подключиться', 'error'); return; }

  ws.onopen = () => {
    setStatus('Подключено', 'connected');

    const savedName = localStorage.getItem('snakeio_playerName');
    if (savedName && savedName.trim()) {
      ws.send(JSON.stringify({ type: 'setName', name: savedName.trim().slice(0, 14) }));
    }

    const savedColor = localStorage.getItem('snakeio_color');
    if (savedColor && /^#[0-9a-fA-F]{6}$/.test(savedColor)) {
      ws.send(JSON.stringify({ type: 'setColor', color: savedColor }));
    }
  };

  ws.onmessage = (event) => {
    let msg;
    try { msg = JSON.parse(event.data); } catch { return; }

    if (msg.type === 'welcome') {
      myId = msg.id;
      worldW = msg.worldW;
      worldH = msg.worldH;
    } else if (msg.type === 'state') {
      prevState = lastState;
      prevStateTime = lastStateTime;
      lastState = msg;
      lastStateTime = performance.now();
      updateHUD();
      updateLeaderboard();
      checkDeath();
    } else if (msg.type === 'error') {
      setStatus(msg.message || 'Ошибка', 'error');
    }
  };

  ws.onclose = () => {
    setStatus('Соединение потеряно', 'error');
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => { reconnectTimer = null; connect(); }, 3000);
    }
  };

  ws.onerror = () => setStatus('Ошибка соединения', 'error');
}

function checkDeath() {
  if (!lastState || !myId) return;
  const me = lastState.snakes.find(s => s.id === myId);
  if (!me && wasAlive) {
    wasAlive = false;
    finalLengthEl.textContent = lengthEl.textContent;
    finalKillsEl.textContent = killsEl.textContent;
    deathScreen.classList.add('show');
  } else if (me) {
    wasAlive = true;
    deathScreen.classList.remove('show');
  }
}

function sendInput() {
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify({ type: 'input', angle: inputAngle, boost: inputBoost }));
  }
}
setInterval(sendInput, 50);

connect();

// ============ ВВОД ============
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  keys[k] = true;
  if (k === ' ') { inputBoost = true; e.preventDefault(); }
  if (['arrowup','arrowdown','arrowleft','arrowright'].includes(k)) e.preventDefault();
});
window.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  keys[k] = false;
  if (k === ' ') inputBoost = false;
});

canvas.addEventListener('mousemove', (e) => {
  if (isMobile) return;
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  mouseActive = true;
});

respawnBtn.addEventListener('click', () => {
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify({ type: 'respawn' }));
  }
  deathScreen.classList.remove('show');
});

// ============ ИНТЕРПОЛЯЦИЯ ============
function lerp(a, b, t) { return a + (b - a) * t; }
function lerpAngle(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

function getInterpolatedState() {
  if (!lastState) return null;
  if (!prevState) return lastState;
  const now = performance.now();
  const interval = lastStateTime - prevStateTime;
  if (interval <= 0) return lastState;
  let t = (now - lastStateTime) / interval;
  t = Math.max(0, Math.min(1, t));

  const prevById = new Map();
  for (const s of prevState.snakes) prevById.set(s.id, s);

  return {
    snakes: lastState.snakes.map(s => {
      const p = prevById.get(s.id);
      if (!p) return s;
      const segments = s.segments.map((seg, i) => {
        const ps = p.segments[i] || seg;
        return { x: lerp(ps.x, seg.x, t), y: lerp(ps.y, seg.y, t) };
      });
      return {
        ...s,
        x: lerp(p.x, s.x, t),
        y: lerp(p.y, s.y, t),
        angle: lerpAngle(p.angle, s.angle, t),
        segments
      };
    }),
    foods: lastState.foods,
    tick: lastState.tick
  };
}

// ============ HUD ============
function updateHUD() {
  if (!lastState || !myId) return;
  const me = lastState.snakes.find(s => s.id === myId);
  if (!me) return;
  lengthEl.textContent = me.bodySegments;
  killsEl.textContent = me.kills || 0;
  coinsEl.textContent = me.coins || 0;
  boostEl.textContent = Math.round(me.boost);
}

function updateLeaderboard() {
  if (!lastState) return;
  const sorted = [...lastState.snakes].sort((a, b) => b.bodySegments - a.bodySegments).slice(0, 5);
  let html = '';
  sorted.forEach((s, i) => {
    const cls = s.id === myId ? 'lb-row you' : 'lb-row';
    html += `<div class="${cls}">
      <span>${i + 1}.</span>
      <span class="lb-name">${s.name || s.id}</span>
      <span class="lb-len">${s.bodySegments}</span>
    </div>`;
  });
  lbListEl.innerHTML = html;
}

// ============ РЕНДЕР ============
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `rgb(${r},${g},${b})`;
}

function drawSnake(s) {
  if (!s.segments || !s.segments.length) return;
  const isMe = s.id === myId;
  const glow = isMe ? 1 : 0.5;

  for (let i = s.segments.length - 1; i >= 0; i--) {
    const p = s.segments[i];
    const t = i / Math.max(1, s.segments.length - 1);
    const radius = 10 * (1 - t * 0.5);
    ctx.save();
    ctx.shadowColor = s.color;
    ctx.shadowBlur = (i === 0 ? 20 : i < 3 ? 12 : 4) * glow;
    const grad = ctx.createRadialGradient(p.x - radius * 0.35, p.y - radius * 0.35, 0, p.x, p.y, radius);
    grad.addColorStop(0, i === 0 ? '#fff' : shade(s.color, 60));
    grad.addColorStop(0.5, s.color);
    grad.addColorStop(1, shade(s.color, -50));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const dir = s.angle;
  const perpX = -Math.sin(dir), perpY = Math.cos(dir);
  const e1x = s.x + Math.cos(dir) * 4 + perpX * 5;
  const e1y = s.y + Math.sin(dir) * 4 + perpY * 5;
  const e2x = s.x + Math.cos(dir) * 4 - perpX * 5;
  const e2y = s.y + Math.sin(dir) * 4 - perpY * 5;

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(e1x, e1y, 3.3, 0, Math.PI * 2);
  ctx.arc(e2x, e2y, 3.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(e1x + Math.cos(dir) * 1.2, e1y + Math.sin(dir) * 1.2, 1.6, 0, Math.PI * 2);
  ctx.arc(e2x + Math.cos(dir) * 1.2, e2y + Math.sin(dir) * 1.2, 1.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.font = 'bold 12px "Segoe UI", Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = isMe ? '#0f0' : '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 4;
  ctx.fillText(s.name || s.id, s.x, s.y - 22);
  ctx.restore();
}

function updateCamera(state) {
  if (!myId) return;
  const me = state.snakes.find(s => s.id === myId);
  if (!me) return;
  const tx = me.x - W / 2;
  const ty = me.y - H / 2;
  camX += (tx - camX) * 0.15;
  camY += (ty - camY) * 0.15;
  camX = Math.max(0, Math.min(worldW - W, camX));
  camY = Math.max(0, Math.min(worldH - H, camY));
}

function updateInput(state) {
  if (!myId) return;
  const me = state.snakes.find(s => s.id === myId);
  if (!me) return;

  if (isMobile && (joystickVector.x !== 0 || joystickVector.y !== 0)) {
    inputAngle = Math.atan2(joystickVector.y, joystickVector.x);
    mouseActive = false;
    return;
  }

  let dx = 0, dy = 0;
  if (keys['w'] || keys['ц'] || keys['arrowup']) dy -= 1;
  if (keys['s'] || keys['ы'] || keys['arrowdown']) dy += 1;
  if (keys['a'] || keys['ф'] || keys['arrowleft']) dx -= 1;
  if (keys['d'] || keys['в'] || keys['arrowright']) dx += 1;

  if (dx !== 0 || dy !== 0) {
    inputAngle = Math.atan2(dy, dx);
    mouseActive = false;
  } else if (mouseActive && !isMobile) {
    inputAngle = Math.atan2(mouseY + camY - me.y, mouseX + camX - me.x);
  }
}

function draw() {
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, W, H);

  const state = getInterpolatedState();
  if (!state) return;

  updateInput(state);
  updateCamera(state);

  ctx.save();
  ctx.translate(-camX, -camY);

  const gs = 60;
  ctx.strokeStyle = 'rgba(80,120,180,0.07)';
  ctx.lineWidth = 1;
  const sx = Math.floor(camX / gs) * gs;
  const sy = Math.floor(camY / gs) * gs;
  for (let x = sx; x <= camX + W + gs; x += gs) {
    ctx.beginPath(); ctx.moveTo(x, camY); ctx.lineTo(x, camY + H); ctx.stroke();
  }
  for (let y = sy; y <= camY + H + gs; y += gs) {
    ctx.beginPath(); ctx.moveTo(camX, y); ctx.lineTo(camX + W, y); ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255,70,70,0.4)';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, worldW, worldH);

  for (const f of state.foods) {
    const rare = f.type === 'rare';
    const grad = ctx.createRadialGradient(f.x - f.r * 0.3, f.y - f.r * 0.3, 0, f.x, f.y, f.r);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.4, rare ? '#7fddff' : '#ff5577');
    grad.addColorStop(1, rare ? '#0088cc' : '#cc0033');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.fill();
  }

  const sorted = [...state.snakes].sort((a, b) => (a.id === myId ? 1 : 0) - (b.id === myId ? 1 : 0));
  for (const s of sorted) drawSnake(s);

  ctx.restore();
}

function loop() {
  draw();
  requestAnimationFrame(loop);
}
loop();
