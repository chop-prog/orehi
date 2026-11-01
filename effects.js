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
        vx: burst ? rand(-3, 3) : rand(-0.6, 0.6),
        vy: burst ? rand(-4.5, -2) : rand(-1, -0.2),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.06, 0.06),
        size: burst ? rand(32, 44) : rand(28, 36),
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
        // Падают медленно, как в невесомости: слабое притяжение и предел скорости
        n.vy = Math.min(n.vy + 0.06, 2.2);
        n.vx *= 0.985;
        n.x += n.vx;
        n.y += n.vy;
        n.rot += n.vr;
        // Орех живёт около полутора секунд, потом тает
        if (++n.age > 80 || n.y > innerHeight - 40) n.life -= 0.03;
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

  const CRATERS = Array.from({ length: 16 }, () => ({ lon: rand(0, Math.PI * 2), lat: rand(-1.1, 1.1), r: rand(0.06, 0.17) }));

  // Контур миндалины: острый кончик сверху, округлое донце снизу
  function almondPath(ctx, w, h) {
    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.bezierCurveTo(w * 0.62, -h * 0.72, w * 1.06, -h * 0.1, w * 0.9, h * 0.42);
    ctx.bezierCurveTo(w * 0.74, h * 0.94, -w * 0.74, h * 0.94, -w * 0.9, h * 0.42);
    ctx.bezierCurveTo(-w * 1.06, -h * 0.1, -w * 0.62, -h * 0.72, 0, -h);
    ctx.closePath();
  }
  // Миндалина в центре координат: w, h — полуширина и полувысота, spin — поворот вокруг своей оси
  function drawAlmond(ctx, w0, h, spin) {
    const w = w0 * (0.86 + 0.14 * Math.cos(spin));
    // Кожица — один плавный градиент от блика к тени
    const surf = ctx.createRadialGradient(-w * 0.35, -h * 0.3, 0, -w * 0.35, -h * 0.3, h * 1.75);
    [[0, '#f0bb82'], [0.14, '#e2a066'], [0.3, '#cf8a4d'], [0.46, '#bb763c'], [0.6, '#a6642f'],
      [0.74, '#8f5326'], [0.87, '#78441e'], [1, '#5f3517']]
      .forEach(([o, c]) => surf.addColorStop(o, c));
    almondPath(ctx, w, h);
    ctx.fillStyle = surf;
    ctx.fill();
    ctx.save();
    almondPath(ctx, w, h);
    ctx.clip();
    // Продольные бороздки сдвигаются при повороте и бледнеют у края
    ctx.lineCap = 'round';
    for (let k = 0; k < 9; k++) {
      const lon = spin + (k / 9) * Math.PI * 2;
      const depth = Math.cos(lon);
      if (depth <= 0.05) continue;
      const x = Math.sin(lon) * w * 0.82;
      ctx.strokeStyle = `rgba(80, 38, 12, ${0.32 * Math.min(1, depth * 2.5)})`;
      ctx.lineWidth = Math.max(1, h * 0.035);
      ctx.beginPath();
      ctx.moveTo(x * 0.15, -h * 0.9);
      ctx.quadraticCurveTo(x * 1.12, -h * 0.05, x * 0.72, h * 0.78);
      ctx.stroke();
    }
    // Блик
    const gl = ctx.createRadialGradient(-w * 0.38, -h * 0.4, 0, -w * 0.38, -h * 0.4, w * 0.75);
    gl.addColorStop(0, 'rgba(255, 236, 205, .5)');
    gl.addColorStop(1, 'rgba(255, 236, 205, 0)');
    ctx.fillStyle = gl;
    ctx.fillRect(-w, -h, w * 2, h * 2);
    ctx.restore();
  }

  function drawApricotPlanet(p) {
    const { ctx, R } = p;
    const rot = p.rot;
    // Миндалина-спутник на наклонной орбите: за планетой меньше и бледнее, перед ней — крупнее
    const ma = rot * 1.4;
    const ORB = { rx: R * 1.62, ry: R * 0.44, tilt: 0.28 };
    const moonFront = Math.sin(ma) > 0;
    const drawMoon = () => {
      const depth = 0.75 + 0.25 * Math.sin(ma);
      const x = Math.cos(ma) * ORB.rx, y = Math.sin(ma) * ORB.ry;
      ctx.save();
      ctx.rotate(ORB.tilt);
      ctx.translate(x, y);
      // Носиком вперёд по ходу движения
      ctx.rotate(Math.atan2(Math.cos(ma) * ORB.ry, -Math.sin(ma) * ORB.rx) + Math.PI / 2);
      ctx.globalAlpha = moonFront ? 1 : 0.75;
      ctx.shadowColor = 'rgba(0, 0, 0, .35)';
      ctx.shadowBlur = R * 0.12;
      ctx.shadowOffsetY = R * 0.04;
      drawAlmond(ctx, R * 0.2 * depth, R * 0.32 * depth, rot * 2);
      ctx.restore();
    };
    ctx.save();
    ctx.rotate(ORB.tilt);
    ctx.strokeStyle = 'rgba(244, 239, 230, .16)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(0, 0, ORB.rx, ORB.ry, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    if (!moonFront) drawMoon();
    // Атмосфера
    const atm = ctx.createRadialGradient(0, 0, R * 0.9, 0, 0, R * 1.35);
    atm.addColorStop(0, 'rgba(255, 150, 50, .45)');
    atm.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = atm;
    ctx.beginPath(); ctx.arc(0, 0, R * 1.35, 0, Math.PI * 2); ctx.fill();
    // Поверхность — один градиент от точки света до теневого края: цвет меняется плавно
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
    if (moonFront) drawMoon();
  }

  // Мультяшная ракета: белый корпус, красные нос и стабилизаторы, синий иллюминатор, пламя из сопла.
  // Нарисована носом вправо; L — длина, flick — фаза мерцания пламени
  function drawCartoonRocket(c, L, flick) {
    // Пламя
    const fl = 0.42 + 0.08 * Math.sin(flick * 9) + 0.04 * Math.sin(flick * 23);
    const fire = c.createLinearGradient(-0.42 * L, 0, -(0.42 + fl) * L, 0);
    fire.addColorStop(0, '#fff3b0');
    fire.addColorStop(0.35, '#ffb52e');
    fire.addColorStop(0.75, '#ff6a1a');
    fire.addColorStop(1, 'rgba(255, 80, 20, 0)');
    c.fillStyle = fire;
    c.beginPath();
    c.moveTo(-0.4 * L, -0.11 * L);
    c.quadraticCurveTo(-(0.45 + fl * 0.6) * L, -0.1 * L, -(0.42 + fl) * L, 0);
    c.quadraticCurveTo(-(0.45 + fl * 0.6) * L, 0.1 * L, -0.4 * L, 0.11 * L);
    c.closePath();
    c.fill();
    // Стабилизаторы
    c.fillStyle = '#e8473c';
    [-1, 1].forEach((s) => {
      c.beginPath();
      c.moveTo(-0.08 * L, 0.16 * L * s);
      c.quadraticCurveTo(-0.3 * L, 0.24 * L * s, -0.44 * L, 0.36 * L * s);
      c.lineTo(-0.38 * L, 0.12 * L * s);
      c.closePath();
      c.fill();
    });
    // Корпус
    const body = c.createLinearGradient(0, -0.2 * L, 0, 0.2 * L);
    body.addColorStop(0, '#ffffff');
    body.addColorStop(0.55, '#e9ecf2');
    body.addColorStop(1, '#b9c0cc');
    c.fillStyle = body;
    c.beginPath();
    c.moveTo(0.56 * L, 0);
    c.bezierCurveTo(0.4 * L, -0.24 * L, 0 * L, -0.22 * L, -0.4 * L, -0.15 * L);
    c.quadraticCurveTo(-0.45 * L, 0, -0.4 * L, 0.15 * L);
    c.bezierCurveTo(0 * L, 0.22 * L, 0.4 * L, 0.24 * L, 0.56 * L, 0);
    c.fill();
    // Красный нос
    c.save();
    c.clip();
    c.fillStyle = '#e8473c';
    c.fillRect(0.3 * L, -0.3 * L, 0.3 * L, 0.6 * L);
    c.fillStyle = 'rgba(255, 255, 255, .35)';
    c.fillRect(0.3 * L, -0.3 * L, 0.3 * L, 0.12 * L);
    c.restore();
    // Сопло
    c.fillStyle = '#8a92a3';
    c.fillRect(-0.47 * L, -0.08 * L, 0.08 * L, 0.16 * L);
    // Иллюминатор
    c.beginPath();
    c.arc(0.1 * L, 0, 0.085 * L, 0, Math.PI * 2);
    c.fillStyle = '#dfe5ee';
    c.fill();
    c.beginPath();
    c.arc(0.1 * L, 0, 0.062 * L, 0, Math.PI * 2);
    const glass = c.createRadialGradient(0.08 * L, -0.02 * L, 0, 0.1 * L, 0, 0.062 * L);
    glass.addColorStop(0, '#9fd2ff');
    glass.addColorStop(1, '#1f5fd1');
    c.fillStyle = glass;
    c.fill();
    c.beginPath();
    c.arc(0.085 * L, -0.02 * L, 0.018 * L, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255, 255, 255, .85)';
    c.fill();
  }

  const ORBIT2 = { tilt: 0.3, rx: 1.6, ry: 0.48 };

  // Первая «О» — круглый орех макадамия, вокруг него летает мультяшная ракета
  function drawMacadamiaPlanet(p) {
    const { ctx, R } = p;
    const rot = p.rot;
    const a = rot * 1.4 + Math.PI;
    const pos = { x: Math.cos(a) * R * ORBIT2.rx, y: Math.sin(a) * R * ORBIT2.ry };
    const dx = -Math.sin(a) * ORBIT2.rx, dy = Math.cos(a) * ORBIT2.ry;
    const front = Math.sin(a) > 0;
    const depth = 0.78 + 0.22 * Math.sin(a);
    const drawShip = () => {
      ctx.save();
      ctx.rotate(ORBIT2.tilt);
      ctx.translate(pos.x, pos.y);
      ctx.rotate(Math.atan2(dy, dx));
      ctx.globalAlpha = front ? 1 : 0.8;
      ctx.shadowColor = 'rgba(255, 140, 40, .45)';
      ctx.shadowBlur = R * 0.15;
      drawCartoonRocket(ctx, R * 0.95 * depth, rot * 12);
      ctx.restore();
    };
    if (!front) drawShip();

    // Гладкая блестящая скорлупа макадамии: плавный градиент от блика к тени
    const shell = ctx.createRadialGradient(-R * 0.38, -R * 0.4, 0, -R * 0.38, -R * 0.4, R * 1.8);
    [[0, '#cf9258'], [0.16, '#b97a42'], [0.34, '#9e6131'], [0.52, '#844e25'], [0.7, '#6b3d1d'],
      [0.86, '#552f16'], [1, '#432411']]
      .forEach(([o, c]) => shell.addColorStop(o, c));
    ctx.fillStyle = shell;
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.clip();
    // Точка на сфере по долготе и широте; d > 0 — на видимой стороне
    const onSphere = (lon, lat) => ({ x: Math.sin(lon) * Math.cos(lat) * R, y: Math.sin(lat) * R, d: Math.cos(lon) * Math.cos(lat) });
    // Шов скорлупы — меридиан, который поворачивается вместе с орехом
    const seam = rot;
    if (Math.cos(seam) > 0) {
      ctx.lineCap = 'round';
      [['rgba(50, 25, 8, .45)', 0], ['rgba(255, 220, 170, .18)', R * 0.025]].forEach(([color, shift]) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = R * 0.03;
        ctx.beginPath();
        for (let t = -1.45; t <= 1.45; t += 0.05) {
          const pt = onSphere(seam, t);
          if (t === -1.45) ctx.moveTo(pt.x + shift, pt.y); else ctx.lineTo(pt.x + shift, pt.y);
        }
        ctx.stroke();
      });
    }
    // Светлый «глазок» у основания ореха
    const eye = onSphere(rot + 1.3, -0.62);
    if (eye.d > 0.05) {
      const k = Math.min(1, eye.d * 2);
      ctx.fillStyle = `rgba(232, 200, 150, ${0.85 * k})`;
      ctx.beginPath(); ctx.ellipse(eye.x, eye.y, R * 0.13 * Math.cos(rot + 1.3), R * 0.09, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(120, 70, 30, ${0.6 * k})`;
      ctx.beginPath(); ctx.ellipse(eye.x, eye.y, R * 0.05 * Math.cos(rot + 1.3), R * 0.035, 0, 0, Math.PI * 2); ctx.fill();
    }
    // Глянцевый блик — скорлупа макадамии гладкая и блестит
    const gl = ctx.createRadialGradient(-R * 0.42, -R * 0.45, 0, -R * 0.42, -R * 0.45, R * 0.55);
    gl.addColorStop(0, 'rgba(255, 240, 215, .55)');
    gl.addColorStop(1, 'rgba(255, 240, 215, 0)');
    ctx.fillStyle = gl;
    ctx.fillRect(-R, -R, R * 2, R * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, .55)';
    ctx.beginPath(); ctx.ellipse(-R * 0.45, -R * 0.5, R * 0.13, R * 0.07, -0.6, 0, Math.PI * 2); ctx.fill();
    // Расколотая скорлупа: в большом сколе всегда видно кремовое ядро — так сразу понятно, что это орех
    const cx = R * 0.3, cy = -R * 0.2;
    const hole = [[-0.42, 0.02], [-0.34, -0.2], [-0.22, -0.16], [-0.12, -0.36], [0.04, -0.3], [0.16, -0.46],
      [0.3, -0.3], [0.44, -0.2], [0.4, 0], [0.48, 0.14], [0.32, 0.26], [0.16, 0.22], [0.02, 0.4],
      [-0.12, 0.26], [-0.28, 0.32], [-0.36, 0.16]];
    const holePath = (scale) => {
      ctx.beginPath();
      hole.forEach(([px, py], i) => {
        const x = cx + px * R * scale, y = cy + py * R * scale;
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      });
      ctx.closePath();
    };
    // Толщина скорлупы по краю скола — светлая полоска
    ctx.fillStyle = '#d8b07c';
    holePath(1.1); ctx.fill();
    ctx.fillStyle = '#3b200d';
    holePath(1.0); ctx.fill();
    // Ядро: кремовый шарик с тенью от скорлупы
    ctx.save();
    holePath(0.94); ctx.clip();
    const kern = ctx.createRadialGradient(cx + R * 0.1, cy - R * 0.12, 0, cx, cy, R * 0.62);
    kern.addColorStop(0, '#fffdf6');
    kern.addColorStop(0.45, '#f6ead0');
    kern.addColorStop(0.8, '#e2cb9c');
    kern.addColorStop(1, '#bfa06c');
    ctx.fillStyle = kern;
    ctx.beginPath(); ctx.arc(cx + R * 0.04, cy + R * 0.02, R * 0.56, 0, Math.PI * 2); ctx.fill();
    // Тень от края скорлупы на ядре
    const rim = ctx.createRadialGradient(cx, cy, R * 0.28, cx, cy, R * 0.6);
    rim.addColorStop(0, 'rgba(90, 55, 20, 0)');
    rim.addColorStop(1, 'rgba(90, 55, 20, .45)');
    ctx.fillStyle = rim;
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, .7)';
    ctx.beginPath(); ctx.ellipse(cx + R * 0.12, cy - R * 0.14, R * 0.09, R * 0.05, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Трещинки, расходящиеся от скола
    ctx.strokeStyle = 'rgba(40, 20, 6, .55)';
    ctx.lineWidth = R * 0.022;
    ctx.lineCap = 'round';
    [[[-0.46, 0.06], [-0.6, 0.12], [-0.72, 0.05]], [[0.02, 0.44], [0.0, 0.58], [0.08, 0.7]], [[0.5, 0.16], [0.62, 0.3]]]
      .forEach((line) => {
        ctx.beginPath();
        line.forEach(([px, py], i) => { const x = cx + px * R, y = cy + py * R; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
        ctx.stroke();
      });
    ctx.restore();

    if (front) drawShip();
  }

  function initPlanets() {
    document.querySelectorAll('.planet').forEach((span, i) => {
      const canvas = document.createElement('canvas');
      canvas.className = 'planet__canvas';
      canvas.setAttribute('aria-hidden', 'true');
      span.append(canvas);
      const p = { span, canvas, ctx: canvas.getContext('2d'), kind: i === 0 ? 'macadamia' : 'apricot', rot: rand(0, 6), boost: 0, boostRate: 1 };
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
      if (p.kind === 'macadamia') drawMacadamiaPlanet(p);
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

  /* ---------- Ракета пролетает по тёмным блокам, из сопла сыплются орешки ---------- */
  if (!reduced) {
    document.querySelectorAll('.hero, .cosmos-zone, .stats-band, #contacts').forEach((zone) => {
      const canvas = document.createElement('canvas');
      canvas.className = 'flyby';
      canvas.setAttribute('aria-hidden', 'true');
      zone.prepend(canvas);
      const ctx = canvas.getContext('2d');
      let w = 0, h = 0, visible = false, rocket = null, trail = [], frame = 0;
      let next = performance.now() + rand(1000, 3000);
      const size = () => {
        w = zone.offsetWidth; h = zone.offsetHeight;
        canvas.width = w; canvas.height = h; // без dpr: блоки каталога высокие, холст и так большой
      };
      size();
      addEventListener('resize', size);
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(zone);

      const launch = () => {
        size(); // высота блока могла измениться после загрузки шрифтов
        const dir = Math.random() < 0.5 ? 1 : -1;
        const vx = dir * rand(2.2, 3.2);
        const y0 = rand(0.15, 0.85) * h, y1 = rand(0.15, 0.85) * h;
        rocket = { x: dir > 0 ? -80 : w + 80, y: y0, vx, vy: (y1 - y0) / ((w + 160) / Math.abs(vx)), L: rand(36, 50) };
      };

      const loop = (now) => {
        requestAnimationFrame(loop);
        if (!visible || document.hidden) return;
        if (!rocket && !trail.length && now > next) launch();
        ctx.clearRect(0, 0, w, h);
        if (rocket) {
          rocket.x += rocket.vx; rocket.y += rocket.vy;
          const a = Math.atan2(rocket.vy, rocket.vx);
          if (++frame % 8 === 0) {
            trail.push({
              x: rocket.x - Math.cos(a) * rocket.L * 0.55, y: rocket.y - Math.sin(a) * rocket.L * 0.55,
              vx: -Math.cos(a) * 0.6 + rand(-0.3, 0.3), vy: -Math.sin(a) * 0.6 + rand(-0.3, 0.3),
              rot: rand(0, 6), vr: rand(-0.04, 0.04), size: rocket.L * rand(0.55, 0.7), life: 1, kind: pick(KINDS),
            });
          }
          if (rocket.x < -100 || rocket.x > w + 100) { rocket = null; next = now + rand(6000, 12000); }
        }
        trail.forEach((t) => { t.x += t.vx; t.y += t.vy; t.rot += t.vr; t.life -= 0.012; });
        trail = trail.filter((t) => t.life > 0);
        trail.forEach((t) => {
          ctx.save();
          ctx.globalAlpha = t.life;
          ctx.translate(t.x, t.y);
          ctx.rotate(t.rot);
          ctx.drawImage(sprites[t.kind], -t.size / 2, -t.size / 2, t.size, t.size);
          ctx.restore();
        });
        if (rocket) {
          ctx.save();
          ctx.translate(rocket.x, rocket.y);
          ctx.rotate(Math.atan2(rocket.vy, rocket.vx));
          ctx.shadowColor = 'rgba(80, 160, 255, .6)';
          ctx.shadowBlur = 14;
          drawRocket(ctx, rocket.L);
          ctx.restore();
        }
      };
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
