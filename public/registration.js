// Импорт модулей Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyArJFBHmuAYnZx0RMZdEzYbvSRDjDhST6Q",
  authDomain: "aquarelle-hotel.firebaseapp.com",
  databaseURL: "https://aquarelle-hotel-default-rtdb.firebaseio.com",
  projectId: "aquarelle-hotel",
  storageBucket: "aquarelle-hotel.appspot.com",
  messagingSenderId: "510262265779",
  appId: "1:510262265779:web:2714a5532d9f864dc4adc6",
  measurementId: "G-CF9D18E1J4"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Регистрация
document.getElementById('registerButton').addEventListener('click', async () => {
  const surname = document.getElementById('reg_surname').value.trim();
  const name = document.getElementById('reg_name').value.trim();
  const patronymic = document.getElementById('reg_patronymic').value.trim();
  const birth = document.getElementById('reg_birth').value;
  const email = document.getElementById('reg_email').value.trim();
  const password = document.getElementById('reg_password').value.trim();

  if (!surname || !name || !patronymic || !birth || !email || !password) {
    showMessage('Заполните все поля!');
    return;
  }

  const birthDate = new Date(birth);
  const age = new Date().getFullYear() - birthDate.getFullYear();
  if (age < 18) {
    showMessage('Регистрация доступна только с 18 лет');
    return;
  }

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `users/${email.replace(/\./g,'_')}`));
    
    if (snapshot.exists()) {
      showMessage('Пользователь с таким e-mail уже зарегистрирован');
      return;
    }

    await set(ref(db, 'users/' + email.replace(/\./g,'_')), {
      surname, name, patronymic, birth, email, password
    });

    showMessage('Регистрация прошла успешно!');
    document.getElementById('registerForm').reset();

  } catch (error) {
    console.error("Ошибка регистрации:", error);
    showMessage("Произошла ошибка при регистрации");
  }
});
