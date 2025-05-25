<template>
  <TableComponent/>
</template>
<script setup>
import TableComponent from "../components/TableComponent.vue";
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
</script>
<style scoped>
.title {
  text-align: center;
  margin: 0.5rem 0;
  font-weight: 600;
}
</style>