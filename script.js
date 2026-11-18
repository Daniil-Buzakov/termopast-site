let products = [];
let categories = [];
let cart = [];
let frozenOrders = [];

const iconsMap = {
  "Видеокарта": "icon-gpu.png",
  "Мат. плата": "icon-mb.png",
  "ОЗУ": "icon-ram.png",
  "Охлаждение": "icon-cooler.png",
  "Процессор": "icon-cpu.png"
};

/* ============================================================
   ЗАГРУЗКА ДАННЫХ
   ============================================================ */
async function loadData() {
  try {
    const res = await fetch('data/products.json');
    const data = await res.json();
    products = data.products;
    categories = data.categories;
    renderFilters();
    renderCatalog('all');
    // После отрисовки каталога инициализируем reveal
    requestAnimationFrame(initReveal);
  } catch (err) {
    console.error(err);
    document.getElementById('catalog-list').innerHTML = '<p class="empty">Ошибка загрузки каталога.</p>';
  }
}

/* ============================================================
   REVEAL ON SCROLL
   ============================================================ */
function initReveal() {
  const targets = document.querySelectorAll(
    '.why-card, .step-item, .review-card, .warranty-content, .warranty-image, .how-image, .seo-container, .section-title'
  );
  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('reveal', 'visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

/* ============================================================
   ФИЛЬТРЫ И КАТАЛОГ
   ============================================================ */
function renderFilters() {
  document.getElementById('filters').innerHTML = categories
    .map(c => `<button data-cat="${c.id}" class="${c.id === 'all' ? 'active' : ''}"
      onclick="renderCatalog('${c.id}', this)">${c.label}</button>`).join('');
}

function renderCatalog(categoryId, btn) {
  if (btn) {
    document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  const visibleCats = categoryId === 'all'
    ? categories.filter(c => c.id !== 'all')
    : categories.filter(c => c.id === categoryId);

  const html = visibleCats.map(cat => {
    const items = products.filter(p => p.tier === cat.id);
    if (!items.length) return '';
    return `
      <section class="tier-section">
        <h2 class="tier-title">${cat.label}</h2>
        <div class="grid">${items.map(p => renderCard(p)).join('')}</div>
      </section>`;
  }).join('');

  document.getElementById('catalog-list').innerHTML = html.trim() || '<p class="empty">Нет сборок.</p>';
  requestAnimationFrame(initReveal);
}

function renderCard(p) {
  const seoPhrase = 'сборка компьютеров Хабаровск';
  const specsHtml = Object.entries(p.specs).map(([k, v]) => {
    const iconSrc = iconsMap[k] || "icon-cpu.png";
    return `
      <div class="mini-spec-row">
        <img src="${iconSrc}" alt="${k} ${seoPhrase}" class="spec-icon-img">
        <div class="spec-info">
          <span>${k}</span>
          <strong>${v}</strong>
        </div>
      </div>
    `;
  }).join('');

  const altSeo = `Игровой ПК ${p.name} в Хабаровске — купить компьютер, отзывы`;

  return `
    <div class="pc-card" onclick="openProductDetails(${p.id})">
      <div class="pc-card-top">
        <div class="brand-logo ${p.brand}">${p.brand.toUpperCase()}</div>
        <img src="${p.image}" alt="${altSeo}" title="Заказать сборку ПК ${p.name} в Хабаровске под задачи" class="pc-image">
        <div class="pc-series">${p.series}</div>
        <div class="pc-name">${p.name} — игровой ПК Хабаровск</div>
        <div class="pc-price">от ${p.price.toLocaleString('ru-RU')} ₽</div>
      </div>
      <div class="pc-card-bottom">
        <div class="seo-caption">
          <span>Купить компьютер Хабаровск отзывы • заказать ПК сборку в Хабаровске</span>
        </div>
        <button class="buy-btn" onclick="event.stopPropagation(); openOrderModal('buy', ${p.id})">Купить ПК <span>→</span></button>
        <button class="details-btn" onclick="event.stopPropagation(); openProductDetails(${p.id})">Подробнее о сборке <span>→</span></button>

        <div class="fps-block">
          <div class="fps-circle"><span>${p.fps}</span><small>FPS</small></div>
          <div class="fps-text"><strong>Показатели в играх</strong><span>Средний FPS в играх</span></div>
          <div class="help-icon">?</div>
        </div>
        <div class="mini-specs">${specsHtml}</div>
      </div>
    </div>
  `;
}

/* ============================================================
   ДЕТАЛИ ПРОДУКТА
   ============================================================ */
function openProductDetails(id) {
  const p = products.find(prod => prod.id === Number(id));
  if (!p) return;

  document.title = `Игровой ПК под заказ — ${p.name} от ${p.price.toLocaleString('ru-RU')}₽ в Хабаровске | Термопаст.рф`;
  let desc = `Купить игровой ПК ${p.name} — идеальная сборка под ваши задачи, честные отзывы, индивидуальная сборка и гарантия 12 мес. Заказать ПК в Хабаровске.`;
  let meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', desc);

  const specsHtml = Object.entries(p.specs).map(([k, v]) => `
    <div class="detail-spec-row"><span>${k}</span><strong>${v}</strong></div>
  `).join('');

  const altSeo = `Купить игровой ПК ${p.name} в Хабаровске — отзывы, заказ`;

  document.getElementById('product-detail-content').innerHTML = `
    <img src="${p.image}" alt="${altSeo}" class="detail-image">
    <div class="detail-brand">${p.series}</div>
    <h2 class="detail-name">${p.name} — игровой ПК Хабаровск</h2>
    <div class="detail-price">от ${p.price.toLocaleString('ru-RU')} ₽</div>

    <div class="detail-desc">
      <h3>Описание</h3>
      <p>${p.description} <br><strong>Сборка компьютеров в Хабаровске, купить компьютер, отзывы.</strong></p>
      <p><strong>Что в коробке:</strong> Кабели питания, гарантийный талон, инструкция.</p>
      <p><strong>Апгрейд:</strong> Можно расширить ОЗУ до 64GB, есть слот под второй NVMe.</p>
    </div>

    <div class="detail-specs">
      <h3>Комплектующие</h3>
      ${specsHtml}
    </div>

    <div class="seo-caption">
      <small>Ключи: игровой ПК хабаровск, сборка компьютеров хабаровск, купить компьютер хабаровск отзывы, заказать ПК сборку в Хабаровске</small>
    </div>

    <div class="detail-actions">
      <button class="buy-btn" onclick="openOrderModal('buy', ${p.id}); closeProductDetails();">Купить ПК</button>
      <button class="order-this-btn" onclick="openOrderModal('checkout', ${p.id}); closeProductDetails();">Задать вопрос по сборке</button>
    </div>
  `;

  document.getElementById('product-detail-panel').classList.add('open');
}

function closeProductDetails() {
  document.getElementById('product-detail-panel').classList.remove('open');
  resetAutoSEO();
}

/* ============================================================
   КОРЗИНА
   ============================================================ */
function addToCart(id) {
  const product = products.find(p => p.id === Number(id));
  if (!product) return;
  cart.push(product);
  updateCartUI();
  if (!document.getElementById('cart-sidebar').classList.contains('open')) toggleCart();
}

function updateCartUI() {
  const countEl = document.getElementById('cart-count');
  countEl.textContent = cart.length;
  // Bump-анимация счётчика
  countEl.classList.remove('bump');
  void countEl.offsetWidth;
  countEl.classList.add('bump');

  const itemsDiv = document.getElementById('cart-items');
  const totalSpan = document.getElementById('cart-total');

  let html = '';

  frozenOrders.forEach(order => {
    html += `<div class="cart-item frozen">
      <span>${order.label}</span>
      <span class="frozen-status">Скоро с вами свяжемся</span>
    </div>`;
  });

  if (cart.length === 0 && frozenOrders.length === 0) {
    itemsDiv.innerHTML = '<p>Корзина пуста</p>';
    totalSpan.textContent = '0';
    return;
  }

  let total = 0;
  cart.forEach((item, index) => {
    html += `<div class="cart-item"><span>${item.name}</span><span>${item.price.toLocaleString('ru-RU')} ₽<button class="rm" onclick="removeFromCart(${index})">×</button></span></div>`;
    total += item.price;
  });
  itemsDiv.innerHTML = html;
  totalSpan.textContent = total.toLocaleString('ru-RU');
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}
function toggleCart() { document.getElementById('cart-sidebar').classList.toggle('open'); }

function freezeOrder(label) {
  frozenOrders.push({ label });
  updateCartUI();
}

/* ============================================================
   МОДАЛЬНОЕ ОКНО
   ============================================================ */
function setFieldVisibility({ budget, purpose, delivery }) {
  document.getElementById('budget').closest('.form-group').style.display = budget ? 'block' : 'none';
  document.getElementById('purpose').closest('.form-group').style.display = purpose ? 'block' : 'none';
  document.getElementById('delivery-group').style.display = delivery ? 'block' : 'none';
  document.getElementById('budget').required = !!budget;
  document.getElementById('purpose').required = !!purpose;
}

function openOrderModal(type, productId = null) {
  const modal = document.getElementById('order-modal');
  const title = document.getElementById('modal-title');
  const subtitle = document.getElementById('modal-subtitle');
  const orderTypeInput = document.getElementById('order_type');
  const productInfoBlock = document.getElementById('selected-product-info');
  const productNameSpan = document.getElementById('selected-product-name');
  const submitBtn = document.getElementById('submit-btn');
  const agreeCheckbox = document.getElementById('agree');

  document.getElementById('form-success').hidden = true;
  document.getElementById('order-form').reset();
  document.getElementById('cart_items_hidden').value = '';
  productInfoBlock.hidden = true;
  if (submitBtn) submitBtn.disabled = true;
  if (agreeCheckbox) agreeCheckbox.checked = false;

  setFieldVisibility({ budget: false, purpose: false, delivery: false });

  if (type === 'custom') {
    title.textContent = 'Собрать на заказ';
    subtitle.textContent = 'Расскажите о ваших задачах, и мы поможем подобрать сборку.';
    orderTypeInput.value = 'Индивидуальная сборка на заказ';
    setFieldVisibility({ budget: true, purpose: true, delivery: false });
  }
  else if (type === 'buy' && productId) {
    const p = products.find(prod => prod.id === Number(productId));
    title.textContent = 'Купить ПК';
    subtitle.textContent = 'Оставьте данные для оформления заказа.';
    orderTypeInput.value = `Заказ ПК: ${p.name}`;
    productInfoBlock.hidden = false;
    productNameSpan.textContent = p.name;
    setFieldVisibility({ budget: false, purpose: false, delivery: true });
    document.getElementById('cart_items_hidden').value =
      `Выбранный ПК: ${p.name}\nЦена: ${p.price.toLocaleString('ru-RU')} ₽`;
  }
  else if (type === 'checkout' && productId) {
    const p = products.find(prod => prod.id === Number(productId));
    title.textContent = 'Вопрос по сборке';
    subtitle.textContent = 'Мы свяжемся с вами для консультации.';
    orderTypeInput.value = `Вопрос по сборке: ${p.name}`;
    productInfoBlock.hidden = false;
    productNameSpan.textContent = p.name;
    setFieldVisibility({ budget: false, purpose: false, delivery: false });
    document.getElementById('cart_items_hidden').value =
      `Интересует сборка: ${p.name}\nЦена: ${p.price.toLocaleString('ru-RU')} ₽`;
  }

  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
  document.getElementById('order-modal').hidden = true;
  document.body.style.overflow = '';
}

document.getElementById('order-modal').addEventListener('click', function(e) {
  if (e.target === this) closeOrderModal();
});

/* ============================================================
   ОТПРАВКА ФОРМЫ
   ============================================================ */
const orderForm = document.getElementById('order-form');
if (orderForm) {
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = orderForm.querySelector('.submit-btn');
    const successMsg = document.getElementById('form-success');
    const originalText = submitBtn.textContent;
    const orderType = document.getElementById('order_type').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    successMsg.hidden = true;

    try {
      const response = await fetch(orderForm.action, {
        method: 'POST',
        body: new FormData(orderForm),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        orderForm.reset();
        document.getElementById('cart_items_hidden').value = '';
        successMsg.hidden = false;

        if (orderType.startsWith('Вопрос по сборке:') || orderType.startsWith('Заказ ПК:')) {
          freezeOrder(orderType);
        }

        setTimeout(() => closeOrderModal(), 3000);
      } else {
        const data = await response.json().catch(() => ({}));
        console.error('Formspree Error:', data);
        alert('Ошибка при отправке: ' + (data.error || 'Проверьте настройки формы на Formspree.'));
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    } catch (err) {
      console.error('Network Error:', err);
      alert('Ошибка сети. Проверьте подключение к интернету и попробуйте снова.');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

/* ============================================================
   SEO auto meta
   ============================================================ */
function resetAutoSEO() {
  document.title = "Сборка ПК в Хабаровске на заказ | Игровые компьютеры — Термопаст.рф";
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', "Собираем игровые компьютеры под ваш бюджет за 1-3 дня — с гарантией, быстрой доставкой и индивидуальной консультацией. Стресс-тест, честные чеки, поддержка! Рассчитайте стоимость — подберём идеальную сборку для ваших задач.");
}

/* ============================================================
   ГЛОБАЛЬНЫЕ ОБРАБОТЧИКИ (шапка, hero-курсор)
   ============================================================ */
function initGlobalInteractions() {
  // Шапка сжимается при скролле
  const header = document.querySelector('header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Светящийся курсор в hero
  const hero = document.querySelector('.hero-utp');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      hero.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  }
}

/* ============================================================
   СТАРТ
   ============================================================ */
document.addEventListener('DOMContentLoaded', initGlobalInteractions);
loadData();
