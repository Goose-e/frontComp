<template>
  <div class="profile">
    <header class="page-header">
      <router-link :to="{ name: 'main' }" class="pill">← На главную</router-link>
      <router-link :to="{ name: 'UserCompanies' }" class="pill">Компании пользователя</router-link>
    </header>

    <section class="welcome">
      <div class="avatar">{{ userInitials }}</div>
      <div>
        <p class="eyebrow">Аккаунт</p>
        <h1 v-if="userInfo">{{ userInfo.username }}</h1>
        <p v-if="userInfo" class="muted">{{ userInfo.email }}</p>
      </div>
    </section>

    <div class="card">
      <div class="card-header">
        <div>
          <p class="eyebrow">Настройки</p>
          <h2>Изменить данные профиля</h2>
        </div>
        <span class="tag">Безопасность</span>
      </div>

      <div class="form-grid">
        <div>
          <label>Новое имя</label>
          <input
              v-model="editUserForm.newUsername"
              type="text"
              placeholder="Новое имя (необязательно)"
              class="form-input"
          />
          <p v-if="errorUsername" class="error">{{ errorUsername }}</p>
        </div>

        <div>
          <label>Новый email</label>
          <input
              v-model="editUserForm.newEmail"
              type="email"
              placeholder="Новый Email (необязательно)"
              class="form-input"
          />
          <p v-if="errorEmail" class="error">{{ errorEmail }}</p>
        </div>
      </div>

      <div class="actions">
        <button :disabled="loading" @click="editUser" class="primary">
          <span v-if="!loading">Сохранить изменения</span>
          <span v-else>Сохранение...</span>
        </button>

        <button class="ghost" @click="resetForm">Сбросить</button>


      </div>


    </div>

  </div>
  <button class="btn-class-name">
    <span class="back"></span>
    <span class="front"></span>
  </button>
</template>


<script setup>
import { ref, reactive, onMounted, computed } from "vue";
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
const userInitials = computed(() => {
  if (!userInfo.value?.username) return "";
  return userInfo.value.username
      .split(" ")
      .map((w) => w[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
});

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
.profile {
  max-width: 900px;
  margin: 0 auto;
  padding: 36px 20px 64px;
  color: var(--text);
}

.page-header {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.pill {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-decoration: none;
  color: var(--text);
  font-weight: 600;
}

.pill:hover { border-color: rgba(255, 255, 255, 0.2); }

.welcome {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.3);
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  display: grid;
  place-items: center;
  font-weight: 800;
  color: white;
  font-size: 1.2rem;
}
/* From Uiverse.io by catraco */
.btn-class-name {
  position: fixed;
  left: 50%;
  bottom: 0px;
  transform: translateX(-50%);
  z-index: 1000;
  --primary: 255, 90, 120;
  --secondary: 150, 50, 60;
  width: 60px;
  height: 50px;
  border: none;
  outline: none;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  outline: 10px solid rgb(var(--primary), .5);
  border-radius: 100%;
  position: relative;
  transition: .3s;
}

.btn-class-name .back {
  background: rgb(var(--secondary));
  border-radius: 100%;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.btn-class-name .front {
  background: linear-gradient(0deg, rgba(var(--primary), .6) 20%, rgba(var(--primary)) 50%);
  box-shadow: 0 .5em 1em -0.2em rgba(var(--secondary), .5);
  border-radius: 100%;
  position: absolute;
  border: 1px solid rgb(var(--secondary));
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 600;
  font-family: inherit;
  transform: translateY(-15%);
  transition: .15s;
  color: rgb(var(--secondary));
}

.btn-class-name:active .front {
  transform: translateY(0%);
  box-shadow: 0 0;
}
.eyebrow { text-transform: uppercase; letter-spacing: 0.08em; color: #9fb3d4; margin: 0; }
.muted { color: #cdd6e3; margin: 6px 0 0; }

.card {
  margin-top: 18px;
  padding: 20px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.28);
}

.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-header h2 { margin: 6px 0 0; }

.tag {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

label { color: #cdd6e3; font-size: 0.95rem; }

.form-input {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  margin-top: 6px;
  transition: 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.6);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.actions { margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap; }

.primary, .ghost {
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  color: var(--text);
  transition: 0.2s;
}

.primary {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  box-shadow: 0 12px 32px rgba(37, 99, 235, 0.3);
}

.ghost {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.primary:hover { transform: translateY(-1px); }
.ghost:hover { border-color: rgba(255, 255, 255, 0.2); }

.error {
  color: #fca5a5;
  font-size: 0.9rem;
  margin-top: 4px;
}
</style>


