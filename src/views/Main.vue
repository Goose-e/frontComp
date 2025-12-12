<template>
  <div class="page">
    <header class="topbar">
      <router-link :to="{ name: 'main' }" class="brand">Insight<span>Hub</span></router-link>

      <div class="nav-actions">
        <router-link
            v-if="!isAuthorized"
            :to="{ name: 'authorization' }"
            class="ghost-btn"
        >
          Войти
        </router-link>

        <div v-else class="authorized">
          <router-link :to="{ name: 'profil' }" class="ghost-btn">
            Профиль
          </router-link>
          <button class="ghost-btn" @click="openCreateForm">
            Создать компанию
          </button>
          <button class="ghost-btn danger" @click="exit">Выйти</button>
        </div>
      </div>
    </header>

    <section class="hero">
      <div class="hero-text">
        <p class="eyebrow">Аналитика и контроль</p>
        <h1>Находите компании и управляйте ими в одном месте</h1>
        <p class="subtitle">
          Быстрый поиск, навигация по отзывам и доступ ко всем вашим проектам через
          современный интерфейс.
        </p>
      </div>

      <div class="search-card">
        <div class="input-wrap">
          <input
              v-model="searchText"
              type="text"
              placeholder="Введите название или код компании…"
              @keyup.enter="searchCompany"
          />
          <button class="primary" @click="searchCompany">Поиск</button>
          <button v-if="searchText" class="secondary" @click="resetSearch">Сброс</button>
        </div>
        <p class="hint">Нажмите Enter или кнопку «Поиск», чтобы увидеть результаты.</p>
      </div>
    </section>

    <section class="content" v-if="!loading">
      <div class="section-head">
        <div>
          <p class="eyebrow">Каталог</p>
          <h2>Все компании</h2>
        </div>
        <span class="pill" v-if="allCompaniesGet.length">{{ allCompaniesGet.length }} найдено</span>
      </div>

      <p v-if="!allCompaniesGet.length" class="muted">Компаний нет</p>

      <div v-else class="cards">
        <article
            v-for="company in allCompaniesGet"
            :key="company.companyCode"
            class="company-card"
            @click="toCompanyPage(company.companyCode)"
        >
          <div>
            <h3>{{ company.companyName }}</h3>
            <p class="code">Код: {{ company.companyCode }}</p>
          </div>

          <a
              v-if="company.otzovikUrl !== 'не найдено'"
              :href="company.otzovikUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="link"
              @click.stop
          >
            Отзовик
          </a>
        </article>
      </div>
    </section>

    <div class="loader" v-else>
      <div class="spinner"></div>
      <p>Загружаем компании...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../api/http.js";
import { useRouter } from "vue-router";

const router = useRouter();

const allCompanies = ref([]);      // полный список
const allCompaniesGet = ref([]);   // отображаемый список
const loading = ref(false);

const isAuthorized = ref(false);
const searchText = ref("");

const checkAuthorization = () => {
  isAuthorized.value = !!localStorage.getItem("accessToken");
};

const getAllCompanies = async () => {
  try {
    loading.value = true;
    const response = await api.get("company/get_all");
    const companies = response.data.responseEntity.allCompanies || [];
    allCompanies.value = companies;
    allCompaniesGet.value = companies;
  } catch (err) {
    console.error("Ошибка при выводе всех компаний", err);
  } finally {
    loading.value = false;
  }
};

const exit = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  const refreshTimer = localStorage.getItem("refreshTimer");
  if (refreshTimer) clearInterval(refreshTimer);

  checkAuthorization();
};

const toCompanyPage = (code) => {
  router.push({ name: "UserCompany", params: { code } });
};

const searchCompany = () => {
  const query = searchText.value.trim().toLowerCase();

  if (!query) {
    allCompaniesGet.value = allCompanies.value;
    return;
  }

  const filtered = allCompanies.value.filter((c) => {
    return (
        c.companyName.toLowerCase().includes(query) ||
        c.companyCode.toLowerCase().includes(query)
    );
  });

  if (!filtered.length) {
    alert("Компаний не найдено");
  }

  allCompaniesGet.value = filtered;
};

const resetSearch = () => {
  searchText.value = "";
  allCompaniesGet.value = allCompanies.value;
};

const openCreateForm = () => {
  router.push({ name: "UserCompanies" });
};

onMounted(() => {
  checkAuthorization();
  getAllCompanies();
});
</script>
<style scoped>
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 80px;
  color: var(--text);
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-radius: 18px;
  background: linear-gradient(120deg, rgba(37, 99, 235, 0.15), rgba(168, 85, 247, 0.15));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(18px);
}

.brand {
  font-weight: 700;
  font-size: 1.4rem;
  letter-spacing: 0.02em;
  color: var(--text);
  text-decoration: none;
}

.brand span { color: var(--accent); }

.nav-actions { display: flex; gap: 10px; }

.authorized { display: flex; gap: 10px; align-items: center; }

.hero {
  margin-top: 32px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
  align-items: center;
}

.hero-text h1 { margin: 8px 0 10px; font-size: 2.2rem; }
.subtitle { color: #cfd7e3; line-height: 1.6; }

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0;
}

.search-card {
  padding: 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(16px);
}

.input-wrap {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.input-wrap input {
  flex: 1;
  min-width: 240px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  transition: 0.2s;
}

.input-wrap input:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.6);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.primary,
.secondary,
.ghost-btn {
  border: none;
  cursor: pointer;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 600;
  transition: 0.25s;
  color: var(--text);
}

.primary {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.3);
}
.primary:hover { transform: translateY(-1px); }

.secondary {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ghost-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text);
}

.ghost-btn.danger { color: #fca5a5; border-color: rgba(248, 113, 113, 0.3); }

.ghost-btn:hover,
.secondary:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.2);
}

.hint { color: #94a3b8; margin-top: 8px; }

.content { margin-top: 28px; }

.section-head { display: flex; justify-content: space-between; align-items: center; }
.section-head h2 { margin: 6px 0 0; }

.pill {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
}

.muted { color: #94a3b8; }

.cards {
  margin-top: 16px;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.company-card {
  padding: 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: 0.25s;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.3);
}

.company-card:hover { transform: translateY(-4px); border-color: rgba(37, 99, 235, 0.4); }

.code { color: #9db2cc; margin: 6px 0 0; }

.link {
  margin-top: 10px;
  display: inline-block;
  color: #bfdbfe;
  text-decoration: none;
  font-weight: 600;
}

.link:hover { color: #e0f2fe; }

.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 20px;
  color: #cbd5e1;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.15);
  border-top-color: #60a5fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 820px) {
  .hero { grid-template-columns: 1fr; }
  .topbar { flex-direction: column; gap: 10px; }
  .nav-actions { width: 100%; justify-content: flex-end; }
}
</style>
