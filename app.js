const $ = (s, root = document) => root.querySelector(s);
const rub = (n) => n.toLocaleString('ru-RU') + ' ₽';
const weightLabel = (g) => (g >= 1000 ? g / 1000 + ' кг' : g + ' г');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// Фото лежат в public/img/<id>.jpg (исходники — Unsplash, см. README)
const imgUrl = (id) => `img/${id}.jpg`;
const absUrl = (path) => new URL(path, CATALOG.shop.siteUrl.replace(/\/?$/, '/')).href;
// Цена за выбранный вес, округлённая до 10 ₽ (так же считает server.py)
const priceFor = (p, g) => (p.fixed ? p.price : Math.round((p.price * g) / 10000) * 10);

const TAGS = { hit: 'Хит продаж', new: 'Новинка', gift: 'Подарок' };

let CATALOG; // { shop, settings, categories, products }
const state = {
  cat: 'all',
  query: '',
  sort: 'popular',
  weights: {}, // выбранная фасовка по id товара
  cart: load('orehi-cart', []), // [{ id, grams, qty }]
};

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const findProduct = (id) => CATALOG.products.find((p) => p.id === id);
const weightOf = (p) => (p.fixed ? null : state.weights[p.id] ?? CATALOG.settings.defaultWeight);

/* ---------- Каталог ---------- */
function renderCategories() {
  const cats = [{ id: 'all', title: 'Все товары' }, ...CATALOG.categories];
  $('#categories').innerHTML = cats.map(
    (c) => `<button class="chip ${c.id === state.cat ? 'active' : ''}" data-cat="${c.id}">${c.title}</button>`
  ).join('');
}

function visibleProducts() {
  const q = state.query.trim().toLowerCase();
  const list = CATALOG.products.filter(
    (p) => (state.cat === 'all' || p.cat === state.cat) &&
      (!q || (p.title + ' ' + p.desc + ' ' + p.origin).toLowerCase().includes(q))
  );
  const sorters = {
    popular: (a, b) => b.popular - a.popular,
    cheap: (a, b) => a.price - b.price,
    expensive: (a, b) => b.price - a.price,
    name: (a, b) => a.title.localeCompare(b.title, 'ru'),
  };
  return list.sort(sorters[state.sort]);
}

function weightButtons(p) {
  if (p.fixed) return `<div class="weights"><span class="weight weight--static">1 набор</span></div>`;
  const g = weightOf(p);
  return `<div class="weights">${CATALOG.settings.weights.map(
    (w) => `<button class="weight ${w === g ? 'active' : ''}" data-weight="${w}" data-id="${p.id}">${weightLabel(w)}</button>`
  ).join('')}</div>`;
}

function priceBlock(p) {
  return `<div class="price">${rub(priceFor(p, weightOf(p)))}${p.fixed ? '' : `<small>${rub(p.price)} за кг</small>`}</div>`;
}

function renderProducts() {
  const list = visibleProducts();
  $('#empty').hidden = list.length > 0;
  $('#products').innerHTML = list.map((p) => `
    <article class="card">
      <button class="card__img" data-open="${p.id}" aria-label="Подробнее: ${p.title}">
        <img src="${imgUrl(p.img, 600, 480)}" alt="${p.title}" loading="lazy" width="300" height="240">
        ${p.tag ? `<span class="tag tag--${p.tag}">${TAGS[p.tag]}</span>` : ''}
      </button>
      <div class="card__body">
        <button class="card__title" data-open="${p.id}">${p.title}</button>
        <div class="card__origin">${p.origin}</div>
        ${weightButtons(p)}
        <div class="card__foot">
          ${priceBlock(p)}
          <button class="btn btn--primary btn--sm" data-add="${p.id}">В корзину</button>
        </div>
      </div>
    </article>`).join('');
}

/* ---------- Карточка товара ---------- */
let openProductId = null;

function renderProductModal() {
  const p = findProduct(openProductId);
  const [kcal, protein, fat, carbs] = p.nutrition;
  $('#productBody').innerHTML = `
    <div class="pm">
      <img class="pm__img" src="${imgUrl(p.img, 900, 900)}" alt="${p.title}">
      <div class="pm__info">
        ${p.tag ? `<span class="tag tag--${p.tag} tag--inline">${TAGS[p.tag]}</span>` : ''}
        <h2 id="pmTitle">${p.title}</h2>
        <p class="card__origin">Происхождение: ${p.origin}</p>
        <p>${p.desc}</p>
        <dl class="specs">
          <dt>Состав</dt><dd>${p.composition}</dd>
          <dt>Срок годности</dt><dd>${p.shelfLife}</dd>
          <dt>Хранение</dt><dd>в сухом прохладном месте, после вскрытия — в закрытой упаковке</dd>
        </dl>
        <div class="nutrition">
          <div><b>${kcal}</b><span>ккал</span></div>
          <div><b>${protein}</b><span>белки, г</span></div>
          <div><b>${fat}</b><span>жиры, г</span></div>
          <div><b>${carbs}</b><span>углеводы, г</span></div>
        </div>
        <p class="hint hint--left">Пищевая ценность на 100 г</p>
        ${weightButtons(p)}
        <div class="card__foot">
          ${priceBlock(p)}
          <button class="btn btn--primary" data-add="${p.id}">В корзину</button>
        </div>
      </div>
    </div>`;
}

function openProduct(id) {
  openProductId = id;
  renderProductModal();
  showModal('#productModal', true);
}

/* ---------- Корзина ---------- */
const cartTotal = () => state.cart.reduce((s, i) => s + priceFor(findProduct(i.id), i.grams) * i.qty, 0);

function addToCart(id) {
  const p = findProduct(id);
  const grams = p.fixed ? null : weightOf(p);
  const item = state.cart.find((i) => i.id === id && i.grams === grams);
  if (item) item.qty = Math.min(99, item.qty + 1);
  else state.cart.push({ id, grams, qty: 1 });
  updateCart();
  window.reachGoal('add_to_cart');
  toast(`Добавлено: ${p.title}${p.fixed ? '' : ', ' + weightLabel(grams)}`);
  const btn = $('#cartOpen');
  btn.classList.remove('bump');
  void btn.offsetWidth; // перезапуск анимации
  btn.classList.add('bump');
}

function changeQty(index, delta) {
  const item = state.cart[index];
  item.qty = Math.min(99, item.qty + delta);
  if (item.qty <= 0) state.cart.splice(index, 1);
  updateCart();
}

function updateCart() {
  // Убираем из сохранённой корзины товары, которых больше нет в каталоге
  state.cart = state.cart.filter((i) => findProduct(i.id));
  save('orehi-cart', state.cart);
  const { minOrder } = CATALOG.settings;
  const total = cartTotal();
  const count = state.cart.reduce((s, i) => s + i.qty, 0);

  $('#cartCount').textContent = count;
  $('#cartCount').hidden = count === 0;
  $('#cartSum').textContent = count ? rub(total) : 'Корзина';
  $('#cartTotal').textContent = rub(total);
  $('#checkoutBtn').disabled = total < minOrder;
  $('#minOrderHint').hidden = count === 0 || total >= minOrder;
  $('#minOrderHint').textContent = `Минимальная сумма заказа — ${rub(minOrder)}`;

  $('#mobileCart').hidden = count === 0;
  $('#mobileCartInfo').textContent = `${count} шт. · ${rub(total)}`;

  $('#cartList').innerHTML = state.cart.length
    ? state.cart.map((i, idx) => {
        const p = findProduct(i.id);
        const price = priceFor(p, i.grams);
        return `
          <li class="cart-item">
            <img class="cart-item__img" src="${imgUrl(p.img, 120)}" alt="">
            <div>
              <div class="cart-item__title">${p.title}</div>
              <div class="cart-item__meta">${p.fixed ? 'набор' : weightLabel(i.grams)} · ${rub(price)}</div>
              <div class="qty">
                <button data-qty="-1" data-idx="${idx}" aria-label="Уменьшить">−</button>
                <span>${i.qty}</span>
                <button data-qty="1" data-idx="${idx}" aria-label="Увеличить">+</button>
              </div>
            </div>
            <div>
              <div class="cart-item__price">${rub(price * i.qty)}</div>
              <button class="cart-item__remove" data-remove="${idx}">Удалить</button>
            </div>
          </li>`;
      }).join('')
    : '<li class="cart-empty">В корзине пока ничего нет.<br>Загляните в каталог.</li>';
}

function openCart(open) {
  const drawer = $('#drawer');
  if (open === drawer.classList.contains('open')) return;
  drawer.classList.toggle('open', open);
  drawer.setAttribute('aria-hidden', !open);
  $('#overlay').hidden = !open;
  trackFocus(open, drawer);
  lockScroll();
}

/* ---------- Модальные окна ---------- */
function showModal(sel, open) {
  const modal = $(sel);
  if (open === !modal.hidden) return;
  // После успешного заказа форма заменена сообщением — возвращаем страницу в исходное состояние
  if (!open && sel === '#checkoutModal' && !form.querySelector('[name="name"]')) location.reload();
  modal.hidden = !open;
  trackFocus(open, modal);
  lockScroll();
}

// При открытии окна запоминаем, откуда пришёл фокус, и ставим его внутрь; при закрытии — возвращаем
const focusStack = [];
function trackFocus(open, container) {
  if (open) {
    focusStack.push(document.activeElement);
    requestAnimationFrame(() => {
      if (!container.contains(document.activeElement)) $('button, [href], input', container)?.focus();
    });
  } else {
    focusStack.pop()?.focus?.();
  }
}

// Tab не выходит за пределы открытого окна
function topLayer() {
  return ['#checkoutModal', '#productModal'].map((s) => $(s)).find((m) => !m.hidden) ||
    ($('#drawer').classList.contains('open') ? $('#drawer') : null);
}
document.addEventListener('keydown', (e) => {
  const layer = e.key === 'Tab' && topLayer();
  if (!layer) return;
  const items = [...layer.querySelectorAll('button, [href], input, select, textarea')]
    .filter((el) => !el.disabled && el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
function lockScroll() {
  const anyOpen = $('#drawer').classList.contains('open') || !$('#productModal').hidden || !$('#checkoutModal').hidden;
  document.body.style.overflow = anyOpen ? 'hidden' : '';
}

/* ---------- Доставка ---------- */
const shippingCost = (method) => CATALOG.settings.delivery[method].price;

function renderDelivery() {
  const entries = Object.entries(CATALOG.settings.delivery);
  $('#deliveryCards').innerHTML = entries.map(([, d]) => `
    <div class="delivery__card">
      <h3>${d.title}</h3>
      <p>${d.note[0].toUpperCase() + d.note.slice(1)}</p>
      <b>${d.price ? rub(d.price) : 'Бесплатно'}</b>
    </div>`).join('');
  $('#deliveryOptions').innerHTML = entries.map(([key, d], i) => `
    <label class="radio">
      <input type="radio" name="delivery" value="${key}" ${i === 0 ? 'checked' : ''}>
      <span><b>${d.title}</b><small>${d.note}</small></span>
      <em data-ship="${key}"></em>
    </label>`).join('');
}

/* ---------- Оформление заказа ---------- */
const form = $('#orderForm');

function renderSummary() {
  const method = form.delivery.value;
  const goods = cartTotal();
  const ship = shippingCost(method);
  const d = CATALOG.settings.delivery[method];
  $('#addressField').hidden = !d.needsAddress;
  $('#addressLabel').textContent = d.addressLabel || 'Адрес';
  form.address.placeholder = d.addressPlaceholder || '';
  $('#addressMap').hidden = !d.mapUrl;
  if (d.mapUrl) $('#addressMap').href = d.mapUrl;
  form.querySelectorAll('[data-ship]').forEach((el) => {
    const cost = shippingCost(el.dataset.ship);
    el.textContent = cost ? rub(cost) : 'бесплатно';
  });
  $('#summary').innerHTML = `
    <div><span>Товары (${state.cart.reduce((s, i) => s + i.qty, 0)} шт.)</span><span>${rub(goods)}</span></div>
    <div><span>Доставка</span><span>${ship ? rub(ship) : 'бесплатно'}</span></div>
    <div class="summary__total"><span>Итого</span><span>${rub(goods + ship)}</span></div>`;
}

function openCheckout() {
  openCart(false);
  formError('');
  // Подставляем данные из прошлого заказа, если покупатель уже заказывал
  const saved = load('orehi-customer', {});
  for (const key of ['name', 'phone', 'address']) {
    if (saved[key] && !form[key].value) form[key].value = saved[key];
  }
  if (saved.delivery && CATALOG.settings.delivery[saved.delivery]) form.delivery.value = saved.delivery;
  renderSummary();
  showModal('#checkoutModal', true);
  (form.name.value ? form.querySelector('[type="submit"]') : form.name).focus();
}

function formError(text) {
  $('#formError').textContent = text;
  $('#formError').hidden = !text;
}

function validate() {
  let ok = true;
  const mark = (el, valid) => { el.classList.toggle('invalid', !valid); if (!valid) ok = false; };
  mark(form.name, form.name.value.trim().length >= 2);
  const digits = form.phone.value.replace(/\D/g, '');
  mark(form.phone, digits.length === 11 && digits[1] === '9');
  const needsAddress = CATALOG.settings.delivery[form.delivery.value].needsAddress;
  mark(form.address, !needsAddress || form.address.value.trim().length >= 5);
  form.consent.closest('.consent').classList.toggle('invalid', !form.consent.checked);
  if (!form.consent.checked) ok = false;
  return ok;
}

// Маска телефона: +7 (999) 123-45-67
function formatPhone(value) {
  let d = value.replace(/\D/g, '');
  if (!d) return '';
  if (d[0] === '8') d = '7' + d.slice(1);
  if (d[0] !== '7') d = '7' + d;
  d = d.slice(0, 11);
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
  let out = '+7';
  if (p[0]) out += ` (${p[0]}`;
  if (p[0].length === 3) out += ')';
  if (p[1]) out += ` ${p[1]}`;
  if (p[2]) out += `-${p[2]}`;
  if (p[3]) out += `-${p[3]}`;
  return out;
}

async function submitOrder(e) {
  e.preventDefault();
  formError('');
  if (!validate()) { formError('Заполните выделенные поля'); return; }

  const btn = $('#submitBtn');
  btn.disabled = true;
  btn.textContent = 'Отправляем…';
  try {
    // Демо-копия для показа (shop.demo в catalog.json): сервера нет, заказ не отправляется
    const res = CATALOG.shop.demo
      ? new Response(JSON.stringify({ number: 'ДЕМО', total: cartTotal() + shippingCost(form.delivery.value) }))
      : await fetch('api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.value.trim(),
          phone: form.phone.value,
          delivery: form.delivery.value,
          address: form.address.value.trim(),
          comment: form.comment.value.trim(),
          consent: form.consent.checked,
          items: state.cart,
        }),
      });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'server');

    const name = form.name.value.trim();
    const phone = form.phone.value;
    save('orehi-customer', { name, phone, address: form.address.value.trim(), delivery: form.delivery.value });
    window.reachGoal('order', { order_price: data.total });
    state.cart = [];
    updateCart();
    form.innerHTML = CATALOG.shop.demo ? `
      <div class="success">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>
        <h2>Так выглядит оформленный заказ</h2>
        <p>Это демо-версия сайта, поэтому заказ на ${rub(data.total)} никуда не отправлен. В рабочей версии он сохраняется на сервере и сразу приходит менеджеру в Telegram с кнопками статусов.</p>
        <button type="button" class="btn btn--primary" data-close>Вернуться в магазин</button>
      </div>` : `
      <div class="success">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>
        <h2>Заказ № ${esc(data.number)} оформлен</h2>
        <p>${esc(name)}, спасибо! Менеджер позвонит на ${esc(phone)} в рабочее время, чтобы подтвердить заказ на ${rub(data.total)}.</p>
        <button type="button" class="btn btn--primary" data-close>Вернуться в магазин</button>
      </div>`;
  } catch (err) {
    const phone = CATALOG.shop.phone;
    formError(err.message && err.message !== 'server' && !err.message.includes('fetch')
      ? err.message
      : `Не удалось отправить заказ. Позвоните нам: ${phone}, мы оформим его по телефону.`);
  } finally {
    if (btn.isConnected) { btn.disabled = false; btn.textContent = 'Подтвердить заказ'; }
  }
}

/* ---------- Прочее ---------- */
let toastTimer;
function toast(text) {
  const el = $('#toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ---------- События ---------- */
$('#categories').addEventListener('click', (e) => {
  const chip = e.target.closest('[data-cat]');
  if (!chip) return;
  state.cat = chip.dataset.cat;
  renderCategories();
  renderProducts();
});
$('#search').addEventListener('input', (e) => { state.query = e.target.value; renderProducts(); });
$('#sort').addEventListener('change', (e) => { state.sort = e.target.value; renderProducts(); });

// Выбор фасовки, добавление и открытие карточки — общие для каталога и окна товара
document.addEventListener('click', (e) => {
  const w = e.target.closest('[data-weight]');
  if (w) {
    state.weights[w.dataset.id] = +w.dataset.weight;
    renderProducts();
    if (!$('#productModal').hidden) renderProductModal();
    return;
  }
  const add = e.target.closest('[data-add]');
  if (add) { addToCart(+add.dataset.add); return; }
  const world = e.target.closest('[data-goto-cat]');
  if (world) {
    state.cat = world.dataset.gotoCat;
    renderCategories();
    renderProducts();
    $('#catalog').scrollIntoView();
    return;
  }
  const open = e.target.closest('[data-open]');
  if (open) { openProduct(+open.dataset.open); return; }
  const close = e.target.closest('[data-close]');
  if (close) showModal('#' + close.closest('.modal').id, false);
});

$('#cartList').addEventListener('click', (e) => {
  const q = e.target.closest('[data-qty]');
  if (q) changeQty(+q.dataset.idx, +q.dataset.qty);
  const r = e.target.closest('[data-remove]');
  if (r) { state.cart.splice(+r.dataset.remove, 1); updateCart(); }
});

$('#cartOpen').addEventListener('click', () => openCart(true));
$('#mobileCart').addEventListener('click', () => openCart(true));

// Если картинка не загрузилась, показываем аккуратную заглушку вместо «битого» значка
document.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG') e.target.classList.add('img-error');
}, true);

// Структурированные данные для Яндекса и Google: магазин и товары с ценами
function renderStructuredData() {
  const { shop, products } = CATALOG;
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Store', name: shop.name, url: shop.siteUrl, telephone: shop.phone, email: shop.email,
        address: { '@type': 'PostalAddress', streetAddress: shop.address, addressCountry: 'RU' },
        image: absUrl(imgUrl('1710857397974-f0617001c39e')),
      },
      ...products.map((p) => ({
        '@type': 'Product', name: p.title, description: p.desc, image: absUrl(imgUrl(p.img)),
        offers: {
          '@type': 'Offer', priceCurrency: 'RUB', availability: 'https://schema.org/InStock',
          price: p.fixed ? p.price : priceFor(p, CATALOG.settings.defaultWeight),
        },
      })),
    ],
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.append(script);
}
$('#cartClose').addEventListener('click', () => openCart(false));
$('#overlay').addEventListener('click', () => openCart(false));
$('#checkoutBtn').addEventListener('click', openCheckout);
document.querySelectorAll('.modal').forEach((m) =>
  m.addEventListener('click', (e) => { if (e.target === m) showModal('#' + m.id, false); })
);
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  openCart(false);
  showModal('#productModal', false);
  showModal('#checkoutModal', false);
});

form.addEventListener('change', (e) => {
  if (e.target.name === 'delivery') renderSummary();
  if (e.target.name === 'consent') e.target.closest('.consent').classList.remove('invalid');
});
form.addEventListener('input', (e) => {
  if (e.target.name === 'phone') e.target.value = formatPhone(e.target.value);
  e.target.classList.remove('invalid');
});
form.addEventListener('submit', submitOrder);

window.catalogReady
  .then((catalog) => {
    CATALOG = catalog;
    renderCategories();
    renderProducts();
    renderDelivery();
    updateCart();
    renderStructuredData();
    if (catalog.shop.demo) {
      const bar = document.createElement('div');
      bar.className = 'demo-bar';
      bar.innerHTML = `Демо-версия для просмотра: заказы с этой страницы не отправляются. Заказать по-настоящему можно в <a href="${esc(catalog.shop.bot)}" target="_blank" rel="noopener">Telegram-боте</a>.`;
      document.body.prepend(bar);
    }
  })
  .catch(() => {
    $('#products').innerHTML = '<p class="empty">Не удалось загрузить каталог. Обновите страницу.</p>';
  });
