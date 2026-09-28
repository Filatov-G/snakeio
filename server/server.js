import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 8080;
const MAX_PLAYERS = 20;
const TICK_RATE = 30;
const BROADCAST_RATE = 15;
const STEP = 1000 / TICK_RATE;
const RESET_INTERVAL_MS = 30 * 60 * 1000;

const WORLD_W = 3500;
const WORLD_H = 2500;
const HEAD_RADIUS = 11;
const BODY_RADIUS = 10;
const SEGMENT_SPACING = 4;
const FOOD_RADIUS = 7;
const BASE_SPEED = 3.0;
const TURN_SPEED = 0.13;
const BOT_TURN_SPEED = 0.09;
const BOOST_MULTIPLIER = 1.9;
const BOOST_DRAIN = 0.6;
const BOOST_REGEN = 0.35;
const BOOST_MAX = 100;
const BOOST_MIN_TO_START = 15;
const FOOD_COUNT = 90;
const BOT_COUNT = 3;

const rand = (min, max) => min + Math.random() * (max - min);
const dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };

function rotateToward(cur, tgt, step) {
  let d = tgt - cur;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  if (Math.abs(d) <= step) return tgt;
  return cur + Math.sign(d) * step;
}

function makeSnake(x, y, angle, color, isPlayer) {
  const body = [];
  for (let i = 0; i < 12; i++) {
    body.push({ x: x - Math.cos(angle) * i * SEGMENT_SPACING, y: y - Math.sin(angle) * i * SEGMENT_SPACING });
  }
  return {
    x, y, angle, targetAngle: angle, color, isPlayer, alive: true,
    body, bodySegments: 12, segments: [],
    speed: isPlayer ? BASE_SPEED : BASE_SPEED * 0.92,
    boost: BOOST_MAX, isBoosting: false,
    inputAngle: angle, inputBoost: false,
    id: '', name: '', score: 0, kills: 0, coins: 0
  };
}

function updateBody(s) {
  let tx = s.x, ty = s.y;
  for (const seg of s.body) {
    const dx = tx - seg.x, dy = ty - seg.y;
    const d = Math.hypot(dx, dy);
    if (d > 0) {
      const r = SEGMENT_SPACING / d;
      seg.x = tx - dx * r;
      seg.y = ty - dy * r;
    }
    tx = seg.x; ty = seg.y;
  }
}

function computeSegments(s) {
  const r = [{ x: s.x, y: s.y }];
  for (const b of s.body) r.push({ x: b.x, y: b.y });
  s.segments = r;
}

function dieSnake(world, snake, killer) {
  if (!snake.alive) return;
  snake.alive = false;

  for (let i = 0; i < snake.segments.length; i += 2) {
    const p = snake.segments[i];
    world.foods.push({ x: p.x, y: p.y, r: FOOD_RADIUS, type: 'common', xp: 10, lengthGain: 1 });
  }

  if (killer && killer.isPlayer && !snake.isPlayer) {
    killer.kills++;
    killer.coins++;
    world.events.push({ type: 'kill', killerId: killer.id, victimId: snake.id });
  }
}

function moveSnake(world, s, dt) {
  const turn = s.isPlayer ? TURN_SPEED : BOT_TURN_SPEED;
  s.targetAngle = s.inputAngle;
  s.angle = rotateToward(s.angle, s.targetAngle, turn * dt);

  let speed = s.speed;
  if (s.isPlayer) {
    if (s.inputBoost && s.boost > 0) {
      s.isBoosting = true;
    } else if (!s.inputBoost) {
      s.isBoosting = false;
    }
    if (s.isBoosting) {
      s.boost = Math.max(0, s.boost - BOOST_DRAIN * dt);
      speed = s.speed * BOOST_MULTIPLIER;
      if (s.boost <= 0) s.isBoosting = false;
    } else {
      s.boost = Math.min(BOOST_MAX, s.boost + BOOST_REGEN * dt);
    }
  }

  s.x += Math.cos(s.angle) * speed * dt;
  s.y += Math.sin(s.angle) * speed * dt;
  updateBody(s);
  computeSegments(s);

  for (const o of world.snakes) {
    if (!o.alive || o === s) continue;
    const dx = s.x - o.x, dy = s.y - o.y;
    if (dx * dx + dy * dy < (HEAD_RADIUS + HEAD_RADIUS) ** 2) return dieSnake(world, s, o);
  }

  if (s.x - HEAD_RADIUS < 0 || s.x + HEAD_RADIUS > WORLD_W ||
      s.y - HEAD_RADIUS < 0 || s.y + HEAD_RADIUS > WORLD_H) {
    return dieSnake(world, s, null);
  }

  for (const o of world.snakes) {
    if (!o.alive || o === s) continue;
    for (let i = 1; i < o.segments.length; i++) {
      const p = o.segments[i];
      const dx = s.x - p.x, dy = s.y - p.y;
      if (dx * dx + dy * dy < (HEAD_RADIUS + BODY_RADIUS - 2) ** 2) return dieSnake(world, s, o);
    }
  }

  for (let i = world.foods.length - 1; i >= 0; i--) {
    const f = world.foods[i];
    const dx = s.x - f.x, dy = s.y - f.y;
    if (dx * dx + dy * dy < (HEAD_RADIUS + f.r) ** 2) {
      world.foods.splice(i, 1);
      const gain = f.lengthGain || 1;
      for (let k = 0; k < gain; k++) {
        const last = s.body[s.body.length - 1];
        s.body.push({ x: last.x, y: last.y });
      }
      s.bodySegments += gain;
      if (s.isPlayer) s.score += f.xp || 10;
    }
  }
}

function botThink(world, bot) {
  let closest = null, cd = Infinity;
  for (const f of world.foods) {
    const d = dist2(bot.x, bot.y, f.x, f.y);
    if (d < cd) { cd = d; closest = f; }
  }
  if (!closest) return;
  let desired = Math.atan2(closest.y - bot.y, closest.x - bot.x);
  const m = 120;
  if (bot.x < m) desired = 0;
  if (bot.x > WORLD_W - m) desired = Math.PI;
  if (bot.y < m) desired = Math.PI / 2;
  if (bot.y > WORLD_H - m) desired = -Math.PI / 2;
  bot.inputAngle = desired;
}

function spawnFood(world) {
  let tries = 0;
  while (tries++ < 100) {
    const rare = Math.random() < 0.22;
    const f = {
      x: rand(FOOD_RADIUS + 5, WORLD_W - FOOD_RADIUS - 5),
      y: rand(FOOD_RADIUS + 5, WORLD_H - FOOD_RADIUS - 5),
      r: rare ? FOOD_RADIUS * 1.4 : FOOD_RADIUS,
      type: rare ? 'rare' : 'common',
      xp: rare ? 30 : 10,
      lengthGain: rare ? 2 : 1
    };
    let ok = true;
    for (const o of world.foods) if (dist2(f.x, f.y, o.x, o.y) < (f.r + o.r + 5) ** 2) { ok = false; break; }
    if (ok) { world.foods.push(f); return true; }
  }
  return false;
}

const BOT_COLORS = ['#ff3366','#ffaa00','#ffee00','#00ff66','#00ddff','#4477ff','#aa44ff','#ff88cc','#ff4488','#ff6644'];
function pickColor(used) {
  const a = BOT_COLORS.filter(c => !used.includes(c));
  const p = a.length ? a : BOT_COLORS;
  return p[Math.floor(Math.random() * p.length)];
}

function createWorld() {
  const w = { snakes: [], foods: [], events: [], tick: 0 };
  const used = [];
  for (let i = 0; i < BOT_COUNT; i++) {
    const bx = rand(80, WORLD_W - 80);
    const by = rand(80, WORLD_H - 80);
    const color = pickColor(used);
    used.push(color);
    const bot = makeSnake(bx, by, rand(0, Math.PI * 2), color, false);
    bot.id = 'bot_' + i;
    bot.name = 'Бот';
    computeSegments(bot);
    w.snakes.push(bot);
  }
  for (let i = 0; i < FOOD_COUNT; i++) spawnFood(w);
  return w;
}

function stepWorld(world, dt) {
  world.tick++;
  world.events.length = 0;
  for (const s of world.snakes) {
    if (!s.alive) continue;
    if (!s.isPlayer) botThink(world, s);
    moveSnake(world, s, dt);
  }
  while (world.foods.length < FOOD_COUNT) if (!spawnFood(world)) break;
  world.snakes = world.snakes.filter(s => s.alive || s.isPlayer);
  const aliveBots = world.snakes.filter(s => !s.isPlayer && s.alive).length;
  for (let i = aliveBots; i < BOT_COUNT; i++) {
    const bx = rand(80, WORLD_W - 80);
    const by = rand(80, WORLD_H - 80);
    const color = pickColor(world.snakes.map(s => s.color));
    const bot = makeSnake(bx, by, rand(0, Math.PI * 2), color, false);
    bot.id = 'bot_' + Math.random().toString(36).slice(2, 8);
    bot.name = 'Бот';
    computeSegments(bot);
    world.snakes.push(bot);
  }
}

const world = createWorld();
const players = new Map();

function resetWorld(reason) {
  console.log(`🔄 СБРОС СЕРВЕРА: ${reason}`);
  for (const ws of players.keys()) {
    try {
      ws.send(JSON.stringify({ type: 'error', message: 'Сервер перезагружается, обновите страницу' }));
      ws.close();
    } catch (e) {}
  }
  players.clear();

  const newWorld = createWorld();
  world.snakes = newWorld.snakes;
  world.foods = newWorld.foods;
  world.events = newWorld.events;
  world.tick = 0;

  console.log(`✅ Мир пересоздан. Ботов: ${world.snakes.length}, еды: ${world.foods.length}`);
}

setInterval(() => {
  resetWorld('прошло 30 минут');
}, RESET_INTERVAL_MS);

const wss = new WebSocketServer({ port: PORT });

console.log(`🐍 Сервер запущен на порту ${PORT}`);

wss.on('connection', (ws) => {
  if (players.size >= MAX_PLAYERS) {
    ws.send(JSON.stringify({ type: 'error', message: 'Сервер полон' }));
    ws.close();
    return;
  }

  const id = 'p_' + Math.random().toString(36).slice(2, 8);
  const x = rand(200, WORLD_W - 200);
  const y = rand(200, WORLD_H - 200);
  const snake = makeSnake(x, y, rand(0, Math.PI * 2), '#00ff66', true);
  snake.id = id;
  snake.name = 'Игрок_' + id.slice(2, 5);
  computeSegments(snake);
  world.snakes.push(snake);
  players.set(ws, { id, snake });

  console.log(`✅ ${id} подключился (${players.size}/${MAX_PLAYERS})`);

  ws.send(JSON.stringify({ type: 'welcome', id, worldW: WORLD_W, worldH: WORLD_H }));

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      const rec = players.get(ws);
      if (!rec) return;
      const current = rec.snake;

      if (msg.type === 'input') {
        if (current && current.alive) {
          current.inputAngle = msg.angle;
          current.inputBoost = !!msg.boost;
        }
      } else if (msg.type === 'setName') {
        if (current) current.name = String(msg.name || '').slice(0, 14) || 'Игрок';
      } else if (msg.type === 'setColor') {
        const color = String(msg.color || '').slice(0, 9);
        if (/^#[0-9a-fA-F]{6}$/.test(color)) {
          if (current) current.color = color;
        }
      } else if (msg.type === 'respawn') {
        if (!current || !current.alive) {
          const nx = rand(200, WORLD_W - 200);
          const ny = rand(200, WORLD_H - 200);
          const ns = makeSnake(nx, ny, rand(0, Math.PI * 2), current ? current.color : '#00ff66', true);
          ns.id = id;
          ns.name = current ? current.name : 'Игрок';
          ns.coins = current ? current.coins : 0;
          ns.kills = current ? current.kills : 0;
          computeSegments(ns);
          world.snakes.push(ns);
          rec.snake = ns;
        }
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    const rec = players.get(ws);
    if (rec && rec.snake) rec.snake.alive = false;
    players.delete(ws);
    console.log(`❌ ${id} отключился (${players.size}/${MAX_PLAYERS})`);
  });
});

let lastTime = Date.now();
let acc = 0;
setInterval(() => {
  const now = Date.now();
  const dtMs = Math.min(now - lastTime, 100);
  lastTime = now;
  acc += dtMs;
  let steps = 0;
  while (acc >= STEP && steps < 5) {
    stepWorld(world, STEP / 16.67);
    acc -= STEP;
    steps++;
  }
  if (steps >= 5) acc = 0;
}, STEP);

setInterval(() => {
  if (players.size === 0) return;
  const state = {
    type: 'state',
    tick: world.tick,
    snakes: world.snakes.filter(s => s.alive).map(s => ({
      id: s.id, isPlayer: s.isPlayer, name: s.name,
      x: Math.round(s.x * 10) / 10,
      y: Math.round(s.y * 10) / 10,
      angle: Math.round(s.angle * 100) / 100,
      color: s.color,
      bodySegments: s.bodySegments,
      isBoosting: s.isBoosting,
      boost: Math.round(s.boost),
      kills: s.kills || 0,
      coins: s.coins || 0,
      score: s.score || 0,
      segments: s.segments.map(p => ({ x: Math.round(p.x), y: Math.round(p.y) }))
    })),
    foods: world.foods.map(f => ({
      x: Math.round(f.x), y: Math.round(f.y),
      r: Math.round(f.r * 10) / 10, type: f.type
    })),
    events: world.events
  };
  const payload = JSON.stringify(state);
  for (const ws of players.keys()) {
    if (ws.readyState === 1) ws.send(payload);
  }
}, 1000 / BROADCAST_RATE);
