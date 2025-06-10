<script setup>
import { onMounted } from 'vue'
import { ref, toRaw, computed  } from "vue";
import WishlistBooksServices from "../services/WishlistBooksServices.js";
const WishlistBooks = ref([])
const selectedItem = ref({})
const isUpdateItem = ref(false);
const userData = JSON.parse(localStorage.getItem("user"));
const token = userData.token || "";
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const pubDateMenu = ref(false);
const displayDate = computed(() => {
  return selectedItem.value.book?.publicationDate
    ? new Date(selectedItem.value.book.publicationDate).toISOString().slice(0, 10)
    : '';
});

onMounted(async () => {
  try {
    await fetchData()
  } catch (error) {
    console.error("Cannot Fetch Wishlisted Books: ", error)
  }
});

async function deleteItem(id, token) {
  await WishlistBooksServices.deleteWishlistBook(id)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Wishlist Book Removed";
      fetchData()
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = error.response.data.message || "An unexpected error occurred";
    });
};

async function updateItem(itemId, item, token) {
  await WishlistBooksServices.updateWishlistBook(itemId, item, token)
    .then(() => {
      fetchData()
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Wishlist Book Updated";
      isUpdateItem.value = false;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = error.response.data.message || "An unexpected error occurred";
    });
};

async function fetchData() {
  try {
    const response = await WishlistBooksServices.getWishlistBook(token);
    WishlistBooks.value = response.data;
  } catch (err) {
    console.error("Error fetching Wishlist Books:", err.response?.data || err);
    snackbar.value = {
      value: true,
      color: 'red',
      text: 'Failed to load Wishlist Books.'
    }
  }
}

function openUpdateItem(item) {    
  selectedItem.value = {...item};
  isUpdateItem.value = true;
}

function closeUpdateItem() {
  isUpdateItem.value = false;
}

function closeSnackBar() {
  snackbar.value.value = false;
}
</script>

<template>
  <h1 class="title">Wishlist Books</h1>
    <v-table>
      <thead>
        <tr>
          <th class="text-left">Title</th>
          <th class="text-left">Authors</th>
          <th class="text-left">Genres</th>
          <th class="text-left">Date Added</th>
          <th class="text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in WishlistBooks" :key="index" class="mb-2">
          <td>{{ item.book.title || 'Untitled' }}</td>
          <td v-if="item.book.authors.length == 1">{{ `${item.book.authors[0].firstName ?? ``} ${item.book.authors[0].lastName}` }}</td>
          <td v-else-if="item.book.authors.length > 1">{{ `${item.book.authors[0].firstName ?? ``} ${item.book.authors[0].lastName}...` }}</td>
          <td v-else>{{ `No Author Listed` }}</td>
          <td v-if="item.book.genres.length == 1">{{ `${item.book.genres[0].descriptor}` }}</td>
          <td v-else-if="item.book.genres.length > 1">{{ `${item.book.genres[0].descriptor}...` }}</td>
          <td v-else>{{ `No Genre Listed` }}</td>
          <td>Input Date Added</td>
          <td>
            <v-icon color="red" class="cursor-pointer" @click="openUpdateItem(item)"> mdi-pencil </v-icon>
            | 
            <v-icon color="red" class="cursor-pointer" @click="deleteItem(item.id)"> mdi-delete </v-icon>
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn variant="flat" color="primary" >Implement Share Link</v-btn>
    </v-card-actions>
    <v-dialog persistent v-model="isUpdateItem" width="800">
      <v-card class="rounded-lg elevation-5">
        <v-card-title class="headline mb-2">
          {{ 'Update/View Book Details' }}
        </v-card-title>        
        <v-card-text>
          <v-text-field
            v-model="selectedItem.book.title"
            label="Title(Read Only)"
            readonly
          ></v-text-field>
          <v-combobox
            v-model="selectedItem.book.authors"
            :items="selectedItem.book.authors"
            label="Authors(Read Only)"
            chips
            multiple
            disabled
          >
            <template v-slot:chip="{ props, item }">
              <v-chip v-bind="props"
                color="primary"
                label
              >
                <strong>{{ item.value.firstName + " " + item.value.lastName }}</strong>&nbsp;
              </v-chip>
            </template>
          </v-combobox>
          <v-text-field
            v-model="selectedItem.book.publicationDate"
            label="Publish Date(Read Only)"
            readonly
          ></v-text-field>
          <v-combobox
            v-model="selectedItem.book.publishers"
            :items="selectedItem.book.publishers"
            label="Publishers(Read Only)"
            chips
            multiple
            disabled
          >
            <template v-slot:chip="{ props, item }">
              <v-chip v-bind="props"
                color="primary"
                label
              >
                <strong>{{ item.value.name}}</strong>&nbsp;
              </v-chip>
            </template>
          </v-combobox>
          <v-combobox
            v-model="selectedItem.book.genres"
            :items="selectedItem.book.genres"
            label="Genres(Read Only)"
            chips
            multiple
            disabled
          >
            <template v-slot:chip="{ props, item }">
              <v-chip v-bind="props"
                color="primary"
                label
              >
                <strong>{{ item.value.descriptor }}</strong>&nbsp;
              </v-chip>
            </template>
          </v-combobox>
          <v-text-field 
            v-model="selectedItem.book.link"
            label="Amazon Link(Read Only)"
            readonly
          />
          <v-menu
            v-model="pubDateMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="displayDate"
                label="Date Added to Wishlist"
                readonly
                v-on="on"
                v-bind="attrs"
                @click="pubDateMenu = true"
              ></v-text-field>
            </template>

            <v-date-picker
              v-model="selectedItem.dateAdded"
              scrollable
              :show-current="true"
              @update:modelValue="pubDateMenu = false"
            />
          </v-menu>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="flat"
            color="secondary"
            @click="closeUpdateItem()"
            >Close</v-btn
          >
          <v-btn variant="flat" color="primary" @click="updateItem(selectedItem.id, selectedItem, token)"
            >Update Wishlist</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          :color="snackbar.color"
          variant="text"
          @click="closeSnackBar()"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
</template>

<style scoped>
.title {
  text-align: center;
  margin: 0.5rem 0;
  font-weight: 600;
}
</style>