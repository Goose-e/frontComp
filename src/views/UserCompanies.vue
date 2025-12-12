<template>
  <div class="top-bar">
    <router-link :to="{ name: 'profil' }" class="nav-btn">Профиль</router-link>
    <router-link :to="{ name: 'main' }" class="nav-btn">Главная</router-link>
  </div>

  <div class="page">

    <!-- Форма создания компании -->
    <div class="create-card">
      <h1>Создать компанию</h1>

      <div class="form">
        <input
            v-model="newCompany.companyName"
            type="text"
            placeholder="Название компании *"
        />
        <p v-if="errorName" class="error">{{ errorName }}</p>

        <input
            v-model="newCompany.industryName"
            type="text"
            placeholder="Отрасль (необязательно)"
        />

        <input
            v-model="newCompany.website"
            type="text"
            placeholder="Сайт (необязательно)"
        />
        <p v-if="errorWebsite" class="error">{{ errorWebsite }}</p>

        <button :disabled="loading" @click="addCompany">
          <span v-if="!loading">Добавить</span>
          <span v-else>Загрузка...</span>
        </button>
      </div>
    </div>

    <!-- Компании пользователя -->
    <div class="companies-block">
      <h2>Ваши компании</h2>

      <div class="companies-grid">
        <div
            v-for="company in allUserCompanies"
            :key="company.companyCode"
            class="company-card"
            @click="toCompanyPage(company.companyCode)"
        >
          <h3>{{ company.companyName }}</h3>
          <small>{{ company.companyCode }}</small>

          <button class="open-btn">Открыть</button>
        </div>
      </div>
    </div>

  </div>
</template>




<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/http.js";

const router = useRouter();
const allUserCompanies = ref([]);
const loading = ref(false);

// ошибки
const errorName = ref("");
const errorWebsite = ref("");

const newCompany = reactive({
  companyName: "",
  industryName: "",
  website: "",
});

const isValidUrl = (url) => {
  if (!url) return true;
  return /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6})(\/.*)?$/i.test(url);
};

const addCompany = async () => {
  errorName.value = "";
  errorWebsite.value = "";

  if (!newCompany.companyName.trim()) {
    errorName.value = "Название компании обязательно.";
    return;
  }

  if (!isValidUrl(newCompany.website)) {
    errorWebsite.value = "Введите корректный сайт.";
    return;
  }

  try {
    loading.value = true;

    const body = {
      companyName: newCompany.companyName,
      industryName: newCompany.industryName || null,
      website: newCompany.website || null,
    };

    const res = await api.post("company/create", body);

    const msg = res.data.message;
    if (msg === "Company name already exist") {
      errorName.value = "Компания с таким названием уже существует.";
      return;
    }

    // Успех
    newCompany.companyName = "";
    newCompany.industryName = "";
    newCompany.website = "";

    getAllCompanies();
  } catch (err) {
    console.error("Ошибка:", err);
    errorName.value = "Произошла ошибка. Попробуйте снова.";
  } finally {
    loading.value = false;
  }
};

const getAllCompanies = async () => {
  try {
    const res = await api.get("company/get_all_for_user");
    allUserCompanies.value = res.data.responseEntity.allCompanies;
  } catch (err) {
    console.error("Ошибка получения компаний:", err);
  }
};

const toCompanyPage = (code) => {
  router.push({ name: "UserCompany", params: { code } });
};

onMounted(() => {
  if (!localStorage.getItem("accessToken")) router.push("/");
  getAllCompanies();
});
</script>





<style scoped>
/* Верхняя панель */
.top-bar {
  display: flex;
  justify-content: flex-start;
  background: #1976d2;
  padding: 0.8rem 1.5rem;
  gap: 1rem;
}

.nav-btn {
  color: white;
  font-weight: 600;
  text-decoration: none;
  transition: 0.3s;
}
.nav-btn:hover {
  color: #bbdefb;
}

/* Основная страница */
.page {
  padding: 2rem;
  max-width: 1200px;
  margin: auto;
}

/* Блок создания компании */
.create-card {
  background: white;
  padding: 2rem;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  max-width: 420px;
  margin: 0 auto 2rem auto;
  text-align: center;
}

.create-card h1 {
  margin-bottom: 1.5rem;
}

.form input {
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #cfd8dc;
  margin-bottom: 0.5rem;
  transition: 0.2s;
}
.form input:focus {
  border-color: #1976d2;
  box-shadow: 0 0 6px rgba(25,118,210,0.4);
}

.form button {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.8rem;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  transition: 0.25s;
  cursor: pointer;
}
.form button:hover:not(:disabled) {
  background: #1565c0;
}
.form button:disabled {
  background: #90caf9;
  cursor: not-allowed;
}

.error {
  color: #d32f2f;
  font-size: 0.85rem;
  text-align: left;
}

/* Список компаний */
.companies-block h2 {
  margin-bottom: 1rem;
  text-align: center;
}

.companies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(260px,1fr));
  gap: 1rem;
}

.company-card {
  background: white;
  padding: 1.3rem;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: 0.25s;
  text-align: center;
}
.company-card:hover {
  transform: scale(1.03);
}

.company-card h3 {
  margin-bottom: 0.4rem;
}

.company-card small {
  color: #666;
}

.open-btn {
  margin-top: 0.8rem;
  padding: 0.5rem 1rem;
  background: #64b5f6;
  color: white;
  border: none;
  border-radius: 6px;
  transition: 0.2s;
}
.open-btn:hover {
  background: #42a5f5;
}
</style>


