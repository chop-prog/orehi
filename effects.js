// Декоративные эффекты Cosmo: орехи падают из курсора, парят на первом экране, блоки плавно появляются.
// Орехи рисуются кодом на canvas — без картинок.
// При prefers-reduced-motion (в Windows — выключенные «Эффекты анимации») орехи из курсора остаются,
// но их меньше; покачивание, параллакс и анимации при прокрутке выключаются.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // any-pointer: на ноутбуке с сенсорным экраном основным считается касание, но мышь тоже есть
  const hasMouse = matchMedia('(any-pointer: fine)').matches;
  const SPRITE = 96; // размер спрайта в CSS-пикселях
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- Рисуем орехи (мультяшный стиль) ---------- */
  function sprite(draw) {
    const c = document.createElement('canvas');
    c.width = c.height = SPRITE * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.translate(SPRITE / 2, SPRITE / 2);
    ctx.scale(1.3, 1.3); // орех занимает почти весь спрайт, с запасом под тень
    ctx.shadowColor = 'rgba(0, 0, 0, .28)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    draw(ctx);
    return c;
  }
  const radial = (ctx, x, y, r, stops) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    return g;
  };
  const lines = (ctx, color, width, paths) => {
    ctx.save();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    paths.forEach((p) => { ctx.beginPath(); p(ctx); ctx.stroke(); });
    ctx.restore();
  };

  const NUTS = {
    almond: (ctx) => {
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.bezierCurveTo(20, -22, 21, 16, 0, 32);
      ctx.bezierCurveTo(-21, 16, -20, -22, 0, -32);
      ctx.fillStyle = radial(ctx, -7, -10, 40, [[0, '#d99456'], [0.55, '#a8622c'], [1, '#6f3b17']]);
      ctx.fill();
      lines(ctx, 'rgba(70, 35, 12, .35)', 1.2, [
        (c) => { c.moveTo(-4, -26); c.quadraticCurveTo(-10, 0, -4, 26); },
        (c) => { c.moveTo(4, -26); c.quadraticCurveTo(10, 0, 4, 26); },
        (c) => { c.moveTo(0, -28); c.lineTo(0, 28); },
      ]);
    },
    hazelnut: (ctx) => {
      ctx.beginPath();
      ctx.arc(0, 5, 26, 0, Math.PI * 2);
      ctx.fillStyle = radial(ctx, -9, -4, 36, [[0, '#c98443'], [0.6, '#8f4f20'], [1, '#5a2e10']]);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.beginPath();
      ctx.ellipse(0, -15, 19, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = radial(ctx, -4, -18, 22, [[0, '#ecd2ac'], [1, '#bf9563']]);
      ctx.fill();
      lines(ctx, 'rgba(120, 80, 40, .35)', 1, [
        (c) => { c.moveTo(-12, -15); c.lineTo(-6, -22); },
        (c) => { c.moveTo(0, -12); c.lineTo(0, -24); },
        (c) => { c.moveTo(12, -15); c.lineTo(6, -22); },
      ]);
      ctx.beginPath();
      ctx.arc(0, -26, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#7a4a22';
      ctx.fill();
    },
    pistachio: (ctx) => {
      ctx.beginPath();
      ctx.ellipse(0, 0, 21, 29, 0.15, 0, Math.PI * 2);
      ctx.fillStyle = radial(ctx, -7, -9, 36, [[0, '#f4e6c8'], [0.65, '#d9bf8f'], [1, '#a98a57']]);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.beginPath();
      ctx.ellipse(5, 1, 10, 21, 0.15, 0, Math.PI * 2);
      ctx.fillStyle = radial(ctx, 3, -4, 22, [[0, '#c3dd73'], [0.7, '#86a83a'], [1, '#5c7a1f']]);
      ctx.fill();
      ctx.strokeStyle = 'rgba(120, 50, 70, .55)';
      ctx.lineWidth = 2;
      ctx.stroke();
    },
    cashew: (ctx) => {
      // Почка: толстая дуга с закруглёнными концами
      ctx.beginPath();
      ctx.moveTo(-20, -20);
      ctx.bezierCurveTo(-34, -4, -24, 26, 2, 28);
      ctx.bezierCurveTo(24, 29, 32, 10, 26, -4);
      ctx.bezierCurveTo(22, -14, 10, -12, 9, -2);
      ctx.bezierCurveTo(8, 8, 0, 10, -5, 5);
      ctx.bezierCurveTo(-11, -1, -6, -14, -9, -21);
      ctx.bezierCurveTo(-11, -27, -17, -25, -20, -20);
      ctx.closePath();
      ctx.fillStyle = radial(ctx, -8, 8, 38, [[0, '#fbefd6'], [0.55, '#e8cd98'], [1, '#c29d5e']]);
      ctx.fill();
      lines(ctx, 'rgba(160, 120, 60, .3)', 1.2, [
        (c) => { c.moveTo(-15, -12); c.bezierCurveTo(-22, 4, -12, 20, 4, 21); },
      ]);
    },
    apricot: (ctx) => {
      // Сплющенная половинка с продольной складкой посередине
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.bezierCurveTo(22, -26, 32, -6, 26, 10);
      ctx.bezierCurveTo(20, 26, -6, 30, -20, 18);
      ctx.bezierCurveTo(-32, 6, -26, -22, 0, -24);
      ctx.closePath();
      ctx.fillStyle = radial(ctx, -8, -8, 38, [[0, '#ffc56a'], [0.5, '#f39030'], [1, '#c05a0c']]);
      ctx.fill();
      ctx.save();
      ctx.shadowColor = 'transparent';
      ctx.beginPath();
      ctx.moveTo(-2, -22);
      ctx.bezierCurveTo(6, -8, -6, 8, 2, 24);
      ctx.strokeStyle = 'rgba(140, 55, 0, .45)';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(1, -21);
      ctx.bezierCurveTo(9, -7, -3, 9, 5, 23);
      ctx.strokeStyle = 'rgba(255, 220, 160, .35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
      lines(ctx, 'rgba(140, 55, 0, .22)', 1, [
        (c) => { c.moveTo(-18, -6); c.quadraticCurveTo(-12, -2, -14, 6); },
        (c) => { c.moveTo(16, -10); c.quadraticCurveTo(12, -2, 18, 6); },
      ]);
    },
  };
  const KINDS = Object.keys(NUTS);
  const sprites = Object.fromEntries(KINDS.map((k) => [k, sprite(NUTS[k])]));

  /* ---------- Падающие орехи ---------- */
  let spawnNut = () => {}; // нужен и другим эффектам (горсть из корзины)
  {
    const canvas = document.createElement('canvas');
    canvas.className = 'nut-rain';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');
    const nuts = [];
    const MAX = reduced ? 12 : 28;
    const TRAIL_GAP = reduced ? 220 : 120; // мс между орехами из курсора
    let running = false;
    let lastSpawn = 0;
    let last = { x: 0, y: 0 };

    const resize = () => {
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener('resize', resize);

    function spawn(x, y, burst) {
      if (nuts.length >= MAX) nuts.shift();
      nuts.push({
        x, y,
        vx: burst ? rand(-4.5, 4.5) : rand(-1, 1),
        vy: burst ? rand(-8, -3.5) : rand(-2, -0.5),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.15, 0.15),
        size: burst ? rand(24, 34) : rand(20, 26),
        kind: pick(KINDS),
        life: 1,
        age: 0,
      });
      if (!running) { running = true; requestAnimationFrame(tick); }
    }

    function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = nuts.length - 1; i >= 0; i--) {
        const n = nuts[i];
        n.vy += 0.2;
        n.vx *= 0.985;
        n.x += n.vx;
        n.y += n.vy;
        n.rot += n.vr;
        // Орех живёт около секунды, потом тает
        if (++n.age > 40 || n.y > innerHeight - 40) n.life -= 0.05;
        if (n.y > innerHeight + 60 || n.life <= 0) { nuts.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = Math.max(0, n.life);
        ctx.translate(n.x, n.y);
        ctx.rotate(n.rot);
        ctx.drawImage(sprites[n.kind], -n.size / 2, -n.size / 2, n.size, n.size);
        ctx.restore();
      }
      if (nuts.length) requestAnimationFrame(tick);
      else running = false;
    }

    // Орехи не мешают работать с корзиной и окнами
    const busy = () => document.body.style.overflow === 'hidden';

    if (hasMouse) {
      addEventListener('pointermove', (e) => {
        if (busy() || e.pointerType === 'touch') return;
        const now = performance.now();
        const dist = Math.hypot(e.clientX - last.x, e.clientY - last.y);
        if (now - lastSpawn > TRAIL_GAP && dist > 14) {
          spawn(e.clientX, e.clientY, false);
          lastSpawn = now;
          last = { x: e.clientX, y: e.clientY };
        }
      }, { passive: true });
    }
    addEventListener('pointerdown', (e) => {
      if (busy() || e.target.closest?.('input, select, textarea')) return;
      const count = reduced ? 3 : e.pointerType === 'touch' ? 4 : 5;
      for (let i = 0; i < count; i++) spawn(e.clientX, e.clientY, true);
    }, { passive: true });
    spawnNut = spawn;
  }

  /* ---------- Живые планеты вместо «О» в слове COSMO ---------- */
  // Фото внутри .planet остаётся запасным вариантом, если canvas недоступен
  const planets = [];
  function makeBands(R) {
    // Длинная полосатая «развёртка» планеты; при вращении она прокручивается внутри круга
    const w = Math.ceil(R * 4), h = Math.ceil(R * 2);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    const colors = ['#9a5a2c', '#b8743e', '#d49a5e', '#ecc58e', '#f6dcae', '#c88446', '#a8673a', '#e7b47a', '#c27b40'];
    let y = 0;
    while (y < h) {
      const bh = rand(h * 0.04, h * 0.13);
      g.fillStyle = pick(colors);
      g.fillRect(0, y, w, bh + 1);
      y += bh;
    }
    // Волнистые завихрения и «пятна бурь»
    for (let i = 0; i < 70; i++) {
      g.globalAlpha = rand(0.15, 0.4);
      g.fillStyle = pick(colors);
      g.beginPath();
      g.ellipse(rand(0, w), rand(0, h), rand(R * 0.1, R * 0.5), rand(R * 0.02, R * 0.06), 0, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 0.9;
    g.fillStyle = '#f2d2a2';
    g.beginPath(); g.ellipse(w * 0.3, h * 0.62, R * 0.22, R * 0.11, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#9a5a2c';
    g.beginPath(); g.ellipse(w * 0.3, h * 0.62, R * 0.13, R * 0.06, 0, 0, Math.PI * 2); g.fill();
    // Копия первой половины в конец — бесшовная прокрутка
    g.globalAlpha = 1;
    g.drawImage(c, 0, 0, w / 2, h, w / 2, 0, w / 2, h);
    return c;
  }

  function shadeSphere(ctx, R) {
    // Объём: свет слева сверху, тень справа снизу.
    // Один градиент от точки света: блик → цвет планеты → тень, которая нарастает постепенно, без резкой границы
    const g = ctx.createRadialGradient(-R * 0.4, -R * 0.45, 0, -R * 0.4, -R * 0.45, R * 1.95);
    g.addColorStop(0, 'rgba(255, 248, 230, .42)');
    g.addColorStop(0.25, 'rgba(255, 248, 230, 0)');
    g.addColorStop(0.42, 'rgba(8, 9, 20, 0)');
    g.addColorStop(0.58, 'rgba(8, 9, 20, .08)');
    g.addColorStop(0.72, 'rgba(8, 9, 20, .2)');
    g.addColorStop(0.86, 'rgba(8, 9, 20, .34)');
    g.addColorStop(1, 'rgba(8, 9, 20, .46)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
  }

  const CRATERS = Array.from({ length: 16 }, () => ({ lon: rand(0, Math.PI * 2), lat: rand(-1.1, 1.1), r: rand(0.06, 0.17) }));

  // Синяя ракета, нарисованная носом вправо; L — длина
  function drawRocket(c, L) {
    c.fillStyle = '#1b3d9a';
    [-1, 1].forEach((s) => {
      c.beginPath();
      c.moveTo(-0.14 * L, 0.15 * L * s);
      c.lineTo(-0.5 * L, 0.38 * L * s);
      c.lineTo(-0.42 * L, 0.12 * L * s);
      c.closePath();
      c.fill();
    });
    const g = c.createLinearGradient(0, -0.2 * L, 0, 0.2 * L);
    g.addColorStop(0, '#a9d6ff');
    g.addColorStop(0.4, '#3d84f5');
    g.addColorStop(1, '#173f9c');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(0.55 * L, 0);
    c.quadraticCurveTo(0.3 * L, -0.21 * L, -0.1 * L, -0.19 * L);
    c.lineTo(-0.42 * L, -0.15 * L);
    c.quadraticCurveTo(-0.47 * L, 0, -0.42 * L, 0.15 * L);
    c.lineTo(-0.1 * L, 0.19 * L);
    c.quadraticCurveTo(0.3 * L, 0.21 * L, 0.55 * L, 0);
    c.fill();
    c.fillStyle = '#eef5ff'; // носовой обтекатель
    c.beginPath();
    c.moveTo(0.55 * L, 0);
    c.quadraticCurveTo(0.43 * L, -0.13 * L, 0.33 * L, -0.17 * L);
    c.lineTo(0.33 * L, 0.17 * L);
    c.quadraticCurveTo(0.43 * L, 0.13 * L, 0.55 * L, 0);
    c.fill();
    c.beginPath(); // иллюминатор
    c.arc(0.1 * L, 0, 0.075 * L, 0, Math.PI * 2);
    c.fillStyle = '#d8f0ff';
    c.fill();
    c.lineWidth = 0.03 * L;
    c.strokeStyle = '#0f2a6e';
    c.stroke();
    c.fillStyle = '#3a3f55'; // сопло
    c.fillRect(-0.5 * L, -0.09 * L, 0.08 * L, 0.18 * L);
  }

  const ORBIT = { tilt: -0.32, rx: 1.62, ry: 0.5 };

  function drawNutPlanet(p) {
    const { ctx, R } = p;
    const rot = p.rot;
    // Ракета летит по наклонной орбите: за планетой — меньше и бледнее, перед ней — крупнее
    const a = rot * 1.5;
    const pos = { x: Math.cos(a) * R * ORBIT.rx, y: Math.sin(a) * R * ORBIT.ry };
    const dx = -Math.sin(a) * ORBIT.rx, dy = Math.cos(a) * ORBIT.ry;
    const len = Math.hypot(dx, dy);
    const dir = { x: dx / len, y: dy / len };
    const front = Math.sin(a) > 0;
    const depth = 0.78 + 0.22 * Math.sin(a);
    const L = R * 0.95 * depth;

    // Выхлоп только из орешков: крупных и редких, чтобы каждый было видно
    if ((p.frame = (p.frame || 0) + 1) % 7 === 0) {
      p.trail.push({
        x: pos.x - dir.x * L * 0.6, y: pos.y - dir.y * L * 0.6,
        vx: -dir.x * R * 0.016 + rand(-0.2, 0.2), vy: -dir.y * R * 0.016 + rand(-0.2, 0.2),
        size: R * rand(0.46, 0.58) * depth, rot: rand(0, 6), vr: rand(-0.04, 0.04), life: 1, front, kind: pick(KINDS),
      });
    }
    if (p.trail.length > 10) p.trail.shift();
    p.trail.forEach((t) => { t.x += t.vx; t.y += t.vy; t.rot += t.vr; t.life -= 0.016; t.size *= 0.994; });
    p.trail = p.trail.filter((t) => t.life > 0);

    const layer = (isFront) => {
      ctx.save();
      ctx.rotate(ORBIT.tilt);
      p.trail.filter((t) => t.front === isFront).forEach((t) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, t.life) * (isFront ? 1 : 0.7);
        ctx.translate(t.x, t.y);
        ctx.rotate(t.rot);
        ctx.drawImage(sprites[t.kind], -t.size / 2, -t.size / 2, t.size, t.size);
        ctx.restore();
      });
      if (front === isFront) {
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(Math.atan2(dir.y, dir.x));
        ctx.globalAlpha = isFront ? 1 : 0.8;
        ctx.shadowColor = 'rgba(80, 160, 255, .6)';
        ctx.shadowBlur = R * 0.15;
        drawRocket(ctx, L);
        ctx.restore();
      }
      ctx.restore();
    };
    layer(false);
    // Шар с прокручиваемыми полосами
    ctx.save();
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.clip();
    ctx.rotate(-0.32);
    const tex = p.tex, tw = tex.width / 2;
    const off = (rot * tw / (Math.PI * 2)) % tw;
    ctx.drawImage(tex, -off - R, -R * 1.15, tex.width, R * 2.3);
    ctx.restore();
    shadeSphere(ctx, R);
    layer(true);
  }

  function drawApricotPlanet(p) {
    const { ctx, R } = p;
    const rot = p.rot;
    // Луна-миндалина на наклонной орбите
    const ma = rot * 2.2;
    const moon = { x: Math.cos(ma) * R * 1.55, y: Math.sin(ma) * R * 0.42, front: Math.sin(ma) > 0 };
    const drawMoon = () => {
      ctx.save();
      ctx.rotate(0.28);
      const s = R * (moon.front ? 0.62 : 0.48);
      ctx.translate(moon.x, moon.y);
      ctx.rotate(ma * 1.5);
      ctx.globalAlpha = moon.front ? 1 : 0.6;
      ctx.drawImage(sprites.almond, -s / 2, -s / 2, s, s);
      ctx.restore();
    };
    ctx.save();
    ctx.rotate(0.28);
    ctx.strokeStyle = 'rgba(244, 239, 230, .16)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(0, 0, R * 1.55, R * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    if (!moon.front) drawMoon();
    // Атмосфера
    const atm = ctx.createRadialGradient(0, 0, R * 0.9, 0, 0, R * 1.35);
    atm.addColorStop(0, 'rgba(255, 150, 50, .45)');
    atm.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = atm;
    ctx.beginPath(); ctx.arc(0, 0, R * 1.35, 0, Math.PI * 2); ctx.fill();
    // Поверхность — один градиент от точки света до теневого края: цвет меняется плавно,
    // без наложения второго слоя тени (оно и давало заметную границу)
    const surf = ctx.createRadialGradient(-R * 0.38, -R * 0.42, 0, -R * 0.38, -R * 0.42, R * 1.78);
    [[0, '#ffd88c'], [0.12, '#ffc468'], [0.25, '#fbab45'], [0.38, '#f6992f'], [0.5, '#ee8a25'],
      [0.62, '#e27b1d'], [0.73, '#d06c17'], [0.83, '#b95c12'], [0.92, '#9e4c0e'], [1, '#843f0b']]
      .forEach(([o, c]) => surf.addColorStop(o, c));
    ctx.fillStyle = surf;
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
    // Кратеры смещаются при вращении и сжимаются у края — получается объём
    ctx.save();
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.clip();
    CRATERS.forEach((c) => {
      const lon = c.lon + rot;
      const depth = Math.cos(lon);
      if (depth <= 0.05) return;
      const x = Math.sin(lon) * Math.cos(c.lat) * R;
      const y = Math.sin(c.lat) * R * 0.85;
      const r = c.r * R;
      const fade = Math.min(1, depth * 2.5); // у края кратер плавно исчезает, а не обрывается
      ctx.fillStyle = `rgba(150, 60, 0, ${0.45 * fade})`;
      ctx.beginPath(); ctx.ellipse(x, y, r * depth, r, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255, 210, 140, ${0.35 * fade})`;
      ctx.beginPath(); ctx.ellipse(x - r * 0.18 * depth, y - r * 0.18, r * 0.7 * depth, r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
    if (moon.front) drawMoon();
  }

  function initPlanets() {
    document.querySelectorAll('.planet').forEach((span, i) => {
      const canvas = document.createElement('canvas');
      canvas.className = 'planet__canvas';
      canvas.setAttribute('aria-hidden', 'true');
      span.append(canvas);
      const p = { span, canvas, ctx: canvas.getContext('2d'), kind: i === 0 ? 'nut' : 'apricot', rot: rand(0, 6), boost: 0, boostRate: 1 };
      p.trail = []; // орешки из сопла ракеты
      planets.push(p);
      span.classList.add('planet--live');
    });
    sizePlanets();
    addEventListener('resize', sizePlanets);
  }

  function sizePlanets() {
    planets.forEach((p) => {
      const S = p.span.getBoundingClientRect().width;
      const size = S * 2.6;
      p.canvas.style.width = p.canvas.style.height = `${size}px`;
      p.canvas.width = p.canvas.height = Math.round(size * dpr);
      p.R = S / 2;
      p.tex = makeBands(p.R);
    });
  }

  function renderPlanets() {
    planets.forEach((p) => {
      const { ctx, canvas } = p;
      p.boostRate = 1 + p.boost;
      p.rot += 0.004 * p.boostRate;
      p.boost *= 0.96;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width / dpr / 2, canvas.height / dpr / 2);
      if (p.kind === 'nut') drawNutPlanet(p);
      else drawApricotPlanet(p);
    });
  }

  if (document.querySelector('.planet') && document.createElement('canvas').getContext) {
    // Ждём шрифт: размер «О» зависит от него
    (document.fonts?.ready || Promise.resolve()).then(() => {
      initPlanets();
      if (reduced) return renderPlanets();
      let visible = true;
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(document.querySelector('.hero'));
      const loop = () => { if (visible && !document.hidden) renderPlanets(); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    });
  }

  /* ---------- Парящие орехи на первом экране ---------- */
  const hero = document.querySelector('.hero');
  if (hero) {
    const layer = document.createElement('div');
    layer.className = 'floaters';
    layer.setAttribute('aria-hidden', 'true');
    // x, y — положение в процентах, s — размер, d — глубина (чем больше, тем ближе и сильнее параллакс)
    const spots = [
      { k: 'pistachio', x: 8, y: 14, s: 96, d: 1.2, r: -24 },
      { k: 'almond', x: 90, y: 13, s: 84, d: 0.8, r: 32 },
      { k: 'apricot', x: 5, y: 66, s: 120, d: 1.6, r: 10 },
      { k: 'hazelnut', x: 94, y: 60, s: 96, d: 1.1, r: -8 },
      { k: 'cashew', x: 30, y: 92, s: 70, d: 0.6, r: 30 },
      { k: 'almond', x: 64, y: 93, s: 80, d: 1.3, r: -50 },
      { k: 'pistachio', x: 70, y: 5, s: 52, d: 0.4, r: 70 },
      { k: 'cashew', x: 28, y: 6, s: 46, d: 0.3, r: -30 },
    ];
    const floaters = spots.map((p, i) => {
      const img = new Image();
      img.src = sprites[p.k].toDataURL();
      img.alt = '';
      img.className = 'floater';
      img.style.cssText = `left:${p.x}%;top:${p.y}%;width:${p.s}px;--r:${p.r}deg;--delay:${-i * 1.3}s;` +
        (p.d < 0.6 ? 'filter:blur(1.5px);opacity:.75;' : '');
      layer.append(img);
      return { img, d: p.d };
    });
    hero.prepend(layer);

    if (!reduced) {
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      const move = () => {
        cx += (tx - cx) * 0.08;
        cy += (ty - cy) * 0.08;
        floaters.forEach(({ img, d }) => { img.style.translate = `${cx * d * 26}px ${cy * d * 26}px`; });
        raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(move) : 0;
      };
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - 0.5;
        ty = (e.clientY - r.top) / r.height - 0.5;
        if (!raf) raf = requestAnimationFrame(move);
      });

      // При прокрутке название чуть уезжает и уменьшается
      const word = hero.querySelector('.hero__word');
      addEventListener('scroll', () => {
        const y = Math.min(scrollY, hero.offsetHeight);
        word.style.transform = `translateY(${y * 0.25}px) scale(${1 - y * 0.00025})`;
        layer.style.transform = `translateY(${y * -0.15}px)`;
      }, { passive: true });
    }
  }

  /* ---------- Плавное появление блоков ---------- */
  if (!reduced && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('fx');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    // Заголовки делим на слова: каждое выезжает снизу из-под маски
    document.querySelectorAll('.h-display').forEach((h) => {
      h.setAttribute('aria-label', h.textContent.trim());
      h.innerHTML = h.textContent.trim().split(/\s+/)
        .map((w, i) => `<span class="w" aria-hidden="true"><span style="--wi:${i}">${w}</span></span>`).join(' ');
      h.classList.add('by-words');
    });
    const groups = ['.section .eyebrow', '.h-display', '.world', '.steps li', '.stats > div', '.split__img',
      '.checks li', '.delivery__card', '.pay', '.faq', '.contacts__list li', '.how__lead'];
    groups.forEach((sel) => document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.setProperty('--i', i % 6);
      io.observe(el);
    }));
  }

  /* ---------- Товар летит в корзину ---------- */
  // Слушаем на фазе перехвата, пока app.js не перерисовал карточку
  document.addEventListener('click', (e) => {
    const btn = e.target.closest?.('[data-add], [data-add-opt]');
    if (!btn) return;
    const src = btn.closest('.card')?.querySelector('.card__img img') || btn.closest('.pm')?.querySelector('.pm__img');
    const mobile = document.getElementById('mobileCart');
    const target = mobile && !mobile.hidden && mobile.offsetParent ? mobile : document.getElementById('cartOpen');
    if (!src || !target) return;
    const from = src.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const size = Math.min(from.width, from.height, 140);
    const x0 = from.left + from.width / 2 - size / 2;
    const y0 = from.top + from.height / 2 - size / 2;
    const dx = to.left + to.width / 2 - size / 2 - x0;
    const dy = to.top + to.height / 2 - size / 2 - y0;
    const ghost = src.cloneNode();
    ghost.removeAttribute('loading');
    ghost.className = 'fly-to-cart';
    ghost.style.cssText = `left:${x0}px;top:${y0}px;width:${size}px;height:${size}px;`;
    document.body.append(ghost);
    const finish = () => {
      ghost.remove();
      for (let i = 0; i < 3; i++) spawnNut(to.left + to.width / 2, to.top + to.height / 2, true);
    };
    if (reduced || !ghost.animate) return finish();
    ghost.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 140}px) scale(.55) rotate(180deg)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.12) rotate(360deg)`, opacity: 0.6 },
    ], { duration: 750, easing: 'cubic-bezier(.4, 0, .2, 1)' }).onfinish = finish;
  }, true);

  if (reduced) return; // остальные эффекты — только движение, без них сайт работает так же

  /* ---------- Магнитные кнопки и объёмные карточки ---------- */
  if (hasMouse) {
    /* «Магнитные» кнопки */
    const magnets = '.btn--accent, .btn--line, .btn--dark, .cart-btn, .header__tg';
    document.addEventListener('pointermove', (e) => {
      const el = e.target.closest?.(magnets);
      document.querySelectorAll('.is-magnet').forEach((m) => {
        if (m !== el) { m.classList.remove('is-magnet'); m.style.translate = ''; }
      });
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.classList.add('is-magnet');
      el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.22}px ${(e.clientY - r.top - r.height / 2) * 0.35}px`;
    }, { passive: true });

    /* Объёмные карточки с бликом */
    const grid = document.getElementById('products');
    grid?.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 10}deg) translateY(-6px)`;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
    });
    grid?.addEventListener('pointerout', (e) => {
      const card = e.target.closest('.card');
      if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
    });
  }

  /* ---------- Падающие звёзды на тёмных блоках ---------- */
  document.querySelectorAll('.hero, .section--space').forEach((sky) => {
    const shoot = () => {
      if (!document.hidden && sky.getBoundingClientRect().bottom > 0 && sky.getBoundingClientRect().top < innerHeight) {
        const star = document.createElement('span');
        star.className = 'shooting-star';
        star.style.left = `${rand(10, 90)}%`;
        star.style.top = `${rand(0, 45)}%`;
        sky.append(star);
        star.addEventListener('animationend', () => star.remove());
      }
      setTimeout(shoot, rand(2200, 5200));
    };
    setTimeout(shoot, rand(800, 2500));
  });

  /* ---------- Счётчики в блоке с цифрами ---------- */
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const counters = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      counters.unobserve(entry.target);
      const el = entry.target;
      const text = el.textContent;
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / 1400);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = text.replace(/\d+(?:[  ]\d{3})*/g, (m) => fmt(Math.round(Number(m.replace(/\D/g, '')) * eased)));
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = text;
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.stats b').forEach((b) => counters.observe(b));

  /* ---------- Клик по планете: раскручивается и выпускает фонтан орехов ---------- */
  document.querySelectorAll('.planet').forEach((planet) => {
    planet.addEventListener('click', () => {
      const live = planets.find((p) => p.span === planet);
      if (live) live.boost = 14; // раскручиваем нарисованную планету, дальше она плавно тормозит
      planet.classList.remove('is-spinning');
      void planet.offsetWidth; // перезапуск анимации
      planet.classList.add('is-spinning');
      const r = planet.getBoundingClientRect();
      for (let i = 0; i < 7; i++) spawnNut(r.left + r.width / 2, r.top + r.height / 2, true);
    });
  });

  /* ---------- Дождь из орехов при первом визите ---------- */
  let greeted = false;
  try { greeted = sessionStorage.getItem('cosmo-greeted') === '1'; sessionStorage.setItem('cosmo-greeted', '1'); } catch {}
  if (!greeted) {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => spawnNut(rand(40, innerWidth - 40), rand(-60, -20), false), 700 + i * rand(60, 110));
    }
  }

  /* ---------- Свечение «туманности» за мышкой на первом экране ---------- */
  if (hero && hasMouse) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--gx', `${e.clientX - r.left}px`);
      hero.style.setProperty('--gy', `${e.clientY - r.top}px`);
      hero.classList.add('is-glow');
    });
    hero.addEventListener('pointerleave', () => hero.classList.remove('is-glow'));
  }

  /* ---------- Большое слово в подвале загорается под курсором ---------- */
  const footWord = document.querySelector('.footer__word');
  if (footWord && hasMouse) {
    footWord.addEventListener('pointermove', (e) => {
      const r = footWord.getBoundingClientRect();
      footWord.style.setProperty('--fx', `${e.clientX - r.left}px`);
      footWord.style.setProperty('--fy', `${e.clientY - r.top}px`);
      footWord.classList.add('is-lit');
    });
    footWord.addEventListener('pointerleave', () => footWord.classList.remove('is-lit'));
  }

  /* ---------- Параллакс фотографий и полоска прогресса прокрутки ---------- */
  const parallax = [...document.querySelectorAll('.split__img, .world img')];
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    parallax.forEach((img) => {
      const r = img.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const center = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // от -1 до 1
      img.style.translate = `0 ${center * -24}px`;
    });
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Волна от клика по кнопкам ---------- */
  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest?.('.btn'); // у кнопки корзины бейдж выступает за край — без волны
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const wave = document.createElement('span');
    wave.className = 'ripple';
    const size = Math.max(r.width, r.height) * 2;
    wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px;`;
    btn.append(wave);
    wave.addEventListener('animationend', () => wave.remove());
  }, { passive: true });

  /* ---------- Бегущая строка ускоряется при прокрутке ---------- */
  const track = document.querySelector('.ticker__track');
  const tickerAnim = track?.getAnimations?.()[0];
  if (tickerAnim) {
    let lastY = scrollY, rate = 1, raf = 0;
    const settle = () => {
      rate += (1 - rate) * 0.06;
      tickerAnim.playbackRate = rate;
      raf = Math.abs(rate - 1) > 0.02 ? requestAnimationFrame(settle) : 0;
    };
    addEventListener('scroll', () => {
      const dy = scrollY - lastY;
      lastY = scrollY;
      rate = Math.max(-5, Math.min(6, 1 + dy * 0.25));
      tickerAnim.playbackRate = rate;
      if (!raf) raf = requestAnimationFrame(settle);
    }, { passive: true });
  }
})();
