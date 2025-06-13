<template>
  <v-text-field
    v-model="searchQuery"
    label="Search"
    required
  ></v-text-field>
  <TableComponent
    :data="books"
    :dataFetch="getBooks"
    :owned="ownedBooks"
    :wishlist="wishlistBooks"
    :columns="gridColumns"
    :filter-key="searchQuery"
  />
</template>
<script setup>
import TableComponent from "../components/TableComponent.vue";
import BookService from "../services/BookServices.js";
import WishlistBooksServices from "../services/WishlistBooksServices.js";
import OwnedBooksServices from "../services/OwnedBooksServices.js";
import {  onMounted, ref } from "vue";
const books = ref([]);
const ownedBooks = ref([]);
const wishlistBooks = ref([]);
const userData = JSON.parse(localStorage.getItem("user"));
const token = userData.token || "";
onMounted(async () => {
  await getBooks();
});
async function getBooks() {
  await BookService.getBooks()
    .then(async (response) => {
      books.value = response.data;
      try {
        const response = await WishlistBooksServices.getWishlistBook(token);
        wishlistBooks.value = response.data;
      } catch (err) {
        console.error("Error fetching Wishlist Books:", err.response?.data || err);
      }
      try {
        const response = await OwnedBooksServices.getOwnedBook(token);
        ownedBooks.value = response.data;
      } catch (err) {
        console.error("Error fetching books:", err.response?.data || err);
      }
    })
    .catch((error) => {
      console.log(error);
    });
}
const searchQuery = ref('');
const gridColumns = ['Title', '*Authors','PublicationDate', '*Publishers','*Genres']
</script>
<style scoped>
.title {
  text-align: center;
  margin: 0.5rem 0;
  font-weight: 600;
}
</style>