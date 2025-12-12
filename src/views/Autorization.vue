<template>
  <div class="login-container">
    <div class="glow"></div>
    <div class="glow second"></div>
    <div class="login-card">

      <p class="eyebrow">Добро пожаловать</p>
      <h1>Вход в аккаунт</h1>
      <p class="muted">Продолжайте работу и управляйте компаниями без ограничений.</p>

      <div class="input-group">
        <label>Логин или email</label>
        <input
          v-model="newUser.login"
          type="text"
          placeholder="Email или логин"
        />
      </div>
      <div class="input-group">
        <label>Пароль</label>
        <input
          v-model="newUser.password"
          type="password"
          placeholder="Пароль"
        />
      </div>

      <button @click="authUser" class="primary">Войти</button>

      <div class="links">
        <router-link :to="{ name: 'registration' }" class="link">
          Нет аккаунта? Регистрация
        </router-link>
        <router-link :to="{ name: 'main' }" class="link">
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

//объявление переменных и функций
const router = useRouter();

let refreshTimer = null;

const newUser = reactive({
  login: "",
  password: "",
});

const answer = ref([]);

async function refreshAccessToken() {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    const response = await api.post("oauth2/token", {
      refreshToken: refreshToken,
    });

    const newAccessToken = response.data.responseEntity.accessToken;
    const newRefreshToken = response.data.responseEntity.refreshToken;

    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    console.log("Access и refresh token обновлён");
  } catch (error) {
    console.error("Не удалось обновить токен:", error);

  }
}

const authUser = async () => {

  if (!newUser.login.trim() || !newUser.password.trim()) {
    alert("Все поля обязательны для заполнения.");
    return;
  }

  try {
    const res = await api.post("auth/login", {
      usernameOrEmail: newUser.login,
      password: newUser.password,
    });

    answer.value = res.data;

    if (answer.value.message === "User not found") {
      alert("Пользователь не найден");
      newUser.login = "";
      newUser.password = "";
      return;
    }

    if (answer.value.message === "Incorrect password") {
      alert("Неверный пароль");
      newUser.password = "";
      return;
    }

    //Запоминание токенов
    if (answer.value.responseEntity) {
      localStorage.setItem(
        "accessToken",
        answer.value.responseEntity.accessToken
      );
      localStorage.setItem(
        "refreshToken",
        answer.value.responseEntity.refreshToken
      );

      //Настройка роутера
      if (!refreshTimer) {
        refreshTimer = setInterval(refreshAccessToken, 55*60*1000);
        localStorage.setItem("refreshTimer", refreshTimer);
      }

      await router.push("/");
    } else {
    }
  } catch (err) {
    console.error("Ошибка при входе:", err);
  }
};
</script>






<style scoped>
.login-container {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 16px;
  position: relative;
  overflow: hidden;
}

.glow {
  position: absolute;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.35), transparent 60%);
  filter: blur(20px);
  top: -80px;
  left: -120px;
  z-index: 0;
}

.glow.second {
  right: -120px;
  left: auto;
  top: auto;
  bottom: -140px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.3), transparent 60%);
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
  padding: 32px 28px;
  position: relative;
  backdrop-filter: blur(16px);
  z-index: 1;
  text-align: left;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
  color: #9fb3d4;
  margin: 0;
}

h1 { margin: 6px 0 6px; }
.muted { color: #cdd6e3; margin-bottom: 20px; }

.input-group { margin-bottom: 14px; display: flex; flex-direction: column; gap: 6px; }
.input-group label { color: #cdd6e3; font-size: 0.95rem; }

input {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  transition: 0.2s;
}

input:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.6);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.primary {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: var(--text);
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.35);
  transition: transform 0.2s;
  margin-top: 6px;
}

.primary:hover { transform: translateY(-1px); }

.links {
  margin-top: 18px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.link {
  color: #bfdbfe;
  text-decoration: none;
  font-weight: 600;
}

.link:hover { color: #e0f2fe; }

.error-message {
  color: #fca5a5;
  font-size: 0.9rem;
}
</style>
