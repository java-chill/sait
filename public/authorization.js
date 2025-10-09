// Импорт модулей Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

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

// Авторизация
document.getElementById('loginButton').addEventListener('click', async () => {
  const email = document.getElementById('login_email').value.trim();
  const password = document.getElementById('login_password').value.trim();

  if (!email || !password) {
    alert('Введите e-mail и пароль');
    return;
  }

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `users/${email.replace(/\./g,'_')}`));
    
    if (!snapshot.exists()) {
      alert('Пользователь не найден');
      return;
    }

    const data = snapshot.val();
    if (data.password !== password) {
      alert('Неверный пароль');
      return;
    }

    alert(`Добро пожаловать, ${data.name}!`);
    document.getElementById('loginForm').reset();
    
    // сохранение email пользователя для других страниц
    localStorage.setItem("currentUserEmail", JSON.stringify
    ({
      email: email,
      name: data.name
    }));

    // Переход в профиль
    window.location.href = "profile.html";

  } catch (error) {
    console.error(error);
    alert("Ошибка авторизации, попробуйте ещё раз");
  }
});