<script setup>
import { ref, onMounted } from "vue";
import OwnedBooksServices from "../services/OwnedBooksServices.js";
import LLMServices from "../services/LLMServices.js"

const OwnedBooks = ref([])

onMounted(async () => {
  getRecommendations();
});

async function getRecommendations() {
  try {
    await fetchOwnedBooks();
    const response = await LLMServices.getRecommendations(OwnedBooks.value);
    console.log(response);
  } catch (error) {
    console.log(error);
  }
}
async function fetchOwnedBooks() {
  const response = await OwnedBooksServices.getOwnedBook()
  OwnedBooks.value = response.data.map(entry => entry.book.title);
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