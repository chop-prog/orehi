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

// Переключатель «Ночь / День». Тема ставится ещё в <head>, здесь — только кнопки
document.querySelectorAll('[data-theme-set]').forEach((btn) => {
  const sync = () => btn.setAttribute('aria-pressed', String((document.documentElement.dataset.theme || 'night') === btn.dataset.themeSet));
  sync();
  btn.addEventListener('click', () => {
    const theme = btn.dataset.themeSet;
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('cosmo-theme', theme); } catch (e) { /* приватный режим — тема просто не запомнится */ }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'day' ? '#ffffff' : '#020204');
    document.querySelectorAll('[data-theme-set]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
  });
});

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
