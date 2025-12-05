// Глобальные переменные
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let comparison = JSON.parse(localStorage.getItem('comparison')) || [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initCart();
    initComparison();
    
    // Инициализация страниц
    if (document.getElementById('popular-products')) {
        loadPopularProducts();
    }
    
    if (document.getElementById('products-grid')) {
        loadProducts();
        initFilters();
    }
    
    if (document.getElementById('product-detail')) {
        loadProductDetail();
    }
    
    if (document.getElementById('cart-items')) {
        loadCart();
    }
    
    initModals();
});

// Навигация
function initNavigation() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Закрытие меню при клике вне его
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });
}

// Корзина
function initCart() {
    updateCartCount();
}

function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            quantity: quantity
        });
    }
    
    saveCart();
    updateCartCount();
    showNotification('Товар добавлен в корзину');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    if (document.getElementById('cart-items')) {
        loadCart();
    }
    showNotification('Товар удален из корзины');
}

function updateCartItemQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart();
            if (document.getElementById('cart-items')) {
                loadCart();
            }
        }
    }
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartItemsCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const cartCounts = document.querySelectorAll('.cart-count');
    const count = getCartItemsCount();
    cartCounts.forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

function loadCart() {
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.style.display = 'none';
        if (cartEmpty) cartEmpty.style.display = 'block';
        return;
    }
    
    if (cartEmpty) cartEmpty.style.display = 'none';
    cartItems.style.display = 'block';
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 500 500%22%3E%3Crect fill=%22%23f5f5f5%22 width=%22500%22 height=%22500%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2260%22%3E🥩%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="cart-item-info">
                <h3 class="cart-item-title">${item.name}</h3>
                <div class="cart-item-price">${item.price} ₽</div>
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="updateCartItemQuantity(${item.id}, parseInt(this.value))">
                    <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">Удалить</button>
            </div>
        </div>
    `).join('');
    
    // Обновление итогов
    const totalItems = document.getElementById('total-items');
    const totalPrice = document.getElementById('total-price');
    const finalPrice = document.getElementById('final-price');
    
    if (totalItems) totalItems.textContent = getCartItemsCount();
    if (totalPrice) totalPrice.textContent = getCartTotal() + ' ₽';
    if (finalPrice) finalPrice.textContent = getCartTotal() + ' ₽';
}

// Сравнение товаров
function initComparison() {
    updateComparisonBar();
}

function toggleComparison(productId) {
    const index = comparison.indexOf(productId);
    if (index > -1) {
        comparison.splice(index, 1);
        showNotification('Товар удален из сравнения');
    } else {
        if (comparison.length >= 3) {
            showNotification('Можно сравнить максимум 3 товара', 'error');
            return;
        }
        comparison.push(productId);
        showNotification('Товар добавлен в сравнение');
    }
    
    saveComparison();
    updateComparisonBar();
    updateComparisonButtons();
}

function clearComparison() {
    comparison = [];
    saveComparison();
    updateComparisonBar();
    updateComparisonButtons();
    if (document.getElementById('products-grid')) {
        loadProducts();
    }
}

function saveComparison() {
    localStorage.setItem('comparison', JSON.stringify(comparison));
}

function updateComparisonBar() {
    const comparisonBar = document.getElementById('comparison-bar');
    const comparisonCount = document.getElementById('comparison-count');
    
    if (comparisonBar) {
        comparisonBar.style.display = comparison.length > 0 ? 'flex' : 'none';
    }
    
    if (comparisonCount) {
        comparisonCount.textContent = comparison.length;
    }
}

function updateComparisonButtons() {
    document.querySelectorAll('.btn-compare').forEach(btn => {
        const productId = parseInt(btn.dataset.productId);
        if (comparison.includes(productId)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function showComparison() {
    const modal = document.getElementById('comparison-modal');
    const table = document.getElementById('comparison-table');
    
    if (!modal || !table) return;
    
    const compareProducts = products.filter(p => comparison.includes(p.id));
    
    if (compareProducts.length === 0) {
        table.innerHTML = '<p>Нет товаров для сравнения</p>';
        modal.style.display = 'block';
        return;
    }
    
    const specs = ['Вес', 'Происхождение', 'Срок годности', 'Условия хранения', 'Категория'];
    
    table.innerHTML = `
        <div class="comparison-table">
            <table>
                <thead>
                    <tr>
                        <th>Характеристика</th>
                        ${compareProducts.map(p => `<th>${p.name}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Цена</strong></td>
                        ${compareProducts.map(p => `<td>${p.price} ₽</td>`).join('')}
                    </tr>
                    <tr>
                        <td><strong>Категория</strong></td>
                        ${compareProducts.map(p => `<td>${categories[p.category]}</td>`).join('')}
                    </tr>
                    ${specs.map(spec => `
                        <tr>
                            <td><strong>${spec}</strong></td>
                            ${compareProducts.map(p => `<td>${p.specs[spec] || '-'}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Загрузка популярных товаров
function loadPopularProducts() {
    const container = document.getElementById('popular-products');
    if (!container) return;
    
    const popular = products.slice(0, 4);
    container.innerHTML = popular.map(product => createProductCard(product)).join('');
}

// Загрузка всех товаров
function loadProducts(filteredProducts = null) {
    const container = document.getElementById('products-grid');
    const noResults = document.getElementById('no-results');
    
    if (!container) return;
    
    const productsToShow = filteredProducts || products;
    
    if (productsToShow.length === 0) {
        container.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    if (noResults) noResults.style.display = 'none';
    
    container.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
    updateComparisonButtons();
}

// Создание карточки товара
function createProductCard(product) {
    const isInComparison = comparison.includes(product.id);
    
    return `
        <div class="product-card">
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            <div class="product-image">
                <img src="${product.images[0]}" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 500 500%22%3E%3Crect fill=%22%23f5f5f5%22 width=%22500%22 height=%22500%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2260%22%3E🥩%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-category">${categories[product.category]}</div>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <div class="product-price">${product.price} ₽</div>
                    <div class="product-actions">
                        <button class="btn-icon btn-compare ${isInComparison ? 'active' : ''}" 
                                data-product-id="${product.id}" 
                                onclick="toggleComparison(${product.id})" 
                                title="Сравнить">
                            ⚖️
                        </button>
                        <button class="btn-icon btn-add-cart" 
                                onclick="addToCart(${product.id})" 
                                title="В корзину">
                            🛒
                        </button>
                    </div>
                </div>
                <a href="product.html?id=${product.id}" class="btn btn-outline" style="width: 100%; margin-top: 1rem; text-align: center; display: block;">Подробнее</a>
            </div>
        </div>
    `;
}

// Фильтрация и поиск
function initFilters() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const sortFilter = document.getElementById('sort-filter');
    const resetBtn = document.getElementById('reset-filters');
    
    // Загрузка параметров из URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam && categoryFilter) {
        categoryFilter.value = categoryParam;
    }
    
    function applyFilters() {
        let filtered = [...products];
        
        // Поиск
        if (searchInput && searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm)
            );
        }
        
        // Категория
        if (categoryFilter && categoryFilter.value !== 'all') {
            filtered = filtered.filter(p => p.category === categoryFilter.value);
        }
        
        // Цена
        if (priceFilter && priceFilter.value !== 'all') {
            const [min, max] = priceFilter.value.split('-').map(v => v === '+' ? Infinity : parseInt(v));
            filtered = filtered.filter(p => {
                if (max === Infinity) return p.price >= min;
                return p.price >= min && p.price <= max;
            });
        }
        
        // Сортировка
        if (sortFilter && sortFilter.value !== 'default') {
            switch(sortFilter.value) {
                case 'price-asc':
                    filtered.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    filtered.sort((a, b) => b.price - a.price);
                    break;
                case 'name-asc':
                    filtered.sort((a, b) => a.name.localeCompare(b.name));
                    break;
            }
        }
        
        loadProducts(filtered);
    }
    
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(applyFilters, 300);
        });
    }
    
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (priceFilter) priceFilter.addEventListener('change', applyFilters);
    if (sortFilter) sortFilter.addEventListener('change', applyFilters);
    
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (searchInput) searchInput.value = '';
            if (categoryFilter) categoryFilter.value = 'all';
            if (priceFilter) priceFilter.value = 'all';
            if (sortFilter) sortFilter.value = 'default';
            applyFilters();
        });
    }
    
    // Кнопка сравнения
    const compareBtn = document.getElementById('compare-btn');
    if (compareBtn) {
        compareBtn.addEventListener('click', showComparison);
    }
    
    const clearComparisonBtn = document.getElementById('clear-comparison');
    if (clearComparisonBtn) {
        clearComparisonBtn.addEventListener('click', clearComparison);
    }
    
    // Применение фильтров при загрузке
    applyFilters();
}

// Загрузка детальной страницы товара
function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId) {
        window.location.href = 'catalog.html';
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        window.location.href = 'catalog.html';
        return;
    }
    
    // Обновление breadcrumbs
    const breadcrumbCategory = document.getElementById('breadcrumb-category');
    const breadcrumbProduct = document.getElementById('breadcrumb-product');
    if (breadcrumbCategory) breadcrumbCategory.textContent = categories[product.category];
    if (breadcrumbProduct) breadcrumbProduct.textContent = product.name;
    
    // Загрузка деталей товара
    const container = document.getElementById('product-detail');
    if (!container) return;
    
    const isInComparison = comparison.includes(product.id);
    
    container.innerHTML = `
        <div class="product-gallery">
            <div class="main-image" id="main-image">
                <img src="${product.images[0]}" alt="${product.name}" id="main-img" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 500 500%22%3E%3Crect fill=%22%23f5f5f5%22 width=%22500%22 height=%22500%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2260%22%3E🥩%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="thumbnail-images">
                ${product.images.map((img, index) => `
                    <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)">
                        <img src="${img}" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 500 500%22%3E%3Crect fill=%22%23f5f5f5%22 width=%22500%22 height=%22500%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2260%22%3E🥩%3C/text%3E%3C/svg%3E'">
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="product-details">
            ${product.badge ? `<div class="product-badge" style="display: inline-block; margin-bottom: 1rem;">${product.badge}</div>` : ''}
            <h1>${product.name}</h1>
            <div class="product-price">${product.price} ₽</div>
            <div class="product-category">${categories[product.category]}</div>
            <div class="product-description-full">
                ${product.fullDescription}
            </div>
            <div class="product-specs">
                <h3>Характеристики</h3>
                ${Object.entries(product.specs).map(([key, value]) => `
                    <div class="spec-item">
                        <span>${key}:</span>
                        <span><strong>${value}</strong></span>
                    </div>
                `).join('')}
            </div>
            <div class="product-actions-large">
                <button class="btn-icon btn-compare ${isInComparison ? 'active' : ''}" 
                        data-product-id="${product.id}" 
                        onclick="toggleComparison(${product.id})" 
                        title="Сравнить">
                    ⚖️ Сравнить
                </button>
                <button class="btn btn-primary btn-large-full" onclick="addToCart(${product.id})">
                    🛒 Добавить в корзину
                </button>
            </div>
            <button class="btn btn-outline btn-large-full" style="margin-top: 1rem;" onclick="openConsultationModal()">
                📞 Заказать консультацию
            </button>
        </div>
    `;
    
    updateComparisonButtons();
    
    // Загрузка похожих товаров
    loadRelatedProducts(productId);
}

function changeMainImage(src, thumbnail) {
    const mainImg = document.getElementById('main-img');
    if (mainImg) {
        mainImg.src = src;
    }
    
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
}

function loadRelatedProducts(currentProductId) {
    const product = products.find(p => p.id === currentProductId);
    if (!product) return;
    
    const related = products
        .filter(p => p.id !== currentProductId && p.category === product.category)
        .slice(0, 4);
    
    const container = document.getElementById('related-products');
    if (container) {
        container.innerHTML = related.map(p => createProductCard(p)).join('');
        updateComparisonButtons();
    }
}

// Модальные окна
function initModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.modal-close');
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
    
    // Форма консультации
    const consultationForm = document.getElementById('consultation-form');
    if (consultationForm) {
        consultationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Спасибо! Мы свяжемся с вами в ближайшее время.');
            this.closest('.modal').style.display = 'none';
            this.reset();
        });
    }
    
    // Форма оформления заказа
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Сбор данных формы
            const inputs = this.querySelectorAll('input, textarea, select');
            const orderData = {};
            
            inputs.forEach(input => {
                if (input.type === 'submit') return;
                const formGroup = input.closest('.form-group');
                if (formGroup) {
                    const label = formGroup.querySelector('label');
                    if (label) {
                        const labelText = label.textContent.replace('*', '').trim();
                        orderData[labelText] = input.value;
                    }
                }
            });
            
            // Отправка заказа в Telegram
            const telegramSent = await sendOrderToTelegram(orderData);
            
            if (telegramSent) {
                showNotification('Заказ успешно оформлен! Мы свяжемся с вами для подтверждения.', 'success');
            } else {
                showNotification('Заказ оформлен! Мы получим уведомление и свяжемся с вами.', 'success');
            }
            
            cart = [];
            saveCart();
            updateCartCount();
            this.closest('.modal').style.display = 'none';
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        });
    }
    
    // Кнопка оформления заказа
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                showNotification('Корзина пуста', 'error');
                return;
            }
            openCheckoutModal();
        });
    }
}

function openConsultationModal() {
    const modal = document.getElementById('consultation-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function openCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');
    
    if (!modal) return;
    
    if (checkoutItems) {
        checkoutItems.innerHTML = cart.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                <span>${item.name} x${item.quantity}</span>
                <span>${item.price * item.quantity} ₽</span>
            </div>
        `).join('');
    }
    
    if (checkoutTotal) {
        checkoutTotal.textContent = getCartTotal() + ' ₽';
    }
    
    modal.style.display = 'block';
}

// Отправка заказа в Telegram
async function sendOrderToTelegram(orderData) {
    // Проверка наличия конфигурации
    if (typeof TELEGRAM_CONFIG === 'undefined' || 
        !TELEGRAM_CONFIG.BOT_TOKEN || 
        TELEGRAM_CONFIG.BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' ||
        !TELEGRAM_CONFIG.CHAT_ID ||
        TELEGRAM_CONFIG.CHAT_ID === 'YOUR_CHAT_ID_HERE') {
        console.warn('Telegram не настроен. Пожалуйста, настройте config.js');
        return false;
    }
    
    try {
        // Формирование сообщения о заказе
        const orderItems = cart.map(item => 
            `  • ${item.name} - ${item.quantity} шт. × ${item.price} ₽ = ${item.quantity * item.price} ₽`
        ).join('\n');
        
        const totalPrice = getCartTotal();
        const orderNumber = Date.now();
        const orderDate = new Date().toLocaleString('ru-RU');
        
        // Преобразование способа оплаты
        const paymentMethods = {
            'cash': 'Наличными при получении',
            'card': 'Банковской картой',
            'online': 'Онлайн оплата'
        };
        const paymentMethod = paymentMethods[orderData['Способ оплаты']] || orderData['Способ оплаты'] || 'Не указано';
        
        const message = `🛒 *НОВЫЙ ЗАКАЗ #${orderNumber}*

📅 *Дата:* ${orderDate}

👤 *Клиент:*
  Имя: ${orderData['Имя'] || 'Не указано'}
  Телефон: ${orderData['Телефон'] || 'Не указано'}
  Email: ${orderData['Email'] || 'Не указано'}

📍 *Адрес доставки:*
${orderData['Адрес доставки'] || 'Не указано'}

💳 *Способ оплаты:*
${paymentMethod}

📝 *Комментарий:*
${orderData['Комментарий к заказу'] || 'Нет комментария'}

🛍️ *Товары:*
${orderItems}

💰 *Итого:* ${totalPrice} ₽
📦 *Количество товаров:* ${getCartItemsCount()} шт.

━━━━━━━━━━━━━━━━━━━━
_Заказ оформлен через сайт_`;

        // Отправка сообщения в Telegram
        const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.ok) {
                console.log('Заказ успешно отправлен в Telegram');
                return true;
            } else {
                console.error('Ошибка отправки в Telegram:', data);
                return false;
            }
        } else {
            console.error('Ошибка HTTP при отправке в Telegram:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Ошибка при отправке заказа в Telegram:', error);
        return false;
    }
}

// Уведомления
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#dc3545' : '#28a745'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Добавление анимаций для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

