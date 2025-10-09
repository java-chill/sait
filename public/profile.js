// Импорт модулей Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

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

const ordersContainer = document.getElementById("ordersContainer");
const logoutBtn = document.getElementById("logoutBtn");
const currentUserEmail = localStorage.getItem("currentUserEmail");

if (!currentUserEmail) {
    ordersContainer.innerHTML = "<p>Вы не вошли в аккаунт.</p>";
}

// Загрузка истории заказов из localStorage
async function loadOrdersHistory() {
    if (!currentUserEmail) return;

    try {
        const dbRef = ref(db, `users/${currentUserEmail.replace(/\./g,'_')}/orders`);
        const snapshot = await get(dbRef);

        ordersContainer.innerHTML = '';

        if (!snapshot.exists()) {
            ordersContainer.innerHTML = "<p>Нет выполненных заказов</p>";
            return;
        }

        const orders = snapshot.val();
        Object.keys(orders).forEach(orderId => {
            const order = orders[orderId];
            const div = document.createElement('div');
            div.className = "border p-2 rounded bg-white mb-2";

            let itemsHtml = '';
            order.items.forEach(item => {
                itemsHtml += `<div>${item.name} - ${item.quantity} шт., ${item.price} ₽/шт</div>`;
            });

            div.innerHTML = `
                <div class="font-semibold">Заказ от ${order.date}</div>
                <div>${itemsHtml}</div>
            `;
            ordersContainer.appendChild(div);
        });

    } catch (error) {
        console.error(error);
        ordersContainer.innerHTML = "<p>Ошибка при загрузке истории заказов</p>";
    }
}

// Выход
logoutBtn.addEventListener("click", () => {
    if (confirm("Выйти из профиля?")) {
        localStorage.removeItem("currentUserEmail"); // удаление данных авторизации
        alert("Вы вышли из профиля.");
        window.location.href = "authorization.html";
    }
});

// Первый рендер
loadOrdersHistory();
