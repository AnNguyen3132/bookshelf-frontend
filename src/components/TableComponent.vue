<script setup>
import {  onMounted, ref } from "vue";
import BookService from "../services/BookServices.js";

const books = ref([]);
onMounted(async () => {
  await getBooks();
});

const props = defineProps({
  // data: Array,
  // columns: Array,
  filterKey: String
})

// const sortKey = ref('')
// const sortOrders = ref(
//   props.columns.reduce((o, key) => ((o[key] = 1), o), {})
// )
// const filteredData = computed(() => {
//   let { data, filterKey } = props
//   if (filterKey) {
//     filterKey = filterKey.toLowerCase()
//     data = data.filter((row) => {
//       return Object.keys(row).some((key) => {
//         return String(row[key]).toLowerCase().indexOf(filterKey) > -1
//       })
//     })
//   }
//   const key = sortKey.value
//   if (key) {
//     const order = sortOrders.value[key]
//     data = data.slice().sort((a, b) => {
//       a = a[key]
//       b = b[key]
//       return (a === b ? 0 : a > b ? 1 : -1) * order
//     })
//   }
//   return data
// })
// function sortBy(key) {
//   sortKey.value = key
//   sortOrders.value[key] *= -1
// }
// function capitalize(str) {
//   return str.charAt(0).toUpperCase() + str.slice(1)
// }
async function getBooks() {
  await BookService.getBooks()
    .then((response) => {
      books.value = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}
</script>

<template>
  <h2 class="title">Book Search</h2>
  <v-table>
      <thead>
        <tr>
          <th class="text-left">Title</th>
          <th class="text-left">Author</th>
          <th class="text-left">Publication Date</th>
          <th class="text-left">Publisher</th>
          <th class="text-left">Genre</th>
          <th class="text-left">Action</th>
        </tr>
      </thead>
    <tbody>
      <tr v-for="book in books" :key="book.id">
        <td>{{ book.Title }}</td>
        <td v-if="book.authors.length == 1">{{ `${book.authors[0].FirstName} ${book.authors[0].LastName}` }}</td>
        <td v-else-if="book.authors.length > 1">{{ `${book.authors[0].FirstName} ${book.authors[0].LastName}...` }}</td>
        <td v-else>{{ `No Author Listed` }}</td>
        <td>{{ book.PublicationDate }}</td>
        <td v-if="book.publishers.length == 1">{{ `${book.publishers[0].Name}` }}</td>
        <td v-else-if="book.publishers.length > 1">{{ `${book.publishers[0].Name}...` }}</td>
        <td v-else>{{ `No Publisher Listed` }}</td>
        <td v-if="book.genres.length == 1">{{ `${book.genres[0].Descriptor}` }}</td>
        <td v-else-if="book.genres.length > 1">{{ `${book.genres[0].Descriptor}...` }}</td>
        <td v-else>{{ `No Genre Listed` }}</td>
        <td>
          Wishlist | Own | View
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
