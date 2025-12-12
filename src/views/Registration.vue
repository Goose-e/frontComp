<template>
  <div class="registration-container">
    <div class="registration-card">

      <div class="logo-icon">
        <img src="../../logoicon_ready.png" alt="Logo-icon" height="60" />
      </div>

      <h1 class="title">Регистрация</h1>

      <div class="form">
        <input
            v-model="newUser.name"
            type="text"
            placeholder="Логин"
            class="form-input"
        />
        <p v-if="errorUsername" class="error-message">{{ errorUsername }}</p>

        <input
            v-model="newUser.email"
            type="email"
            placeholder="Email"
            class="form-input"
        />
        <p v-if="errorEmail" class="error-message">{{ errorEmail }}</p>

        <input
            v-model="newUser.password"
            type="password"
            placeholder="Пароль (мин. 8 символов)"
            class="form-input"
        />
        <p v-if="passwordError" class="error-message">{{ passwordError }}</p>

        <button
            :disabled="loading || !!passwordError"
            @click="addUser"
            class="submit-button"
        >
          <span v-if="!loading">Зарегистрироваться</span>
          <span v-else>Загрузка...</span>
        </button>
      </div>

      <p>
        <router-link :to="{ name : 'authorization'}" class="login-link">
          Уже есть аккаунт? Войти
        </router-link>
      </p>

      <p>
        <router-link :to="{ name : 'main'}" class="login-link">
          На главную
        </router-link>
      </p>

    </div>
  </div>
</template>








<script setup>
import { reactive, ref, computed } from "vue";
import api from "../api/http.js";
import { useRouter } from "vue-router";

const router = useRouter();

const newUser = reactive({
  name: "",
  email: "",
  password: "",
});

const loading = ref(false);
const errorUsername = ref("");
const errorEmail = ref("");
const answer = ref(null);

// ——— Проверка email ———
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ——— Ошибка пароля в реальном времени ———
const passwordError = computed(() => {
  if (!newUser.password) return "";
  if (newUser.password.length < 8)
    return "Пароль должен содержать минимум 8 символов.";
  return "";
});

// ——— Регистрация пользователя по API документа ———
const addUser = async () => {
  errorUsername.value = "";
  errorEmail.value = "";

  if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
    errorEmail.value = "Все поля обязательны.";
    return;
  }

  if (!isValidEmail(newUser.email)) {
    errorEmail.value = "Некорректный email.";
    return;
  }

  if (passwordError.value) return;

  try {
    loading.value = true;

    const res = await api.post("auth/signup", {
      username: newUser.name,
      email: newUser.email,
      password: newUser.password,
    });

    const msg = res.data.message;

    if (msg === "Username is already taken") {
      errorUsername.value = "Имя пользователя занято.";
      return;
    }

    if (msg === "Email is already taken") {
      errorEmail.value = "Почта уже зарегистрирована.";
      return;
    }

    if (msg === "User registration failed") {
      errorEmail.value = "Ошибка регистрации. Попробуйте позже.";
      return;
    }

    // ——— успешно ———
    newUser.name = "";
    newUser.email = "";
    newUser.password = "";

    router.push({ name: "authorization" });
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    errorEmail.value = "Сервер недоступен.";
  } finally {
    loading.value = false;
  }
};
</script>






<style scoped>
.registration-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
}

.registration-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  padding: 3rem 2.5rem 2rem;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
}

.logo-icon {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
}

.title {
  margin-top: 2.5rem;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  color: #333;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-input {
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.25s;
}

.form-input:focus {
  border-color: #1976d2;
  box-shadow: 0 0 5px rgba(25, 118, 210, 0.4);
  outline: none;
}

.submit-button {
  padding: 0.8rem;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background 0.3s;
}

.submit-button:hover:not(:disabled) {
  background: #1565c0;
}

.submit-button:disabled {
  background: #90caf9;
  cursor: not-allowed;
}

.login-link {
  margin-top: 1.3rem;
  display: block;
  color: #1976d2;
  text-decoration: none;
}

.login-link:hover {
  color: #0d47a1;
}

.error-message {
  color: #d32f2f;
  font-size: 0.85rem;
  text-align: left;
  padding-left: 2px;
  margin-top: -0.5rem;
}
</style>

