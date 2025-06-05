<script setup>
import { onMounted } from 'vue'
import { ref, computed } from "vue";
import LLMServices from "../services/LLMServices.js";
import OwnedBooksServices from "../services/OwnedBooksServices.js";
const OwnedBooks = ref([])

onMounted(async () => {
  try {
    getRecommendations()
  } catch (error) {
    console.error(error)
  }
});

function getRecommendations() {
  fetchOwnedBooks().then(() => {
    LLMServices.getRecommendations(OwnedBooks.value)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  });
}

async function fetchOwnedBooks() {
  const response = await OwnedBooksServices.getOwnedBook()
  OwnedBooks.value = response.data
}

</script>

<template>
  <h1 class="title">Recommendations Page</h1>
</template>

<style scoped>
.title {
  text-align: center;
  margin: 0.5rem 0;
  font-weight: 600;
}
</style>