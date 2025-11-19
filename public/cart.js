// Импорт модулей Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, push, set, ref, get } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyArJFBHmuAYnZx0RMZdEzYbvSRDjDhST6Q",
  authDomain: "aquarelle-hotel.firebaseapp.com",
  projectId: "aquarelle-hotel",
  storageBucket: "aquarelle-hotel.firebasestorage.app",
  messagingSenderId: "510262265779",
  appId: "1:510262265779:web:2714a5532d9f864dc4adc6",
  measurementId: "G-CF9D18E1J4"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Получение корзины из localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartContainer = document.getElementById('cartContainer');
const totalAmountEl = document.getElementById('totalAmount');
const checkoutButton = document.getElementById('checkoutCart');

// Получение email текущего пользователя из localStorage
const currentUserEmail = localStorage.getItem("currentUserEmail");

// Преобразоваие строки цены в число
function parsePrice(price) {
    if (!price) return 0;
    if (typeof price === 'number') return price;
    return parseFloat(price.replace(/\D/g, '')) || 0;
}

// Функция рендера корзины
function renderCart() {
    cartContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Корзина пуста.</p>';
        totalAmountEl.textContent = '0';
        return;
    }

    cart.forEach((item, index) => {
        const priceNumber = parsePrice(item.price);
        const itemTotal = priceNumber * item.quantity;
        total += itemTotal;

        const card = document.createElement('div');
        card.className = "bg-white border border-gray-200 rounded-lg shadow p-4 flex justify-between items-center gap-4";

        card.innerHTML = `
            <div class="flex items-center gap-4">
                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-contain rounded"/>
                <div>
                    <h3 class="font-semibold">${item.name}</h3>
                    <p>Цена: <b>${item.price}</b></p>
                    <p>Сумма: <b class="item-sum">${itemTotal.toLocaleString('ru-RU')} ₽</b></p>
                    <p class="text-sm text-gray-600">В наличии: ${item.stock}</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <input type="number" min="1" max="${item.stock}" value="${item.quantity}" class="quantity border rounded p-1 w-20"/>
                <button class="remove bg-red-700 text-white px-2 py-1 rounded hover:bg-rose-300 hover:text-red-950">Удалить</button>
            </div>
        `;

        // Изменение количества
        const qtyInput = card.querySelector('.quantity');
        const itemSumEl = card.querySelector('.item-sum');

        qtyInput.addEventListener('input', (e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) val = 1;
            if (val > item.stock) {
                showMessage(`На складе только ${item.stock} шт.`);
                val = item.stock;
            }
            item.quantity = val;
            localStorage.setItem('cart', JSON.stringify(cart));

            // обновление суммы по позиции
            const newItemTotal = priceNumber * item.quantity;
            itemSumEl.textContent = newItemTotal.toLocaleString('ru-RU') + ' ₽';

            renderCart(); //  корзину для итога
        });

        // Удаление товара
        card.querySelector('.remove').addEventListener('click', () => {
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        });

        cartContainer.appendChild(card);
    });

    totalAmountEl.textContent = total.toLocaleString('ru-RU') + ' ₽';
}

// Очистка корзины
document.getElementById('clearCart').addEventListener('click', () => {
    if (!confirm('Вы уверены, что хотите очистить корзину?')) return;
    cart = [];
    localStorage.removeItem('cart');
    renderCart();
});

// Оформление заказа
checkoutButton.addEventListener('click', async () => {
    const currentUserEmail = localStorage.getItem("currentUserEmail");
    if (cart.length === 0) {
        showMessage("Корзина пуста!");
        return;
    }

     if (!currentUserEmail) {
        showMessage("Вы должны войти в аккаунт, чтобы оформить заказ.");
        return;
    }

    try {
        // Ссылка на историю заказов пользователя в Firebase
        const ordersRef = ref(db, `users/${currentUserEmail.replace(/\./g,'_')}/orders`);
        const newOrderRef = push(ordersRef);
        await set(newOrderRef, {
            date: new Date().toLocaleString("ru-RU"),
            items: cart
        });

        // Очистка корзину
        cart = [];
        localStorage.removeItem("cart");
        renderCart();

        showMessage("Заказ успешно оформлен!");

    } catch (error) {
        console.error(error);
        showMessage("Ошибка при оформлении заказа");
    }

});

// Первый рендер
renderCart();
