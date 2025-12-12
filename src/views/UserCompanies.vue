<template>
  <div class="page-shell">
    <header class="top-bar">
      <div class="title">
        <p class="eyebrow">Ваше пространство</p>
        <h1>Компании пользователя</h1>
      </div>
      <div class="links">
        <router-link :to="{ name: 'main' }" class="pill">Главная</router-link>
        <router-link :to="{ name: 'profil' }" class="pill">Профиль</router-link>
      </div>
    </header>

    <div class="page">

      <div class="grid">
        <!-- Форма создания компании -->
        <div class="create-card glass">
          <p class="eyebrow">Новая компания</p>
          <h2>Создать карточку</h2>

          <div class="form">
            <div>
              <label>Название *</label>
              <input
                  v-model="newCompany.companyName"
                  type="text"
                  placeholder="Название компании"
              />
              <p v-if="errorName" class="error">{{ errorName }}</p>
            </div>

            <div>
              <label>Отрасль</label>
              <input
                  v-model="newCompany.industryName"
                  type="text"
                  placeholder="Например, IT или Ритейл"
              />
            </div>

            <div>
              <label>Сайт</label>
              <input
                  v-model="newCompany.website"
                  type="text"
                  placeholder="https://example.com"
              />
              <p v-if="errorWebsite" class="error">{{ errorWebsite }}</p>
            </div>

            <button :disabled="loading" @click="addCompany" class="primary">
              <span v-if="!loading">Добавить</span>
              <span v-else>Загрузка...</span>
            </button>
            <p v-if="statusMessage" class="info">{{ statusMessage }}</p>
          </div>
        </div>

        <!-- Компании пользователя -->
        <div class="companies-block glass">
          <div class="block-head">
            <div>
              <p class="eyebrow">Список</p>
              <h2>Ваши компании</h2>
            </div>
            <span class="pill" v-if="allUserCompanies.length">{{ allUserCompanies.length }} шт.</span>
          </div>

          <div class="companies-grid">
            <div
                v-for="company in allUserCompanies"
                :key="company.companyCode"
                class="company-card"
                @click="toCompanyPage(company.companyCode)"
            >
              <div>
                <h3>{{ company.companyName }}</h3>
                <small>{{ company.companyCode }}</small>
              </div>

              <button class="ghost">Открыть</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>




<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/http.js";

const router = useRouter();
const allUserCompanies = ref([]);
const loading = ref(false);
const statusMessage = ref("");
let refreshTimer = null;

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
    statusMessage.value = "";

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

    statusMessage.value = "Компания создается. Пожалуйста, подождите обновления списка.";
    await getAllCompanies();
    statusMessage.value = "Компания добавлена. Список обновлен.";
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
    const raw = res.data.responseEntity?.allCompanies ?? [];
    allUserCompanies.value = Array.isArray(raw) ? raw : Object.values(raw);
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

  refreshTimer = setInterval(getAllCompanies, 15000);
});

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>





<style scoped>
.page-shell { max-width: 1100px; margin: 0 auto; padding: 32px 20px 64px; color: var(--text); }

.top-bar { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
.title h1 { margin: 6px 0 0; }
.eyebrow { text-transform: uppercase; letter-spacing: 0.08em; color: #9fb3d4; margin: 0; }

.links { display: flex; gap: 10px; }
.pill { padding: 10px 14px; border-radius: 999px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.1); color: var(--text); text-decoration: none; font-weight: 600; }
.pill:hover { border-color: rgba(255, 255, 255, 0.2); }

.page { margin-top: 12px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; }

.glass {
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(14px);
}

.form { display: grid; gap: 12px; margin-top: 12px; }
label { color: #cdd6e3; font-size: 0.95rem; }

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

.primary,
.ghost {
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-weight: 700;
  cursor: pointer;
  color: var(--text);
  transition: 0.2s;
}

.primary { background: linear-gradient(135deg, #2563eb, #7c3aed); box-shadow: 0 12px 32px rgba(37, 99, 235, 0.3); }
.ghost { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.1); }
.primary:hover { transform: translateY(-1px); }
.ghost:hover { border-color: rgba(255, 255, 255, 0.2); }

.error { color: #fca5a5; font-size: 0.9rem; }
.info { color: #9fb3d4; font-size: 0.9rem; margin: 2px 0 0; }

.companies-block { margin-top: 8px; }
.block-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.companies-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }

.company-card {
  padding: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: 0.2s;
}

.company-card:hover { transform: translateY(-3px); border-color: rgba(37, 99, 235, 0.4); }

small { color: #9fb3d4; }

@media (max-width: 640px) {
  .links { width: 100%; justify-content: flex-start; }
}
</style>


