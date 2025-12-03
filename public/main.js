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

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Ссылки на Firebase
const socketsRef = ref(database, 'Sockets');
const switchesRef = ref(database, 'Switches');
const refrigeratorsRef = ref(database, 'Refrigerators');
const dishwashersRef = ref(database, 'Dishwashers');

// Корзина
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// SEO обновление мета-тегов при переключении радела 
function updateMetaTags(sectionId) {
    let newTitle = 'Магазин электро-техники «Дом электрики» — купить электротехнику и бытовую технику';
    let newDescription = 'Официальный интернет магазин электрики «Дом электрики». Купить электротехнику, розетки, выключатели, холодильники и посудомоечные машины с доставкой по Новосибирску.';

    switch(sectionId) {
        case 'SocketsSection':
            newTitle = 'Купить розетку — влагозащищенные, с крышкой, компьютерные | Дом электрики';
            newDescription = 'Купите розетку влагозащищенную с крышкой, компьютерную розетку и другие модели в магазине «Дом электрики». Доставка по Новосибирску.';
            break;
        case 'SwitcheSection':
            newTitle = 'Купить выключатель — 1, 2, 3 клавиши | Магазин «Дом электрики»';
            newDescription = 'Выключатель с 1, 2 или 3 клавишами — большой выбор в интернет-магазине электротехники «Дом электрики». Низкие цены, гарантия.';
            break;
        case 'RefrigeratorsSection':
            newTitle = 'Купить холодильник с морозильником | Бытовая техника «Дом электрики»';
            newDescription = 'Холодильник с морозильником — купить в Новосибирске по выгодной цене в магазине «Дом электрики». Официальная гарантия, доставка.';
            break;
        case 'DishwashersSection':
            newTitle = 'Посудомоечная машина купить | Интернет-магазин «Дом электрики»';
            newDescription = 'Посудомоечная машина купить в Новосибирске — большой выбор моделей в магазине «Дом электрики». Рассрочка, доставка, установка.';
            break;
        case 'EIQSection':
            newTitle = 'Электро-установочная техника — розетки и выключатели | Дом электрики';
            newDescription = 'Магазин электрики «Дом электрики» предлагает электро-установочную технику: розетки, выключатели, рамки, механизмы. Надежно и недорого.';
            break;
        case 'BTSection':
            newTitle = 'Бытовая техника — холодильники, посудомойки | Дом электрики';
            newDescription = 'Купить бытовую технику в Новосибирске: холодильники, посудомоечные машины и другое. Интернет-магазин «Дом электрики».';
            break;
        default:
            // Главная
            newTitle = 'Магазин электро-техники «Дом электрики» — купить электротехнику и бытовую технику';
            newDescription = 'Официальный интернет магазин электрики «Дом электрики». Купить электротехнику, розетки, выключатели, холодильники и посудомоечные машины с доставкой по Новосибирску.';
    }

    document.title = newTitle;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', newDescription);
}

// Функция переключения секций
window.toggleSection = async function(sectionId) {
  const allSections = ['EIQSection','BTSection','SocketsSection','SwitcheSection','RefrigeratorsSection','DishwashersSection'];
  allSections.forEach(s => document.getElementById(s)?.classList.add('hidden'));
  const selected = document.getElementById(sectionId);
  if(selected) selected.classList.remove('hidden');

  // === ЧПУ: обновление URL без перезагрузки ===
  const urlMap = {
    'EIQSection': '/category/elektro-ustanovochnaya',
    'BTSection': '/category/bytovaya-tehnika',
    'SocketsSection': '/category/rozetki',
    'SwitcheSection': '/category/vyklyuchateli',
    'RefrigeratorsSection': '/category/holodilniki',
    'DishwashersSection': '/category/posudomoechnye-mashiny'
  };
  const newUrl = urlMap[sectionId] || '/'; 
  window.history.pushState({ section: sectionId }, '', newUrl);

  updateMetaTags(sectionId); //SEO-функция

  switch(sectionId) {
    case 'SocketsSection': await loadProducts(socketsRef, 'SocketsTableContainer', 'sockets'); break;
    case 'SwitcheSection': await loadProducts(switchesRef, 'SwitchesTableContainer', 'switches'); break;
    case 'RefrigeratorsSection': await loadProducts(refrigeratorsRef, 'RefrigeratorsTableContainer', 'refrigerators'); break;
    case 'DishwashersSection': await loadProducts(dishwashersRef, 'DishwashersTableContainer', 'dishwashers'); break;
  }
};

// Универсальная функция загрузки товаров
async function loadProducts(refCategory, containerId, type) {
    try {
        const snapshot = await get(refCategory);
        const container = document.getElementById(containerId);
        container.innerHTML = ''; // очистка контейнера

        snapshot.forEach((child, index) => {
            if(index === 0 || !child.val()) return; // пропуск null
            const product = child.val();

            // определение поля в зависимости от категории
            let nameField='', priceField='', idField='';
            switch(type) {
                case 'sockets': nameField='Name_sockets'; priceField='Price_socket'; idField='Id_sockets'; break;
                case 'switches': nameField='Name_switches'; priceField='Price_switches'; idField='Id_switches'; break;
                case 'refrigerators': nameField='Name_refrigerators'; priceField='Price_refrigerators'; idField='Id_refrigerators'; break;
                case 'dishwashers': nameField='Name_dishwashers'; priceField='Price_dishwashers'; idField='Id_dishwashers'; break;
            }

            const name = product[nameField] || "Без названия";
            const price = product[priceField] || "0";
            const stock = parseInt(product.InStock) || 0;
            const image = product.Image || "https://via.placeholder.com/150";
            
            // SEO alt-текст
            let altText = name;
            if (type === 'sockets') {
                altText = `Розетка ${name} купить в Новосибирске`;
            } else if (type === 'switches') {
                altText = `Выключатель ${name} — магазин Дом электрики`;
            } else if (type === 'refrigerators') {
                altText = `Холодильник ${name} с морозильником`;
            } else if (type === 'dishwashers') {
                altText = `Посудомоечная машина ${name} купить`;
            }

            // Глобально уникальный ID для корзины
            const uniqueId = `${type}-${child.key}`;

            const card = document.createElement('div');
            card.className = "bg-white border border-gray-200 rounded-lg shadow p-4 m-2 flex flex-col items-center text-center max-w-xs";

            card.innerHTML = `
                <img src="${image}" alt="${altText}" class="w-40 h-40 object-contain mb-2 rounded"/>
                <h3 class="text-lg font-semibold mb-2">${name}</h3>
                <p class="mb-2 text-red-700 font-bold">${price}</p>
                <p class="text-sm text-gray-500 mb-1">В наличии: ${stock}</p>
                <input type="number" min="1" max="${stock}" value="1" class="quantity border rounded p-1 w-20 mb-2"/>
                <button class="addToCart bg-red-700 text-white px-3 py-1 rounded hover:bg-rose-300 hover:text-red-950"> В корзину </button>
            `;

            // Обработчик кнопки "В корзину"
            card.querySelector('.addToCart').addEventListener('click', () => {
                const qtyInput = card.querySelector('.quantity');
                let qty = parseInt(qtyInput.value) || 1;

                if(qty > stock) {
                    showMessage(`Нельзя заказать больше, чем есть на складе (${stock})`);
                    qty = stock;
                    qtyInput.value = stock;
                }

                const numericPrice = parseInt(price.toString().replace(/\D/g, '')) || 0;

                addToCart({id: uniqueId, name, price: numericPrice, quantity: qty, stock, image});
            });

            container.appendChild(card);
        });
    } catch(error) {
        console.error("Ошибка при загрузке товаров:", error);
    }
}

// Функция добавления товара в корзину
function addToCart(item) {
    // проверка, есть ли товар с таким id в корзине
    const existing = cart.find(i => i.id === item.id);
    if(existing) {
        existing.quantity += item.quantity;
        if(existing.quantity > item.stock) existing.quantity = item.stock;
    } else {
        cart.push(item);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    showMessage(`${item.name} добавлен(а) в корзину`);
}

// Функция рендера корзины с картинками
function renderCart() {
    const cartContainer = document.getElementById("cartContainer");
    if(!cartContainer) return;

    cartContainer.innerHTML = '';

    if(cart.length === 0){
        cartContainer.innerHTML = "<p>Корзина пуста</p>";
        return;
    }

    cart.forEach(item => {
        const card = document.createElement('div');
        card.className = "flex items-center border-b py-2";

        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-contain mr-4"/>
            <div class="flex-1">
                <h4 class="font-semibold">${item.name}</h4>
                <p class="text-red-700 font-bold">${item.price} руб</p>
                <p>Количество: ${item.quantity}</p>
            </div>
        `;

        cartContainer.appendChild(card);
    });
}

window.addEventListener('popstate', function(event) {
  const path = window.location.pathname;
  const reverseMap = {
    '/category/rozetki': 'SocketsSection',
    '/category/vyklyuchateli': 'SwitcheSection',
    '/category/holodilniki': 'RefrigeratorsSection',
    '/category/posudomoechnye-mashiny': 'DishwashersSection',
    '/category/elektro-ustanovochnaya': 'EIQSection',
    '/category/bytovaya-tehnika': 'BTSection',
    '/': 'main'
  };
  const sectionId = reverseMap[path] || 'main';
  if (sectionId !== 'main') {
    // Восстанавление состояния без повторной загрузки товаров 
    toggleSection(sectionId);
  } else {
    
    ['EIQSection','BTSection','SocketsSection','SwitcheSection','RefrigeratorsSection','DishwashersSection']
      .forEach(id => document.getElementById(id)?.classList.add('hidden'));
  }
});

// Рендер корзину при загрузке страницы
renderCart();
