<template>
  <div class="header">
    <router-link :to="{ name: 'main' }">На главную</router-link>
    <router-link :to="{ name: 'UserCompanies' }">
      Компании пользователя
    </router-link>
  </div>

  <div class="welcome">
    <p v-if="userInfo">Привет, <b>{{ userInfo.username }}</b>!</p>
    <p v-if="userInfo">Почта: {{ userInfo.email }}</p>
  </div>

  <div class="user-change">
    <h2>Изменить данные профиля</h2>

    <input
        v-model="editUserForm.newUsername"
        type="text"
        placeholder="Новое имя (необязательно)"
        class="form-input"
    />
    <p v-if="errorUsername" class="error">{{ errorUsername }}</p>

    <input
        v-model="editUserForm.newEmail"
        type="email"
        placeholder="Новый Email (необязательно)"
        class="form-input"
    />
    <p v-if="errorEmail" class="error">{{ errorEmail }}</p>

    <button
        :disabled="loading"
        @click="editUser"
    >
      <span v-if="!loading">Сохранить изменения</span>
      <span v-else>Сохранение...</span>
    </button>

    <button class="secondary" @click="resetForm">Сбросить</button>
  </div>
</template>


<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../api/http.js";
import { useRouter } from "vue-router";

const router = useRouter();

const userInfo = ref(null);

const editUserForm = reactive({
  newUsername: "",
  newEmail: "",
});

const errorUsername = ref("");
const errorEmail = ref("");
const loading = ref(false);

const isValidEmail = (email) => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const resetForm = () => {
  editUserForm.newUsername = "";
  editUserForm.newEmail = "";
  errorUsername.value = "";
  errorEmail.value = "";
};

const editUser = async () => {
  errorUsername.value = "";
  errorEmail.value = "";

  if (!isValidEmail(editUserForm.newEmail)) {
    errorEmail.value = "Введите корректный email.";
    return;
  }

  const body = {
    newUsername: editUserForm.newUsername || null,
    newEmail: editUserForm.newEmail || null,
  };

  try {
    loading.value = true;

    const response = await api.patch("user/edit", body);
    const msg = response.data.message;

    if (msg === "Username is already taken.") {
      errorUsername.value = "Имя пользователя занято.";
      return;
    }

    if (msg === "Email is already taken.") {
      errorEmail.value = "Email уже используется.";
      return;
    }

    resetForm();
    getUser();
  } catch (err) {
    console.error("Ошибка при редактировании:", err);
  } finally {
    loading.value = false;
  }
};

const getUser = async () => {
  try {
    const response = await api.get("user/get_by_code");
    userInfo.value = response.data.responseEntity;
  } catch (err) {
    console.error("Ошибка получения данных пользователя", err);
  }
};

onMounted(() => {
  if (!localStorage.getItem("accessToken")) {
    router.push("/");
    return;
  }
  getUser();
});
</script>



<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: #1976d2;
  color: white;
}

.header a {
  color: white;
  text-decoration: none;
  font-weight: bold;
  transition: 0.3s;
}

.header a:hover {
  color: #bbdefb;
}

.welcome {
  padding: 2rem;
  background: #e3f2fd;
  text-align: center;
  font-size: 1.2rem;
}

.user-change {
  max-width: 450px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.user-change h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-input {
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

button {
  width: 100%;
  padding: 0.8rem;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
  font-weight: bold;
  margin-top: 1rem;
}

button:hover:not(:disabled) {
  background: #1565c0;
}

button:disabled {
  background: #90caf9;
  cursor: not-allowed;
}

.secondary {
  background: #e0e0e0;
  color: #333;
}

.secondary:hover {
  background: #d5d5d5;
}

.error {
  color: #d32f2f;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  padding-left: 3px;
}
</style>


