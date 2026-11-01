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

  /* ---------- Рисуем орехи ---------- */
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
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- Падающие орехи ---------- */
  {
    const canvas = document.createElement('canvas');
    canvas.className = 'nut-rain';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');
    const nuts = [];
    const MAX = reduced ? 25 : 70;
    const TRAIL_GAP = reduced ? 140 : 55; // мс между орехами из курсора
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
        size: burst ? rand(40, 64) : rand(30, 46),
        kind: pick(KINDS),
        life: 1,
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
        if (n.y > innerHeight - 40) n.life -= 0.04;
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
      const count = reduced ? 4 : e.pointerType === 'touch' ? 7 : 10;
      for (let i = 0; i < count; i++) spawn(e.clientX, e.clientY, true);
    }, { passive: true });
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
    const groups = ['.section .eyebrow', '.h-display', '.world', '.steps li', '.stats > div', '.split__img',
      '.checks li', '.delivery__card', '.pay', '.faq', '.contacts__list li', '.how__lead'];
    groups.forEach((sel) => document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.setProperty('--i', i % 6);
      io.observe(el);
    }));
  }
})();
