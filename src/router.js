import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: () => import("./views/Login.vue"),
    },
    {
      path: "/Recommendations",
      name: "Recommendations",
      component: () => import("./views/Recommendations.vue"),
    },
    {
      path: "/Account",
      name: "Account",
      component: () => import("./views/Account.vue"),
    },
    {
      path: "/Wishlist",
      name: "Wishlist",
      component: () => import("./views/Wishlist.vue"),
    },
    {
      path: "/OwnedBooks",
      name: "OwnedBooks",
      component: () => import("./views/OwnedBooks.vue"),
    },
    {
      path: "/Search",
      name: "Search",
      component: () => import("./views/Search.vue"),
    },
    {
      path: "/UserDatabasePage",
      name: "UserDatabasePage",
      component: () => import("./views/UserDatabasePage.vue"),
    },
    {
      path: "/AuthorDatabasePage",
      name: "AuthorDatabasePage",
      component: () => import("./views/AuthorDatabasePage.vue"),
    },
    {
      path: "/GenreDatabasePage",
      name: "GenreDatabasePage",
      component: () => import("./views/GenreDatabasePage.vue"),
    },
    {
      path: "/BookDatabasePage",
      name: "BookDatabasePage",
      component: () => import("./views/BookDatabasePage.vue"),
    },
  ],
});

export default router;
