<template>
  <div class="header">
    <div class="right-block">
      <router-link
          v-if="!isAuthorized"
          :to="{ name: 'authorization' }"
          class="nonAuthorized"
      >
        Войти
      </router-link>

      <div v-else class="authorized-left">
        <router-link :to="{ name: 'profil' }" class="go-profil">
          В профиль
        </router-link>
      </div>
      <div class="company-search">
        <input
            v-model="searchText"
            type="text"
            placeholder="Введите название или код компании…"
            @keyup.enter="searchCompany"
        />
        <button @click="searchCompany">Поиск</button>
        <button v-if="searchText" @click="resetSearch">Сброс</button>
      </div>

    </div>

    <div class="right-block" v-if="isAuthorized">
      <button @click="openCreateForm">Создать компанию</button>
      <button @click="exit">Выйти</button>
    </div>
  </div>

  <hr />

  <!-- Поиск -->


  <!-- Лоадер -->
  <div class="loader" v-if="loading">Загрузка...</div>

  <div class="middle" v-else>
    <p v-if="!allCompaniesGet.length">Компаний нету</p>

    <ul v-else>
      <li
          v-for="company in allCompaniesGet"
          :key="company.companyCode"
          @click="toCompanyPage(company.companyCode)"
      >
        <div class="info">
          <h3>{{ company.companyName }}</h3>
        </div>

        <a
            v-if="company.otzovikUrl !== 'не найдено'"
            :href="company.otzovikUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="otzovik-link"
            @click.stop
        >
          Отзовик
        </a>
      </li>
    </ul>
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
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #1976d2;
  color: white;
}

.right-block {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Кнопки */
button {
  background: white;
  color: #1976d2;
  border: none;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
  font-weight: bold;
}

button:hover {
  background: #e3f2fd;
}

/* Ссылки */
.go-profil,
.nonAuthorized {
  color: white;
  font-weight: bold;
  text-decoration: none;
}

.nonAuthorized:hover,
.go-profil:hover {
  color: #bbdefb;
}

hr {
  margin: 0;
  border: none;
  border-top: 2px solid #bbdefb;
}

.company-search {
  justify-content: center;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
  padding: 1rem 2rem;
  display: flex;
  gap: 1rem;
}

.company-search input {

  flex: 1;
  font-size: 1rem;
  max-width: 300px;
  background-color: #f5f5f5;
  color: #242424;
  padding: .15rem .5rem;
  min-height: 40px;
  border-radius: 4px;
  outline: none;
  border: none;
  line-height: 1.15;
  box-shadow: 0px 10px 20px -18px;
}
.company-search input:focus {
  border-bottom: 2px solid #5b5fc7;
  border-radius: 4px 4px 2px 2px;
}

.company-search input:hover {
  outline: 1px solid lightgrey;
}
.middle {
  padding: 2rem;
  background: #e3f2fd;
  min-height: calc(100vh - 140px);
}

ul {
  list-style: none;
  padding: 0;
}

li {
  background: white;
  padding: 1rem;
  border-radius: 14px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  transition: 0.2s;
}

li:hover {
  transform: scale(1.01);
}

.info h3 {
  margin: 0;
}

.info small {
  color: #666;
  font-size: 0.85rem;
}

.loader {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.otzovik-link {
  background-color: #1976d2;
  color: white;
  text-decoration: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.otzovik-link:hover {
  background-color: #1565c0;
}
</style>
