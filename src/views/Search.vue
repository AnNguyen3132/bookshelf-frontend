<template>
  <v-text-field
    v-model="searchQuery"
    label="Search"
    required
  ></v-text-field>
  <TableComponent/>
</template>
<script setup>
import TableComponent from "../components/TableComponent.vue";
import { ref } from "vue";
// const books = ref([]);
// onMounted(async () => {
//   await getBooks();
// });
// async function getBooks() {
//   await BookService.getBooks()
//     .then((response) => {
//       books.value = response.data;
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// }
const searchQuery = ref('');
</script>
<style scoped>
.title {
  text-align: center;
  margin: 0.5rem 0;
  font-weight: 600;
}
</style>