// Загружает catalog.json и подставляет контакты магазина в элементы [data-shop] и [data-shop-href].
// Используется на всех страницах; app.js ждёт window.catalogReady.
window.catalogReady = fetch('catalog.json')
  .then((r) => {
    if (!r.ok) throw new Error('catalog.json: ' + r.status);
    return r.json();
  })
  .then((catalog) => {
    const shop = catalog.shop;
    document.querySelectorAll('[data-shop]').forEach((el) => {
      el.textContent = shop[el.dataset.shop] ?? '';
    });
    document.querySelectorAll('[data-shop-href]').forEach((el) => {
      const key = el.dataset.shopHref;
      el.href = key === 'email' ? 'mailto:' + shop.email : shop[key];
    });
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
    if (shop.metrikaId) loadMetrika(shop.metrikaId);
    return catalog;
  });

// Недовольный орешек в правом нижнем углу: предупреждает, что днём будет ярко
const GRUMPY_SVG = `<svg viewBox="0 0 120 120" aria-hidden="true">
  <defs>
    <radialGradient id="gnBody" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#e3a666"/><stop offset=".55" stop-color="#a5652f"/><stop offset="1" stop-color="#5f3517"/></radialGradient>
    <radialGradient id="gnCap" cx=".45" cy=".3" r=".8"><stop offset="0" stop-color="#f6e2bf"/><stop offset="1" stop-color="#c9a06b"/></radialGradient>
  </defs>
  <ellipse cx="60" cy="112" rx="30" ry="5" fill="rgba(0,0,0,.18)"/>
  <circle cx="60" cy="66" r="42" fill="url(#gnBody)"/>
  <path d="M24 46 Q60 4 96 46 Q60 34 24 46Z" fill="url(#gnCap)"/>
  <path d="M60 10 L64 2 L66 12Z" fill="#7a4a22"/>
  <g fill="#fff"><ellipse cx="45" cy="64" rx="9" ry="6"/><ellipse cx="75" cy="64" rx="9" ry="6"/></g>
  <g fill="#2a1508"><circle cx="46" cy="66" r="3.6"/><circle cx="74" cy="66" r="3.6"/></g>
  <g fill="#8d5225"><path d="M34 58 Q45 52 56 60 L56 64 Q45 58 34 62Z"/><path d="M86 58 Q75 52 64 60 L64 64 Q75 58 86 62Z"/></g>
  <g stroke="#2a1508" stroke-width="3.2" stroke-linecap="round" fill="none"><path d="M35 51 L53 57"/><path d="M85 51 L67 57"/><path d="M48 90 Q60 81 72 90"/></g>
</svg>`;
// Пока орешек на экране, день ещё не включён: нужно нажать «День» второй раз
let grumpyTimer = 0;
let dayArmed = false;
function showGrumpy() {
  let el = document.querySelector('.grumpy');
  if (!el) {
    el = document.createElement('div');
    el.className = 'grumpy';
    el.setAttribute('role', 'status');
    el.innerHTML = `${GRUMPY_SVG}<p class="grumpy__bubble"><b>Эй! Сейчас будет ярко.</b> Нажми «День» ещё раз — на свой страх и риск 😒</p>`;
    document.body.append(el);
  }
  dayArmed = true;
  clearTimeout(grumpyTimer);
  requestAnimationFrame(() => el.classList.add('show'));
  grumpyTimer = setTimeout(hideGrumpy, 6000);
}
function hideGrumpy() {
  dayArmed = false;
  clearTimeout(grumpyTimer);
  document.querySelector('.grumpy')?.classList.remove('show');
}

// Переключатель «Ночь / День». Тема ставится ещё в <head>, здесь — только кнопки
document.querySelectorAll('[data-theme-set]').forEach((btn) => {
  const sync = () => btn.setAttribute('aria-pressed', String((document.documentElement.dataset.theme || 'night') === btn.dataset.themeSet));
  sync();
  btn.addEventListener('click', () => {
    const theme = btn.dataset.themeSet;
    const root = document.documentElement;
    if ((root.dataset.theme || 'night') === theme) return hideGrumpy();
    // Первое нажатие на «День» — только предупреждение, второе — включает
    if (theme === 'day' && !dayArmed) return showGrumpy();
    hideGrumpy();
    switchTheme(btn, theme);
  });
});

function switchTheme(btn, theme) {
  const root = document.documentElement;
  const apply = () => {
    root.dataset.theme = theme;
    try { localStorage.setItem('cosmo-theme', theme); } catch (e) { /* приватный режим — тема просто не запомнится */ }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'day' ? '#ffffff' : '#020204');
    document.querySelectorAll('[data-theme-set]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
  };
  // Переключатель пружинит, как капля
  const sw = btn.closest('.theme-switch');
  sw.classList.remove('squish');
  void sw.offsetWidth;
  sw.classList.add('squish');
  // Новая тема растекается по странице каплей от нажатой кнопки; без поддержки браузера — просто сменится
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return apply();
  const r = btn.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(apply).ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end * 0.18}px at ${x}px ${y + 14}px)`, `circle(${end}px at ${x}px ${y}px)`] },
      { duration: 900, easing: 'cubic-bezier(.65, 0, .35, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  }).catch(() => { /* вкладка в фоне — браузер пропускает анимацию, тема всё равно меняется */ });
}

// Яндекс Метрика подключается, только если в catalog.json указан shop.metrikaId
function loadMetrika(id) {
  (function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
    m[i].l = 1 * new Date();
    k = e.createElement(t); a = e.getElementsByTagName(t)[0];
    k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
  window.ym(id, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });
}

// Цель в Метрике (например, «заказ оформлен»); без Метрики ничего не делает
window.reachGoal = (goal, params) => {
  window.catalogReady.then((c) => window.ym && c.shop.metrikaId && window.ym(c.shop.metrikaId, 'reachGoal', goal, params));
};
