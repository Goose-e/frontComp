import { createRouter, createWebHistory } from "vue-router";

// Импортируем компоненты для страниц
import Home from "../views/Main.vue";
import autorization_page from "../views/Autorization.vue";
import registration_page from "../views/Registration.vue";
import Profil from "../views/Profil.vue";
import UserCompanies from "../views/UserCompanies.vue";
import Company from "../views/Company.vue";

// Описываем маршруты
const routes = [
  { path: "/", component: Home, name: "main" },
  {
    path: "/authorization",
    component: autorization_page,
    name: "authorization",
  },
  { path: "/registration", component: registration_page, name: "registration" },
  { path: "/profil", component: Profil, name: "profil" },
  { path: "/usercompanes", component: UserCompanies, name: "UserCompanies" },
  { path: "/companypage/:code", component: Company, name: "UserCompany" },
  
];

// Создаём роутер
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
