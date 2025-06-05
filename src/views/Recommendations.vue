<script setup>
import { onMounted } from 'vue'
import { ref, computed } from "vue";
import LLMServices from "../services/LLMServices.js";
import OwnedBooksServices from "../services/OwnedBooksServices.js";
const OwnedBooks = ref([])
const recommendedBooks = ref([])

onMounted(async () => {
  try {
    getRecommendations()
  } catch (error) {
    console.error(error)
  }
});

function getRecommendations() {
  console.log(OwnedBooks.value);
  fetchOwnedBooks().then(() => {
    LLMServices.getRecommendations(OwnedBooks.value)
      .then((response) => {
        console.log(response);
        const raw = response.data.recommendations;
        const jsonText = raw.replace(/```json\n?/, '').replace(/\n?```$/, '');
        recommendedBooks.value = JSON.parse(jsonText);
      })
      .catch((error) => {
        console.log(error);
      });
  });
}

async function fetchOwnedBooks() {
  const response = await OwnedBooksServices.getOwnedBook()
  console.log("Fetched books:", response.data);
  OwnedBooks.value = response.data
}

</script>

<template>
  <h1 class="title">Recommendations Page</h1>

  <v-table>
  <thead>
    <tr>
      <th class="text-left">Title</th>
      <th class="text-left">Author</th>
      <th class="text-left">Publisher</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="recommendedBook in recommendedBooks" :key="recommendedBook.book" class="mb-2">
      <td class = "cursor-pointer" >{{recommendedBook.book}}</td>
      <td class = "cursor-pointer" >{{recommendedBook.publisher }}</td>
      <td class = "cursor-pointer" >{{recommendedBook.author }}</td>
      <td>
        <v-icon color="red" class="cursor-pointer" > mdi-pencil </v-icon>
        | 
        <v-icon color="red" class="cursor-pointer" > mdi-delete </v-icon>
      </td>
    </tr>
  </tbody>
</v-table>
</template>

<style scoped>
.title {
  text-align: center;
  margin: 0.5rem 0;
  font-weight: 600;
}
</style>