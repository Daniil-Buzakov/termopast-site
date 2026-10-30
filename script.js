let products = [];
let categories = [];
let cart = [];

const iconsMap = {
  "Видеокарта": "icon-gpu.png",
  "Мат. плата": "icon-mb.png",
  "ОЗУ": "icon-ram.png",
  "Охлаждение": "icon-cooler.png",
  "Процессор": "icon-cpu.png"
};

async function loadData() {
  try {
    const res = await fetch('data/products.json');
    const data = await res.json();
    products = data.products;
    categories = data.categories;
    renderFilters();
    renderCatalog('all');
  } catch (err) {
    console.error(err);
    document.getElementById('catalog-list').innerHTML = '<p class="empty">Ошибка загрузки каталога.</p>';
  }
}

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
}

function renderCard(p) {
  const specsHtml = Object.entries(p.specs).map(([k, v]) => {
    const iconSrc = iconsMap[k] || "icon-cpu.png";
    return `
      <div class="mini-spec-row">
        <img src="${iconSrc}" alt="${k}" class="spec-icon-img">
        <div class="spec-info">
          <span>${k}</span>
          <strong>${v}</strong>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="pc-card" onclick="openProductDetails(${p.id})">
      <div class="pc-card-top">
        <div class="brand-logo ${p.brand}">${p.brand.toUpperCase()}</div>
        <img src="${p.image}" alt="${p.name}" class="pc-image">
        <div class="pc-series">${p.series}</div>
        <div class="pc-name">${p.name}</div>
        <div class="pc-price">от ${p.price.toLocaleString('ru-RU')} ₽</div>
      </div>
      <div class="pc-card-bottom">
        <button class="buy-btn" onclick="event.stopPropagation(); addToCart(${p.id})">Купить ПК <span>→</span></button>
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

// 2. Исправлен баг с отображением не той сборки
function openProductDetails(id) {
  // Ищем по ID (приводим к числу на всякий случай)
  const p = products.find(prod => prod.id === Number(id));
  if (!p) return;

  const specsHtml = Object.entries(p.specs).map(([k, v]) => `
    <div class="detail-spec-row"><span>${k}</span><strong>${v}</strong></div>
  `).join('');

  document.getElementById('product-detail-content').innerHTML = `
    <img src="${p.image}" class="detail-image">
    <div class="detail-brand">${p.series}</div>
    <h2 class="detail-name">${p.name}</h2>
    <div class="detail-price">от ${p.price.toLocaleString('ru-RU')} ₽</div>
    
    <div class="detail-desc">
      <h3>Описание</h3>
      <p>${p.description}</p>
      <p><strong>Что в коробке:</strong> Кабели питания, гарантийный талон, инструкция.</p>
      <p><strong>Апгрейд:</strong> Можно расширить ОЗУ до 64GB, есть слот под второй NVMe.</p>
    </div>

    <div class="detail-specs">
      <h3>Комплектующие</h3>
      ${specsHtml}
    </div>

    <div class="detail-actions">
      <button class="buy-btn" onclick="addToCart(${p.id}); closeProductDetails();">Купить ПК</button>
      <button class="order-this-btn" onclick="openOrderModal('checkout', ${p.id}); closeProductDetails();">Задать вопрос по сборке</button>
    </div>
  `;

  document.getElementById('product-detail-panel').classList.add('open');
}

function closeProductDetails() {
  document.getElementById('product-detail-panel').classList.remove('open');
}

function addToCart(id) {
  const product = products.find(p => p.id === Number(id));
  if (!product) return;
  cart.push(product);
  updateCartUI();
  if (!document.getElementById('cart-sidebar').classList.contains('open')) toggleCart();
}

function updateCartUI() {
  document.getElementById('cart-count').textContent = cart.length;
  const itemsDiv = document.getElementById('cart-items');
  const totalSpan = document.getElementById('cart-total');

  if (cart.length === 0) {
    itemsDiv.innerHTML = '<p>Корзина пуста</p>';
    totalSpan.textContent = '0';
    return;
  }

  let html = ''; let total = 0;
  cart.forEach((item, index) => {
    html += `<div class="cart-item"><span>${item.name}</span><span>${item.price.toLocaleString('ru-RU')} ₽<button class="rm" onclick="removeFromCart(${index})">×</button></span></div>`;
    total += item.price;
  });
  itemsDiv.innerHTML = html;
  totalSpan.textContent = total.toLocaleString('ru-RU');
}

function removeFromCart(index) { cart.splice(index, 1); updateCartUI(); }
function toggleCart() { document.getElementById('cart-sidebar').classList.toggle('open'); }

function checkoutCart() {
  if (cart.length === 0) {
    alert('Корзина пуста. Добавьте сборку.');
    return;
  }
  openOrderModal('cart');
}

// 1. Управление модальным окном и скрытие полей
function openOrderModal(type, productId = null) {
  const modal = document.getElementById('order-modal');
  const title = document.getElementById('modal-title');
  const subtitle = document.getElementById('modal-subtitle');
  const deliveryGroup = document.getElementById('delivery-group');
  const extraFieldsGroup = document.getElementById('extra-fields-group');
  const orderTypeInput = document.getElementById('order_type');
  const productInfoBlock = document.getElementById('selected-product-info');
  const productNameSpan = document.getElementById('selected-product-name');
  const submitBtn = document.getElementById('submit-btn');
  const agreeCheckbox = document.getElementById('agree');

  // Сброс состояния
  document.getElementById('form-success').hidden = true;
  document.getElementById('order-form').reset();
  document.getElementById('cart_items_hidden').value = '';
  productInfoBlock.hidden = true;
  
  // Блокируем кнопку до клика на чекбокс
  submitBtn.disabled = true;

  if (type === 'cart') {
    title.textContent = 'Оформление заявки';
    subtitle.textContent = 'Проверьте состав корзины и укажите данные для связи.';
    deliveryGroup.style.display = 'block';
    extraFieldsGroup.style.display = 'block';
    orderTypeInput.value = 'Заказ из корзины';
    
    const itemsText = cart.map(item => `• ${item.name} — ${item.price.toLocaleString('ru-RU')} ₽`).join('\n');
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cart_items_hidden').value = `${itemsText}\n\nИтого: ${total.toLocaleString('ru-RU')} ₽`;
    
    toggleCart();
  } 
  else if (type === 'custom') {
    title.textContent = 'Подбор ПК';
    subtitle.textContent = 'Расскажите о ваших задачах, и мы поможем выбрать.';
    deliveryGroup.style.display = 'block';
    extraFieldsGroup.style.display = 'block';
    orderTypeInput.value = 'Индивидуальная сборка на заказ';
  } 
  else if (type === 'contact') {
    title.textContent = 'Связаться с нами';
    subtitle.textContent = 'Оставьте ваши контакты, и мы ответим.';
    deliveryGroup.style.display = 'none';
    extraFieldsGroup.style.display = 'none';
    orderTypeInput.value = 'Общий вопрос / Связаться';
  }
  else if (type === 'checkout' && productId) {
    const p = products.find(prod => prod.id === Number(productId));
    title.textContent = 'Вопрос по сборке';
    subtitle.textContent = 'Мы свяжемся с вами для консультации.';
    deliveryGroup.style.display = 'none'; // Убрали доставку для простого вопроса
    extraFieldsGroup.style.display = 'none'; // Убрали доп поля
    orderTypeInput.value = `Вопрос по сборке: ${p.name}`;
    
    productInfoBlock.hidden = false;
    productNameSpan.textContent = p.name;
    
    document.getElementById('cart_items_hidden').value = `Интересует сборка: ${p.name}\nЦена: ${p.price.toLocaleString('ru-RU')} ₽`;
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

const orderForm = document.getElementById('order-form');
if (orderForm) {
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = orderForm.querySelector('.submit-btn');
    const successMsg = document.getElementById('form-success');
    const originalText = submitBtn.textContent;

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
        
        if(document.getElementById('order_type').value === 'Заказ из корзины') {
          cart = [];
          updateCartUI();
        }
        
        setTimeout(() => closeOrderModal(), 3000);
        
      } else {
        alert('Ошибка при отправке. Попробуйте позже.');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка сети. Попробуйте снова.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

loadData();