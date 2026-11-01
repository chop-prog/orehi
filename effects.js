// Декоративные эффекты Cosmo: орехи падают из курсора, парят на первом экране, блоки плавно появляются.
// Орехи рисуются кодом на canvas — без картинок.
// При prefers-reduced-motion (в Windows — выключенные «Эффекты анимации») орехи из курсора остаются,
// но их меньше; покачивание, параллакс и анимации при прокрутке выключаются.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // any-pointer: на ноутбуке с сенсорным экраном основным считается касание, но мышь тоже есть
  const hasMouse = matchMedia('(any-pointer: fine)').matches;
  const SPRITE = 128; // размер спрайта в CSS-пикселях
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- Рисуем орехи ---------- */
  // Каждый орех: форма → основной цвет с тенью → внутри формы текстура, блик и затенение по краю
  function sprite(draw) {
    const c = document.createElement('canvas');
    c.width = c.height = SPRITE * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.translate(SPRITE / 2, SPRITE / 2);
    ctx.scale(1.7, 1.7); // форма нарисована в координатах ±32, спрайт заполняется почти целиком
    draw(ctx);
    return c;
  }
  const radial = (ctx, x, y, r, stops) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    return g;
  };
  function body(ctx, path, fill, details) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, .35)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    path(ctx);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
    ctx.save();
    path(ctx);
    ctx.clip();
    details(ctx);
    ctx.restore();
    // Тёмный контур: даже маленький орех читается силуэтом
    path(ctx);
    ctx.strokeStyle = 'rgba(45, 22, 6, .55)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
  }
  // Мелкие пятнышки/поры: n штук в прямоугольнике, цвет и размер случайные в заданных пределах
  function speckle(ctx, n, w, h, color, rx, ry, angle = 0) {
    ctx.fillStyle = color;
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.ellipse(rand(-w, w), rand(-h, h), rand(...rx), rand(...ry), angle + rand(-0.3, 0.3), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const gloss = (ctx, x, y, r, a) => {
    ctx.fillStyle = radial(ctx, x, y, r, [[0, `rgba(255, 244, 225, ${a})`], [1, 'rgba(255, 244, 225, 0)']]);
    ctx.fillRect(-40, -40, 80, 80);
  };
  const rim = (ctx, x, y, r, a) => {
    ctx.fillStyle = radial(ctx, x, y, r, [[0.55, 'rgba(30, 12, 2, 0)'], [1, `rgba(30, 12, 2, ${a})`]]);
    ctx.fillRect(-40, -40, 80, 80);
  };

  const almondPath = (c) => { c.beginPath(); c.moveTo(0, -32); c.bezierCurveTo(21, -22, 22, 16, 0, 32); c.bezierCurveTo(-22, 16, -21, -22, 0, -32); };
  const cashewPath = (c) => {
    c.beginPath();
    c.moveTo(-20, -20);
    c.bezierCurveTo(-34, -4, -24, 26, 2, 28);
    c.bezierCurveTo(24, 29, 32, 10, 26, -4);
    c.bezierCurveTo(22, -14, 10, -12, 9, -2);
    c.bezierCurveTo(8, 8, 0, 10, -5, 5);
    c.bezierCurveTo(-11, -1, -6, -14, -9, -21);
    c.bezierCurveTo(-11, -27, -17, -25, -20, -20);
    c.closePath();
  };
  const apricotPath = (c) => {
    c.beginPath();
    c.moveTo(0, -24);
    c.bezierCurveTo(22, -26, 32, -6, 26, 10);
    c.bezierCurveTo(20, 26, -6, 30, -20, 18);
    c.bezierCurveTo(-32, 6, -26, -22, 0, -24);
    c.closePath();
  };

  const NUTS = {
    almond: (ctx) => body(ctx, almondPath,
      radial(ctx, -6, -10, 42, [[0, '#d0884a'], [0.5, '#a3602d'], [1, '#5d3014']]),
      (c) => {
        // Пористая кожица миндаля: вытянутые вдоль ореха ямки и светлые волокна
        speckle(c, 160, 20, 31, 'rgba(70, 30, 8, .32)', [0.5, 1.3], [1.4, 3.2], Math.PI / 2 * 0);
        speckle(c, 70, 20, 31, 'rgba(240, 186, 130, .2)', [0.4, 1], [1.5, 3]);
        c.strokeStyle = 'rgba(70, 32, 10, .22)';
        c.lineWidth = 0.8;
        for (let i = -3; i <= 3; i++) {
          c.beginPath(); c.moveTo(i * 4, -28); c.quadraticCurveTo(i * 7.5, 0, i * 4, 28); c.stroke();
        }
        gloss(c, -7, -12, 15, 0.4);
        rim(c, 0, 0, 30, 0.6);
      }),
    hazelnut: (ctx) => {
      body(ctx, (c) => { c.beginPath(); c.arc(0, 6, 26, 0, Math.PI * 2); },
        radial(ctx, -9, -2, 38, [[0, '#c7843f'], [0.55, '#8c4c1e'], [1, '#4a240a']]),
        (c) => {
          // Тонкие продольные полоски скорлупы и глянец
          c.lineWidth = 1;
          for (let i = 0; i < 26; i++) {
            const x = rand(-24, 24);
            c.strokeStyle = Math.random() < 0.6 ? 'rgba(60, 25, 5, .25)' : 'rgba(230, 170, 110, .18)';
            c.beginPath(); c.moveTo(x * 0.7, -12); c.quadraticCurveTo(x * 1.15, 10, x * 0.6, 32); c.stroke();
          }
          gloss(c, -10, -2, 16, 0.5);
          rim(c, 0, 6, 27, 0.65);
        });
      body(ctx, (c) => { c.beginPath(); c.ellipse(0, -14, 21, 11, 0, 0, Math.PI * 2); },
        radial(ctx, -5, -18, 24, [[0, '#ead1a8'], [0.7, '#c49a64'], [1, '#97703f']]),
        (c) => {
          speckle(c, 110, 21, 11, 'rgba(110, 70, 30, .35)', [0.3, 0.9], [0.3, 0.9]);
          speckle(c, 50, 21, 11, 'rgba(255, 240, 210, .3)', [0.3, 0.8], [0.3, 0.8]);
        });
      ctx.fillStyle = '#6e4220';
      ctx.beginPath(); ctx.arc(0, -24, 2.4, 0, Math.PI * 2); ctx.fill();
    },
    pistachio: (ctx) => {
      // Приоткрытая скорлупка: две створки сходятся внизу и расходятся вверху, в щели — зелёное ядро
      body(ctx, (c) => { c.beginPath(); c.ellipse(0, -6, 9, 21, 0, 0, Math.PI * 2); },
        radial(ctx, -2, -12, 22, [[0, '#d6ec86'], [0.6, '#93b53f'], [1, '#5b761d']]), (c) => {
          speckle(c, 7, 8, 18, 'rgba(130, 55, 90, .45)', [1.5, 3.5], [2, 5]);
          gloss(c, -3, -14, 8, 0.55);
        });
      const half = (side) => (c) => {
        c.beginPath();
        c.ellipse(0, 2, 20, 28, 0, side < 0 ? Math.PI / 2 : -Math.PI / 2, side < 0 ? Math.PI * 1.5 : Math.PI / 2);
        c.lineTo(side * 1.5, 30);
        c.closePath();
      };
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(0, 30);
        ctx.rotate(side * 0.14); // створка отогнута наружу вокруг нижней точки
        ctx.translate(side * 1.5, -30);
        body(ctx, half(side), radial(ctx, side * 8 - 4, -8, 34, [[0, '#f5e8cb'], [0.6, '#d8be8b'], [1, '#9a7b4b']]), (c) => {
          speckle(c, 70, 20, 28, 'rgba(120, 85, 40, .22)', [0.3, 0.9], [0.3, 1.2]);
          c.strokeStyle = 'rgba(110, 75, 35, .22)';
          c.lineWidth = 0.7;
          for (let i = 1; i <= 3; i++) { c.beginPath(); c.moveTo(side * i * 4.5, -24); c.quadraticCurveTo(side * i * 7, 2, side * i * 4.5, 27); c.stroke(); }
          gloss(c, side * 9 - 3, -10, 10, 0.4);
          rim(c, 0, 2, 28, 0.45);
        });
        ctx.restore();
      });
    },
    walnut: (ctx) => body(ctx,
      (c) => {
        // Половинка ядра грецкого ореха: две доли с бороздкой посередине
        c.beginPath();
        c.moveTo(0, -24);
        c.bezierCurveTo(13, -34, 31, -20, 27, -3);
        c.bezierCurveTo(31, 11, 22, 29, 6, 28);
        c.bezierCurveTo(3, 30, -3, 30, -6, 28);
        c.bezierCurveTo(-22, 29, -31, 11, -27, -3);
        c.bezierCurveTo(-31, -20, -13, -34, 0, -24);
        c.closePath();
      },
      radial(ctx, -6, -8, 40, [[0, '#e8bf7f'], [0.55, '#b98245'], [1, '#6e4219']]),
      (c) => {
        // Бугорки долей
        [[-13, -13], [13, -13], [-14, 9], [14, 9], [-6, 20], [6, 20]].forEach(([x, y]) => gloss(c, x, y, 10, 0.28));
        // Извилины
        c.lineCap = 'round';
        for (let i = 0; i < 26; i++) {
          const x = rand(-24, 24), y = rand(-24, 24), len = rand(6, 13), a = rand(0, Math.PI * 2);
          c.strokeStyle = `rgba(90, 50, 15, ${rand(0.3, 0.5)})`;
          c.lineWidth = rand(1, 1.8);
          c.beginPath();
          c.moveTo(x, y);
          c.bezierCurveTo(x + Math.cos(a + 1) * len * 0.5, y + Math.sin(a + 1) * len * 0.5,
            x + Math.cos(a - 1) * len * 0.7, y + Math.sin(a - 1) * len * 0.7, x + Math.cos(a) * len, y + Math.sin(a) * len);
          c.stroke();
        }
        // Центральная бороздка
        c.strokeStyle = 'rgba(70, 35, 8, .65)';
        c.lineWidth = 3;
        c.filter = 'blur(0.8px)';
        c.beginPath(); c.moveTo(0, -24); c.bezierCurveTo(-3, -6, 3, 10, 0, 29); c.stroke();
        c.filter = 'none';
        rim(c, 0, 2, 32, 0.5);
      }),
    cashew: (ctx) => body(ctx, cashewPath,
      radial(ctx, -10, 6, 40, [[0, '#fbf0d8'], [0.55, '#e6cb95'], [1, '#b08a50']]),
      (c) => {
        speckle(c, 90, 30, 30, 'rgba(170, 125, 70, .16)', [0.3, 1], [0.3, 1]);
        // Тень во внутреннем изгибе и светлая спинка
        c.strokeStyle = 'rgba(120, 80, 35, .35)';
        c.lineWidth = 5;
        c.filter = 'blur(2px)';
        c.beginPath(); c.moveTo(9, -4); c.bezierCurveTo(8, 8, 0, 11, -6, 5); c.stroke();
        c.filter = 'none';
        c.strokeStyle = 'rgba(255, 248, 230, .55)';
        c.lineWidth = 3;
        c.beginPath(); c.moveTo(-17, -14); c.bezierCurveTo(-26, 2, -16, 20, 3, 22); c.stroke();
        rim(c, 2, 4, 32, 0.4);
      }),
    apricot: (ctx) => body(ctx, apricotPath,
      radial(ctx, -8, -8, 40, [[0, '#ffc066'], [0.5, '#ee8a2c'], [1, '#a9480a']]),
      (c) => {
        // Морщинистая поверхность сушёного абрикоса
        c.filter = 'blur(0.6px)';
        for (let i = 0; i < 60; i++) {
          const x = rand(-24, 24), y = rand(-22, 24), len = rand(5, 12), a = rand(0, Math.PI);
          c.strokeStyle = Math.random() < 0.55 ? 'rgba(130, 45, 0, .16)' : 'rgba(255, 215, 150, .16)';
          c.lineWidth = rand(1, 2.2);
          c.beginPath();
          c.moveTo(x, y);
          c.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + rand(-3, 3), y + Math.sin(a) * len * 0.5 + rand(-3, 3), x + Math.cos(a) * len, y + Math.sin(a) * len);
          c.stroke();
        }
        c.filter = 'blur(1.2px)';
        c.strokeStyle = 'rgba(120, 40, 0, .38)';
        c.lineWidth = 3;
        c.beginPath(); c.moveTo(-2, -22); c.bezierCurveTo(6, -8, -6, 8, 2, 24); c.stroke();
        c.filter = 'none';
        gloss(c, -9, -10, 13, 0.55);
        gloss(c, 10, 6, 6, 0.25);
        rim(c, 2, 2, 30, 0.55);
      }),
  };
  const KINDS = Object.keys(NUTS);
  // Для мелких орехов (падающих и из ракеты) — только те, что узнаются по силуэту; курага мелкой похожа на шарик
  const SMALL_KINDS = ['almond', 'hazelnut', 'cashew', 'pistachio', 'walnut'];
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
        kind: pick(SMALL_KINDS),
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

  function shadeSphere(ctx, R, glow) {
    // Объём: свет слева сверху, тень справа снизу, ободок атмосферы
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
    ctx.strokeStyle = glow;
    ctx.lineWidth = R * 0.04;
    ctx.beginPath(); ctx.arc(0, 0, R * 0.99, Math.PI * 0.75, Math.PI * 1.55); ctx.stroke();
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
        size: R * rand(0.46, 0.58) * depth, rot: rand(0, 6), vr: rand(-0.04, 0.04), life: 1, front, kind: pick(SMALL_KINDS),
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
    shadeSphere(ctx, R, 'rgba(255, 210, 150, .55)');
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
    // Поверхность
    const surf = ctx.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R);
    surf.addColorStop(0, '#ffc266');
    surf.addColorStop(0.45, '#f6992f');
    surf.addColorStop(0.75, '#e47e1c');
    surf.addColorStop(1, '#cf6a12');
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
    shadeSphere(ctx, R, 'rgba(255, 200, 120, .6)');
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

  /* ---------- Космос за разделами и каталогом ---------- */
  // Звёзды трёх слоёв глубины, туманности и далёкие планеты. Фон сдвигается только вместе с мышкой:
  // мышка стоит — стоит и космос. Холст без ретины (dpr 1): зона высокая, а звёздам чёткость не нужна.
  document.querySelectorAll('.cosmos-zone').forEach((zone) => {
    const cv = document.createElement('canvas');
    cv.className = 'cosmos-bg';
    cv.setAttribute('aria-hidden', 'true');
    zone.prepend(cv);
    const g = cv.getContext('2d');
    const LAYERS = [
      { density: 0.00011, speed: 0.12, size: [0.4, 0.9] },
      { density: 0.00005, speed: 0.3, size: [0.8, 1.5] },
      { density: 0.000015, speed: 0.6, size: [1.4, 2.2] },
    ];
    let W = 0, H = 0, stars = [], blobs = [], worlds = [], ox = 0, oy = 0, raf = 0, visible = false;

    const build = () => {
      W = zone.offsetWidth;
      H = zone.offsetHeight;
      if (!W || !H) return;
      cv.width = W; cv.height = H;
      cv.style.width = `${W}px`; cv.style.height = `${H}px`;
      stars = LAYERS.flatMap((l, li) => Array.from({ length: Math.round(W * H * l.density) }, () => ({
        x: rand(0, W), y: rand(0, H), r: rand(...l.size), li, a: rand(0.45, 1),
        c: pick(['255, 255, 255', '255, 231, 201', '207, 224, 255', '255, 244, 224']),
      })));
      blobs = [
        { x: 0.18, y: 0.12, r: 0.5, c: '240, 138, 36', a: 0.16 },
        { x: 0.85, y: 0.35, r: 0.55, c: '110, 90, 230', a: 0.18 },
        { x: 0.3, y: 0.62, r: 0.5, c: '50, 120, 255', a: 0.14 },
        { x: 0.75, y: 0.9, r: 0.45, c: '220, 80, 140', a: 0.12 },
      ];
      worlds = [
        { x: 0.92, y: 0.08, r: 26, c1: '#8fb8ff', c2: '#22356e', ring: true },
        { x: 0.06, y: 0.48, r: 14, c1: '#ffcf8a', c2: '#8a3d10' },
        { x: 0.88, y: 0.78, r: 18, c1: '#c9a6ff', c2: '#3a2470' },
      ];
      draw();
    };

    const wrap = (v, max) => ((v % max) + max) % max;
    function draw() {
      raf = 0;
      g.fillStyle = '#070915';
      g.fillRect(0, 0, W, H);
      blobs.forEach((b) => {
        const x = b.x * W + ox * 0.05, y = b.y * H + oy * 0.05, r = b.r * Math.max(W, 700);
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, `rgba(${b.c}, ${b.a})`);
        gr.addColorStop(1, `rgba(${b.c}, 0)`);
        g.fillStyle = gr;
        g.fillRect(x - r, y - r, r * 2, r * 2);
      });
      stars.forEach((s) => {
        const sp = LAYERS[s.li].speed;
        const x = wrap(s.x + ox * sp, W), y = wrap(s.y + oy * sp, H);
        g.fillStyle = `rgba(${s.c}, ${s.a})`;
        g.beginPath(); g.arc(x, y, s.r, 0, Math.PI * 2); g.fill();
        if (s.li === 2) { // яркие звёзды с лучиками
          g.strokeStyle = `rgba(${s.c}, ${s.a * 0.35})`;
          g.lineWidth = 0.6;
          g.beginPath(); g.moveTo(x - s.r * 3, y); g.lineTo(x + s.r * 3, y); g.moveTo(x, y - s.r * 3); g.lineTo(x, y + s.r * 3); g.stroke();
        }
      });
      worlds.forEach((p) => {
        const x = p.x * W + ox * 0.2, y = p.y * H + oy * 0.2;
        const gr = g.createRadialGradient(x - p.r * 0.4, y - p.r * 0.4, p.r * 0.1, x, y, p.r);
        gr.addColorStop(0, p.c1);
        gr.addColorStop(1, p.c2);
        g.fillStyle = gr;
        g.beginPath(); g.arc(x, y, p.r, 0, Math.PI * 2); g.fill();
        if (p.ring) {
          g.strokeStyle = 'rgba(200, 220, 255, .45)';
          g.lineWidth = 2;
          g.beginPath(); g.ellipse(x, y, p.r * 1.9, p.r * 0.5, -0.35, 0, Math.PI * 2); g.stroke();
        }
      });
    }

    build();
    new ResizeObserver(() => {
      if (zone.offsetWidth !== W || Math.abs(zone.offsetHeight - H) > 2) build();
    }).observe(zone);
    // Пока зона за экраном, сдвиг копится без перерисовки; при появлении рисуем актуальное положение
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(draw); }).observe(zone);
    if (!reduced && hasMouse) {
      addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        ox += e.movementX * 0.9;
        oy += e.movementY * 0.9;
        if (visible && !raf) raf = requestAnimationFrame(draw);
      }, { passive: true });
    }

    // Время от времени за карточками пролетает ракета из логотипа и сыплет орешками
    if (!reduced) {
      const next = () => setTimeout(fly, rand(6000, 12000));
      const fly = () => {
        if (!visible || document.hidden) return next();
        const zr = zone.getBoundingClientRect();
        const top = Math.max(0, -zr.top) + 80, bottom = Math.min(zr.height, innerHeight - zr.top) - 80;
        if (bottom <= top) return next();
        const dir = Math.random() < 0.5 ? 1 : -1;
        const x0 = dir > 0 ? -160 : W + 160, x1 = dir > 0 ? W + 160 : -160;
        const y0 = rand(top, bottom), y1 = y0 + rand(-180, 180);
        const ang = Math.atan2(y1 - y0, x1 - x0);
        const rocket = new Image();
        rocket.src = rocketURL();
        rocket.className = 'cosmos-rocket';
        rocket.alt = '';
        zone.insertBefore(rocket, cv.nextSibling);
        const duration = rand(5500, 8000), t0 = performance.now();
        rocket.animate([
          { transform: `translate(${x0}px, ${y0}px) rotate(${ang}rad)` },
          { transform: `translate(${x1}px, ${y1}px) rotate(${ang}rad)` },
        ], { duration, easing: 'linear' }).onfinish = () => { rocket.remove(); clearInterval(puff); next(); };
        // Выхлоп: орешки появляются у сопла, отстают от ракеты и тают
        const puff = setInterval(() => {
          const k = Math.min(1, (performance.now() - t0) / duration);
          const x = x0 + (x1 - x0) * k - Math.cos(ang) * 50, y = y0 + (y1 - y0) * k - Math.sin(ang) * 50;
          const nut = new Image();
          nut.src = spriteURL(pick(SMALL_KINDS));
          nut.className = 'cosmos-nut';
          nut.alt = '';
          zone.insertBefore(nut, rocket);
          const back = 70 + rand(0, 40), spin = rand(-180, 180);
          nut.animate([
            { transform: `translate(${x}px, ${y}px) rotate(0deg) scale(1)`, opacity: 1 },
            { transform: `translate(${x - Math.cos(ang) * back}px, ${y - Math.sin(ang) * back + rand(10, 40)}px) rotate(${spin}deg) scale(.7)`, opacity: 0 },
          ], { duration: 1600, easing: 'ease-out' }).onfinish = () => nut.remove();
        }, 170);
      };
      next();
    }
  });

  // Картинки для DOM-эффектов: ракета и орехи, нарисованные на canvas, кэшируются один раз
  let rocketCache;
  function rocketURL() {
    if (!rocketCache) {
      const L = 120, c = document.createElement('canvas');
      c.width = L * 1.15 * dpr; c.height = L * 0.85 * dpr;
      const x = c.getContext('2d');
      x.scale(dpr, dpr);
      x.translate(L * 0.58, L * 0.425);
      x.shadowColor = 'rgba(80, 160, 255, .7)';
      x.shadowBlur = 14;
      drawRocket(x, L);
      rocketCache = c.toDataURL();
    }
    return rocketCache;
  }
  const spriteCache = {};
  const spriteURL = (k) => (spriteCache[k] ||= sprites[k].toDataURL());

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
      { k: 'walnut', x: 30, y: 92, s: 78, d: 0.6, r: 20 },
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
    const btn = e.target.closest?.('[data-add]');
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

  /* ---------- Курсор-орбита ---------- */
  if (hasMouse) {
    // Точка стоит ровно на курсоре, кольцо догоняет её с лёгкой задержкой
    const ring = document.createElement('div');
    ring.className = 'cursor-orbit';
    ring.setAttribute('aria-hidden', 'true');
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    dot.setAttribute('aria-hidden', 'true');
    document.body.append(ring, dot);
    let mx = 0, my = 0, rx = 0, ry = 0, raf = 0;
    const hide = () => { ring.classList.remove('is-on', 'is-hot'); dot.classList.remove('is-on'); };
    const follow = () => {
      rx += (mx - rx) * 0.35;
      ry += (my - ry) * 0.35;
      // Свойство translate, а не transform: иначе увеличение над кнопками (scale) умножало бы и сдвиг
      ring.style.translate = `${rx}px ${ry}px`;
      raf = Math.abs(mx - rx) + Math.abs(my - ry) > 0.3 ? requestAnimationFrame(follow) : 0;
    };
    addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return hide();
      const off = document.body.style.overflow === 'hidden' || e.target.closest?.('input, textarea, select, .drawer, .modal');
      if (off) return hide();
      if (!ring.classList.contains('is-on')) { rx = e.clientX; ry = e.clientY; }
      mx = e.clientX; my = e.clientY;
      dot.style.translate = `${mx}px ${my}px`;
      ring.classList.add('is-on');
      dot.classList.add('is-on');
      ring.classList.toggle('is-hot', !!e.target.closest?.('a, button, .card__img, .world, summary, label'));
      if (!raf) raf = requestAnimationFrame(follow);
    }, { passive: true });
    // Мышь ушла за пределы окна или окно потеряло фокус — прячем, чтобы кольцо не застревало у края
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) hide(); });
    // Клик открыл корзину или окно — прячем сразу, не дожидаясь движения мыши
    document.addEventListener('click', () => setTimeout(() => {
      if (document.body.style.overflow === 'hidden') hide();
    }));
    addEventListener('blur', hide);

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
