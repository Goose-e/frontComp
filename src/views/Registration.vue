<template>
  <div class="registration-container">
    <div class="orb"></div>
    <div class="orb second"></div>

    <div class="registration-card">
      <div class="logo-icon">
        <img src="../../logoicon_ready.png" alt="Logo-icon" height="60" />
      </div>

      <p class="eyebrow">Создайте аккаунт</p>
      <h1 class="title">Присоединяйтесь к платформе</h1>
      <p class="muted">Следите за компаниями, формируйте отчёты и управляйте пользователями.</p>

      <div class="form">
        <div class="input-control">
          <label>Логин</label>
          <input
              v-model="newUser.name"
              type="text"
              placeholder="Введите логин"
              class="form-input"
          />
          <p v-if="errorUsername" class="error-message">{{ errorUsername }}</p>
        </div>

        <div class="input-control">
          <label>Email</label>
          <input
              v-model="newUser.email"
              type="email"
              placeholder="you@example.com"
              class="form-input"
          />
          <p v-if="errorEmail" class="error-message">{{ errorEmail }}</p>
        </div>

        <div class="input-control">
          <label>Пароль</label>
          <input
              v-model="newUser.password"
              type="password"
              placeholder="Минимум 8 символов"
              class="form-input"
          />
          <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
        </div>

        <button
            :disabled="loading || !!passwordError"
            @click="addUser"
            class="submit-button"
        >
          <span v-if="!loading">Зарегистрироваться</span>
          <span v-else>Загрузка...</span>
        </button>
      </div>

      <div class="links">
        <router-link :to="{ name : 'authorization'}" class="login-link">
          Уже есть аккаунт? Войти
        </router-link>

        <router-link :to="{ name : 'main'}" class="login-link">
          На главную
        </router-link>
      </div>

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
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 16px 48px;
  position: relative;
  overflow: hidden;
}

.orb {
  position: absolute;
  width: 560px;
  height: 560px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.3), transparent 55%);
  filter: blur(28px);
  top: -160px;
  left: -140px;
  z-index: 0;
}

.orb.second {
  bottom: -200px;
  right: -160px;
  left: auto;
  top: auto;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.35), transparent 55%);
}

.registration-card {
  width: 100%;
  max-width: 520px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 22px;
  padding: 34px 30px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(18px);
  position: relative;
  z-index: 1;
}

.logo-icon {
  position: absolute;
  top: -32px;
  left: 26px;
  background: rgba(255, 255, 255, 0.08);
  padding: 12px;
  border-radius: 14px;
}

.eyebrow { text-transform: uppercase; letter-spacing: 0.08em; color: #9fb3d4; margin: 0; }
.muted { color: #cdd6e3; margin: 6px 0 16px; }
.title { margin: 8px 0; }

.form { display: grid; gap: 14px; margin-top: 12px; }
.input-control { display: flex; flex-direction: column; gap: 6px; }
.input-control label { color: #cdd6e3; font-size: 0.95rem; }

.form-input {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  transition: 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.6);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.submit-button {
  padding: 12px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: var(--text);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  transition: transform 0.25s;
  box-shadow: 0 15px 34px rgba(37, 99, 235, 0.35);
}

.submit-button:hover:not(:disabled) { transform: translateY(-1px); }

.submit-button:disabled {
  background: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
}

.links {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
}

.login-link {
  color: #bfdbfe;
  text-decoration: none;
  font-weight: 600;
}

.login-link:hover { color: #e0f2fe; }

.error-message {
  color: #fca5a5;
  font-size: 0.9rem;
}
</style>

