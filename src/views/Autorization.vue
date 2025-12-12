<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-icon">
        <img src="../../logoicon_ready.png" alt="Logo-icon" height="60px" />
      </div>

      <h1>Вход</h1>
      <div class="input-group">
        <input
          v-model="newUser.login"
          type="text"
          placeholder="Email или логин"
        />
      </div>
      <div class="input-group">
        <input
          v-model="newUser.password"
          type="password"
          placeholder="Пароль"
        />
      </div>

      <button @click="authUser">Войти</button>

      <p>
        <router-link :to="{ name: 'registration' }" class="register-link">
          Нет аккаунта? Регистрация
        </router-link>
      </p>

      <p>
        <router-link :to="{ name: 'main' }" class="register-link">
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
  height: 100vh; /* или 100% при нужной структуре */
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(145deg, #e3f2fd, #bbdefb); /* или нужный фон */
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #000000; /* подставь нужный фон */
}

/* Убедимся, что #app занимает всю высоту */
#app {
  height: 100%;
}

.login-card {
  width: 100%;
  position: relative;
  max-width: 400px;
  background-color: #ffffff;
  padding: 5% 4% 3% 4%;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login-card h1 {
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.8rem;
}

.input-group {
  margin-bottom: 1.2rem;
}

input {
  width: 93%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
}

button {
  width: 100%;
  padding: 0.8rem;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background-color: #1565c0;
}

.register-link {
  display: block;
  margin-top: 1.5rem;
  color: #1976d2;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s;
}

.register-link:hover {
  color: #0d47a1;
}

.logo-icon {
  position: absolute;
  top: 5%;
  right: 39%;
}

.error-message {
  color: red;
  font-size: 0.85rem;
  text-align: left;
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
  padding-left: 0.3rem;
}
</style>
