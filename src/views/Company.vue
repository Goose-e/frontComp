<template>
  <div class="page-container">

    <div class="hero">
      <div>
        <router-link :to="{ name: 'main' }" class="pill">← Назад</router-link>
        <p class="eyebrow">Страница компании</p>
        <h1>{{ company?.companyName || "Загрузка..." }}</h1>
        <p class="subtitle">{{ company?.industry || "Без отрасли" }}</p>
      </div>
      <div class="status" v-if="company?.companyStatus">{{ company.companyStatus }}</div>
    </div>

    <!-- COMPANY INFO -->
    <div v-if="company" class="card company-info glass">
      <div class="card-header">
        <div>
          <p class="eyebrow">Детали</p>
          <h2>{{ company.companyName }}</h2>
        </div>
        <div class="badge" v-if="company.industry">{{ company.industry }}</div>
      </div>

      <div class="info-grid">
        <div>
          <span class="label">Статус</span>
          <p class="value">{{ company.companyStatus || '—' }}</p>
        </div>
        <div>
          <span class="label">Код компании</span>
          <p class="value">{{ company.companyCode }}</p>
        </div>
        <div>
          <span class="label">Сайт</span>
          <p class="value" v-if="company.website">
            <a
                :href="websiteLink"
                target="_blank"
                rel="noopener noreferrer"
                class="link"
            >
              {{ company.website }}
            </a>
          </p>
          <p class="value" v-else>Не указан</p>
        </div>
      </div>

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
    <div class="card glass">
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
              <button class="ghost" @click="updateUserStatus(user)">Сохранить</button>
            </div>

            <div>
              <label>Роль</label>
              <select v-model="user.userRole">
                <option value="USER">Участник</option>
                <option value="ADMIN">Админ</option>
              </select>
              <button class="ghost" @click="changeUserRole(user)">Сохранить</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Добавить пользователя -->
      <div class="add-user">
        <input type="text" v-model="usernameToAdd" placeholder="Имя пользователя" />
        <button class="primary" @click="addUserToCompany(usernameToAdd)">Добавить</button>
      </div>
    </div>

    <!-- EDIT COMPANY -->
  <div class="card glass">
      <h2>Редактировать компанию</h2>

      <div class="edit-grid">
        <input v-model="newCompany.industryName" placeholder="Отрасль" />
        <input v-model="newCompany.website" placeholder="Сайт" />
        <div v-if="isOtzovikMissing" class="otzovik-field">
          <label for="otzovikUrl">Ссылка на Отзовик</label>
          <input
              id="otzovikUrl"
              v-model="newCompany.otzovikUrl"
              placeholder="https://otzovik.by/..."
          />
          <p class="help-text">
            Отзовик не найден, укажите ссылку вручную для последующего поиска.
          </p>
        </div>
      </div>
      <button class="primary" @click="editCompany">Сохранить</button>
    </div>

    <!-- COMPANY STATUS -->
    <div class="card row glass">
      <button class="stop" @click="changeCompanyStatus(1)">Удалить компанию</button>
      <button class="start" @click="changeCompanyStatus(0)">Восстановить компанию</button>
    </div>

    <!-- MULTI-CHARTS -->
    <div class="card glass" v-if="charts.length">
      <h2>{{ charts[currentChart].title }}</h2>

      <img :src="charts[currentChart].img" class="chart-img" />

      <div class="chart-pagination">
        <button @click="prevChart" :disabled="currentChart === 0">←</button>
        <span>{{ currentChart + 1 }} / {{ charts.length }}</span>
        <button @click="nextChart" :disabled="currentChart === charts.length - 1">→</button>
      </div>
    </div>


    <!-- REVIEWS FILTER -->
    <div class="card glass">
      <div class="reviews-head">
        <h2>Отзывы</h2>
        <div class="actions">
          <button
              class="primary"
              @click="findReviews"
              :disabled="reviewSearchLoading"
          >
            <span v-if="!reviewSearchLoading">Запустить поиск отзывов</span>
            <span v-else>Запуск...</span>
          </button>
          <p v-if="reviewSearchMessage" class="status-text">{{ reviewSearchMessage }}</p>
        </div>
      </div>

      <div class="reviews-buttons">
        <button
            :class="{ active: activeSentiment === '1' }"
            @click="getAllReviewsBySentType('1')"
        >
          Положительные
        </button>
        <button
            :class="{ active: activeSentiment === '2' }"
            @click="getAllReviewsBySentType('2')"
        >
          Нейтральные
        </button>
        <button
            :class="{ active: activeSentiment === '3' }"
            @click="getAllReviewsBySentType('3')"
        >
          Негативные
        </button>
        <button
            :class="{ active: activeSentiment === '4' }"
            @click="getAllReviewsBySentType('4')"
        >
          Без оценки
        </button>
        <button
            class="all"
            :class="{ active: activeSentiment === 'all' }"
            @click="getReviews"
        >
          Все
        </button>
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
    <div class="card glass">
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
const activeSentiment = ref("all");
const usernameToAdd = ref("");
const chartImage = ref("");
const userInfo = ref(null);
const reviewSearchMessage = ref("");
const reviewSearchLoading = ref(false);
const isOtzovikMissing = computed(() => {
  const url = company.value?.otzovikUrl?.toLowerCase?.();
  return !url || url === "не найдено";
});

const currentPage = ref(1);
const pageSize = 6;

const websiteLink = computed(() => {
  const raw = company.value?.website?.trim();
  if (!raw) return null;

  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
});

const newCompany = reactive({
  industryName: "",
  website: "",
  otzovikUrl: "",
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
const normalizeReviewList = (list) =>
    Array.isArray(list) ? list : Object.values(list ?? {});

const getReviews = async () => {
  try {
    const res = await api.post("review/get_reviews", {
      companyCode: route.params.code,
    });
    reviews.value = normalizeReviewList(res.data.responseEntity?.reviewList);
  } catch (err) {
    console.error("Не удалось загрузить отзывы", err);
    reviews.value = [];
  } finally {
    currentPage.value = 1;
    activeSentiment.value = "all";
  }
};

const findReviews = async () => {
  try {
    reviewSearchLoading.value = true;
    reviewSearchMessage.value = "";

    await api.post("review/find_reviews", {
      companyCode: route.params.code,
    });

    reviewSearchMessage.value = "Поиск отзывов запущен";
    await getReviews();
  } catch (err) {
    console.error("Не удалось запустить поиск отзывов", err);
    reviewSearchMessage.value = "Не удалось запустить поиск";
  } finally {
    reviewSearchLoading.value = false;
  }
};

const getAllReviewsBySentType = async (sentId) => {
  try {
    const res = await api.post("review/get_reviews_by_sent", {
      companyCode: route.params.code,
      sentId,
    });
    reviews.value = normalizeReviewList(
        res.data.responseEntity?.reviewsBySentType
    );
  } catch (err) {
    console.error("Не удалось применить фильтр отзывов", err);
    reviews.value = [];
  } finally {
    currentPage.value = 1;
    activeSentiment.value = sentId;
  }
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
    newOtzovikUrl:
        isOtzovikMissing.value && newCompany.otzovikUrl
            ? newCompany.otzovikUrl
            : null,
  });

  getCompanyByCode();
  newCompany.industryName = "";
  newCompany.website = "";
  newCompany.otzovikUrl = "";
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
  try {
    const res = await api.post(
        "review/report",
        {
          companyCode: route.params.code,
        },
        { responseType: "arraybuffer" }
    );

    const contentType = res.headers?.["content-type"] || "";
    let blob;

    const buildPdfFromBase64 = (base64) => {
      if (!base64) throw new Error("Нет данных отчёта");
      const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      return new Blob([byteArray], { type: "application/pdf" });
    };

    if (contentType.includes("application/json")) {
      const text = new TextDecoder().decode(res.data);
      const parsed = JSON.parse(text);
      blob = buildPdfFromBase64(parsed.responseEntity?.reportImg);
    } else if (res.data instanceof ArrayBuffer) {
      blob = new Blob([res.data], { type: "application/pdf" });
    } else {
      blob = buildPdfFromBase64(res.data?.responseEntity?.reportImg);
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "report.pdf";
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Не удалось скачать отчёт", err);
  }
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
  max-width: 960px;
  margin: 0 auto;
  padding: 28px 18px 64px;
  color: var(--text);
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.28);
  margin-bottom: 18px;
}

.pill {
  display: inline-block;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-decoration: none;
  color: var(--text);
  font-weight: 600;
}

.eyebrow { text-transform: uppercase; letter-spacing: 0.08em; color: #9fb3d4; margin: 6px 0 0; }
h1 { margin: 4px 0 6px; }
.subtitle { color: #cdd6e3; margin: 0; }
.status { padding: 8px 14px; background: rgba(37, 99, 235, 0.18); border: 1px solid rgba(37, 99, 235, 0.4); border-radius: 12px; font-weight: 700; }

.glass {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
  border-radius: 18px;
  padding: 18px 16px;
  backdrop-filter: blur(14px);
}

.card { margin-bottom: 18px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.badge { padding: 6px 12px; border-radius: 999px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.1); }

.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 12px; }
.label { color: #9fb3d4; font-size: 0.9rem; }
.value { margin: 4px 0 0; font-weight: 600; }

.otzovik-btn {
  margin-top: 14px;
  display: inline-block;
  padding: 10px 14px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: var(--text);
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.3);
}

.users-grid { display: flex; flex-direction: column; gap: 12px; margin-top: 10px; }
.user-card { padding: 12px; border-radius: 12px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center; }
.role { font-size: 0.9rem; margin-top: 4px; color: #bfdbfe; }
.manage-block { display: flex; gap: 12px; align-items: flex-end; }
.manage-block select { padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.12); background: rgba(255, 255, 255, 0.05); color: var(--text); }

.add-user { margin-top: 14px; display: flex; gap: 10px; }
.add-user input,
.edit-grid input {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
}

.primary,
.ghost,
.stop,
.start,
.chart-pagination button,
.report-btn,
.reviews-buttons button {
  border: none;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
  color: var(--text);
  transition: 0.2s;
}

.primary { background: linear-gradient(135deg, #2563eb, #7c3aed); box-shadow: 0 12px 28px rgba(37, 99, 235, 0.3); }
.ghost { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.1); }
.stop { background: #dc2626; }
.start { background: #16a34a; }
.chart-pagination button { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.1); }
.report-btn { width: 100%; background: #0f172a; }

.primary:hover { transform: translateY(-1px); }
.ghost:hover,
.chart-pagination button:hover { border-color: rgba(255, 255, 255, 0.2); }

.reviews-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
.reviews-buttons button { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.1); }
.reviews-buttons button.active { border-color: rgba(37, 99, 235, 0.6); background: rgba(37, 99, 235, 0.2); }
.reviews-buttons .all { background: linear-gradient(135deg, #2563eb, #7c3aed); border: none; }

.reviews-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.reviews-head .actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.status-text { color: #9fb3d4; margin: 0; }

.link {
  color: #bfdbfe;
  text-decoration: underline;
  text-decoration-color: rgba(37, 99, 235, 0.6);
  text-decoration-thickness: 2px;
}

.review-item { background: rgba(255, 255, 255, 0.05); padding: 10px; border-radius: 10px; margin-bottom: 8px; border: 1px solid rgba(255, 255, 255, 0.08); }

.chart-img { max-width: 100%; border-radius: 12px; }

.pagination,
.chart-pagination { display: flex; justify-content: center; gap: 14px; margin-top: 12px; align-items: center; }

.chart-pagination button:disabled { background: rgba(255, 255, 255, 0.08); opacity: 0.6; cursor: not-allowed; }

.row { display: flex; gap: 12px; flex-wrap: wrap; }

.edit-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; margin: 10px 0 12px; }
.otzovik-field { display: flex; flex-direction: column; gap: 6px; }
.help-text { margin: 0; color: #9fb3d4; font-size: 0.9rem; }

@media (max-width: 640px) {
  .hero { flex-direction: column; }
  .manage-block { flex-direction: column; align-items: flex-start; }
}
</style>
