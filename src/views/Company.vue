<template>
  <div class="page-container">

    <div class="header">
      <router-link :to="{ name: 'main' }" class="back">← Назад</router-link>
      <h1>{{ company?.companyName || "Загрузка..." }}</h1>
      <p class="subtitle">{{ company?.industry || "Без отрасли" }}</p>
    </div>

    <!-- COMPANY INFO -->
    <div v-if="company" class="card company-info">
      <h2>{{ company.companyName }}</h2>

      <p v-if="company.companyStatus">
        <strong>Статус:</strong> {{ company.companyStatus }}
      </p>

      <p v-if="company.industry">
        <strong>Отрасль:</strong> {{ company.industry }}
      </p>

      <a
          v-if="company.otzovikUrl && company.otzovikUrl !== 'не найдено'"
          :href="company.otzovikUrl"
          target="_blank"
          class="otzovik-btn"
      >
        Перейти на Отзовик
      </a>
    </div>


    <!-- USERS BLOCK -->
    <div class="card">
      <h2>Участники компании</h2>

      <div class="users-grid">
        <div
            v-for="user in companyUsers"
            :key="user.username"
            class="user-card"
        >
          <div>
            <h3>{{ user.username }}</h3>
            <p class="role" :class="'role-' + user.userRole.toLowerCase()">
              {{ user.userRole }}
            </p>
          </div>

          <!-- Управление пользователем -->
          <div v-if="canManageUser(user)" class="manage-block">
            <div>
              <label>Статус</label>
              <select v-model="user.userStatus">
                <option value="Actual">Активный</option>
                <option value="Closed">Неактивный</option>
              </select>
              <button @click="updateUserStatus(user)">Сохранить</button>
            </div>

            <div>
              <label>Роль</label>
              <select v-model="user.userRole">
                <option value="USER">Участник</option>
                <option value="ADMIN">Админ</option>
              </select>
              <button @click="changeUserRole(user)">Сохранить</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Добавить пользователя -->
      <div class="add-user">
        <input type="text" v-model="usernameToAdd" placeholder="Имя пользователя" />
        <button @click="addUserToCompany(usernameToAdd)">Добавить</button>
      </div>
    </div>

    <!-- EDIT COMPANY -->
    <div class="card">
      <h2>Редактировать компанию</h2>

      <input v-model="newCompany.industryName" placeholder="Отрасль" />
      <input v-model="newCompany.website" placeholder="Сайт" />
      <button @click="editCompany">Сохранить</button>
    </div>

    <!-- COMPANY STATUS -->
    <div class="card row">
      <button class="stop" @click="changeCompanyStatus(1)">Остановить работу</button>
      <button class="start" @click="changeCompanyStatus(0)">Возобновить работу</button>
    </div>

    <!-- MULTI-CHARTS -->
    <div class="card" v-if="charts.length">
      <h2>{{ charts[currentChart].title }}</h2>

      <img :src="charts[currentChart].img" class="chart-img" />

      <div class="chart-pagination">
        <button @click="prevChart" :disabled="currentChart === 0">←</button>
        <span>{{ currentChart + 1 }} / {{ charts.length }}</span>
        <button @click="nextChart" :disabled="currentChart === charts.length - 1">→</button>
      </div>
    </div>


    <!-- REVIEWS FILTER -->
    <div class="card">
      <h2>Отзывы</h2>

      <div class="reviews-buttons">
        <button @click="getAllReviewsBySentType('1')">Положительные</button>
        <button @click="getAllReviewsBySentType('2')">Нейтральные</button>
        <button @click="getAllReviewsBySentType('3')">Негативные</button>
        <button @click="getAllReviewsBySentType('4')">Без оценки</button>
        <button class="all" @click="getReviews">Все</button>
      </div>

      <div v-if="reviews.length">
        <div
            v-for="review in paginatedReviews"
            :key="review.timestamp"
            class="review-item"
        >
          <strong>{{ review.author }}</strong>
          <p>{{ review.content }}</p>
        </div>

        <div class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1">←</button>
          <span>{{ currentPage }} / {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">→</button>
        </div>
      </div>

      <p v-else>Отзывы отсутствуют</p>
    </div>

    <!-- REPORT BUTTON -->
    <div class="card">
      <button @click="generateReport" class="report-btn">Скачать отчёт</button>
    </div>

  </div>
</template>




<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api/http.js";

const route = useRoute();
const router = useRouter();

const company = ref(null);
const companyUsers = ref([]);
const reviews = ref([]);
const usernameToAdd = ref("");
const chartImage = ref("");
const userInfo = ref(null);

const currentPage = ref(1);
const pageSize = 6;

const newCompany = reactive({
  industryName: "",
  website: "",
});

const charts = ref([]);
const currentChart = ref(0);

const nextChart = () => {
  if (currentChart.value < charts.value.length - 1) currentChart.value++;
};

const prevChart = () => {
  if (currentChart.value > 0) currentChart.value--;
};

const getCompanyByCode = async () => {
  const res = await api.post("company/get_by_code", {
    companyCode: route.params.code,
  });
  company.value = res.data.responseEntity;
};

/* ============== REVIEWS ============== */
const getReviews = async () => {
  const res = await api.post("review/get_reviews", {
    companyCode: route.params.code,
  });
  reviews.value = res.data.responseEntity.reviewList;
  currentPage.value = 1;
};

const getAllReviewsBySentType = async (sentId) => {
  const res = await api.post("review/get_reviews_by_sent", {
    companyCode: route.params.code,
    sentId,
  });
  reviews.value = res.data.responseEntity.reviewsBySentType;
  currentPage.value = 1;
};

const paginatedReviews = computed(() => {
  const s = (currentPage.value - 1) * pageSize;
  return reviews.value.slice(s, s + pageSize);
});

const totalPages = computed(() =>
    Math.ceil(reviews.value.length / pageSize)
);

const nextPage = () => currentPage.value < totalPages.value && currentPage.value++;
const prevPage = () => currentPage.value > 1 && currentPage.value--;

/* ============== STAFF ============== */
const getAllCompanyUsers = async () => {
  const res = await api.post("company/get_all_staff", {
    companyCode: route.params.code,
  });
  companyUsers.value = res.data.responseEntity.companyUsers;
};

const addUserToCompany = async (username) => {
  await api.post("company/add_user", {
    username,
    companyCode: route.params.code,
  });
  getAllCompanyUsers();
};

const updateUserStatus = async (user) => {
  const statusId = user.userStatus === "Actual" ? 0 : 1;
  await api.post("company/change_user_status", {
    companyCode: route.params.code,
    userCode: user.userCode,
    newStatusId: statusId,
  });
  getAllCompanyUsers();
};

const changeUserRole = async (user) => {
  const roleId = user.userRole === "ADMIN" ? 1 : 0;

  await api.post("company/change_role", {
    companyCode: route.params.code,
    username: user.username,
    newRoleId: roleId,
  });

  getAllCompanyUsers();
};

/* ============== COMPANY EDITS ============== */

const editCompany = async () => {
  await api.patch("company/edit", {
    companyCode: route.params.code,
    newCompanyIndustry: newCompany.industryName || null,
    newCompanyWebsite: newCompany.website || null,
  });

  getCompanyByCode();
  newCompany.industryName = "";
  newCompany.website = "";
};

const changeCompanyStatus = async (newStatusId) => {
  await api.post("company/change_status", {
    companyCode: route.params.code,
    newStatusId,
  });
  getCompanyByCode();
};


const generateCharts = async () => {
  try {
    const res = await api.post("review/get_review_chart", {
      companyCode: route.params.code,
    });

    const dto = res.data.responseEntity;

    charts.value = [];

    // 1) График средней оценки
    if (dto.chartAvgImage) {
      charts.value.push({
        title: "Средняя оценка по отзывам",
        img: `data:image/png;base64,${dto.chartAvgImage}`,
      });
    }

    // 2) Бар-график (например, распределение отзывов)
    if (dto.chartBar) {
      charts.value.push({
        title: "Распределение отзывов (bar)",
        img: `data:image/png;base64,${dto.chartBar}`,
      });
    }


    currentChart.value = 0;
  } catch (err) {
    console.error("Ошибка загрузки графиков", err);
  }
};



const generateReport = async () => {
  const res = await api.post("review/report", {
    companyCode: route.params.code,
  });

  const base64 = res.data.responseEntity.reportImg;
  const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

  const blob = new Blob([byteArray], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "report.pdf";
  link.click();
  URL.revokeObjectURL(url);
};



const getUser = async () => {
  const res = await api.get("user/get_by_code");
  userInfo.value = res.data.responseEntity;
};

const canManageUser = (user) =>
    ["ADMIN", "OWNER"].includes(company.value?.userRole) &&
    user.userRole !== "OWNER" &&
    user.userCode !== userInfo.value?.userCode;

onMounted(() => {
  getUser();
  getCompanyByCode();
  getReviews();
  getAllCompanyUsers();
  generateCharts();
});
</script>


<style scoped>
.page-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Inter", sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 25px;
}

.back {
  text-decoration: none;
  color: #1976d2;
  font-weight: 600;
  position: absolute;
  left: 20px;
}

h1 {
  margin-bottom: 6px;
}
.subtitle {
  color: #555;
  margin-bottom: 20px;
}

.card {
  background: white;
  padding: 18px 22px;
  border-radius: 12px;
  margin-bottom: 22px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.company-info .info-row {
  display: flex;
  justify-content: space-between;
}

.otzovik-btn {
  margin-top: 12px;
  display: inline-block;
  padding: 8px 14px;
  background: #1976d2;
  color: white;
  border-radius: 8px;
  text-decoration: none;
}
.otzovik-btn:hover {
  background: #1258a8;
}

.users-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  background: #f5f8ff;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role {
  font-size: 0.85rem;
  margin-top: 3px;
}
.role-admin { color: #1976d2; }
.role-user { color: #555; }

.manage-block {
  display: flex;
  gap: 14px;
}

.manage-block select {
  padding: 5px 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.add-user {
  margin-top: 15px;
  display: flex;
  gap: 12px;
}

.add-user input {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

button {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background: #1976d2;
  color: white;
  cursor: pointer;
  transition: 0.2s;
}
button:hover {
  background: #1258a8;
}

.stop {
  background: #d32f2f;
}
.start {
  background: #388e3c;
}

.reviews-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.review-item {
  background: #f7f7f7;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.chart-img {
  max-width: 100%;
  border-radius: 10px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 12px;
}
.chart-pagination {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 12px;
  align-items: center;
}

.chart-pagination button {
  padding: 6px 12px;
  background: #1976d2;
  color: white;
  border-radius: 6px;
}

.chart-pagination button:disabled {
  background: #90caf9;
  cursor: not-allowed;
}

.report-btn {
  width: 100%;
  background: #37474f;
}
</style>
