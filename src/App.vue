<script setup>
import { computed } from 'vue';
import MenuBar from "./components/MenuBar.vue";
import { useRoute } from 'vue-router';

const currentRoute = useRoute();
const isLoginPage = computed(() => currentRoute.name === 'login');
</script>

<template>
  <v-app :style="{ background: '#F4F4F4' }">
    <MenuBar v-if="!isLoginPage" :key="$route.fullPath" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>


