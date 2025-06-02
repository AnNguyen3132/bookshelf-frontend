<script setup>
import { onMounted } from 'vue'
import { ref, computed } from "vue";
import BookServices from "../services/BookServices.js";

const Items = ref([])
const columns = ref(["ID","FirstName","MiddleName","LastName"])
const selectedItem = ref({})
const isUpdateItem = ref(false);
const addItemCheck = ref(false);
const searchQuery = ref('');
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

const filteredData = computed(() => {
  let data = Items.value;
  let keyword = searchQuery.value.toLowerCase();
  if (keyword) {
    data = data.filter((row) => {
      return (
        String(row.id).toLowerCase().includes(keyword) ||
        String(row.firstName).toLowerCase().includes(keyword) ||
        String(row.middleName).toLowerCase().includes(keyword) ||
        String(row.lastName).toLowerCase().includes(keyword)
      );
    });
  }
  return data
})

onMounted(async () => {
  try {
    fetchData()
  } catch (error) {
    console.error("Cannot Fetch Authors: ", error)
  }
});

async function deleteItem(id) {
  await BookServices.deleteBook(id)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Author Deleted";
      fetchData()
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = "Couldn't Delete Author";
    });
};

async function updateItem(id, Book) {
  await BookServices.updateBook(id, Book)
    .then(() => {
      fetchData()
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Author Updated";
      isUpdateItem.value = false;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = "Last Name cannot be empty";
    });
};

async function addItem(Item) {
  await BookServices.addBook(Item)
    .then(() => {
      fetchData()
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Author Added";
      isUpdateItem.value = false;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = "Last Name cannot be empty";
    });
};

async function fetchData() {
  const response = await BookServices.getBooks()
  Items.value = response.data
}

function openUpdateItem(Item, addBook) {
  addItemCheck.value = addBook;
  if(addItemCheck.value) {
    selectedItem.value = {};
  } else {
    selectedItem.value = {...Item}
  }
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
  <h1 class="title">Book Database</h1>
  <v-text-field
    v-model="searchQuery"
    label="Search"
    required
  ></v-text-field>
    <v-table>
      <thead>
        <tr>
          <th class="text-left">ID</th>
          <th class="text-left">Title</th>
          <th class="text-left">Authors</th>
          <th class="text-left">Number of Pages</th>
          <th class="text-left">Publication Date</th>
          <th class="text-left">Publishers</th>
          <th class="text-left">Genres</th>
          <th class="text-left">Actions</th>
        </tr>
      </thead>
    <tbody>
      <tr v-for="item in filteredData" :key="item.id" class="mb-2">
        <td class = "cursor-pointer" @click="openUpdateItem(item, false)">{{ item.id }}</td>
        <td class = "cursor-pointer" @click="openUpdateItem(item, false)">{{ item.title }}</td>
        <td class = "cursor-pointer" @click="openUpdateItem(item, false)">Input Authors</td>
        <td class = "cursor-pointer" @click="openUpdateItem(item, false)">{{ item.numPages }}</td>
        <td class = "cursor-pointer" @click="openUpdateItem(item, false)">{{ item.publicationDate.split('T')[0] }}</td>
        <td class = "cursor-pointer" @click="openUpdateItem(item, false)">Input Publishers</td>
        <td class = "cursor-pointer" @click="openUpdateItem(item, false)">Input Genres</td>
        <td>
          <v-icon color="red" class="cursor-pointer" @click="openUpdateItem(item, false)"> mdi-pencil </v-icon>
          |
          <v-icon color="red" class="cursor-pointer" @click="deleteItem(item.id)"> mdi-delete </v-icon>
        </td>
      </tr>
    </tbody>
  </v-table>
  <v-card-actions>
    <v-spacer></v-spacer>
    <v-btn variant="flat" color="primary" @click="openUpdateItem(item, true)">Add Book</v-btn>
  </v-card-actions>

  <v-dialog persistent v-model="isUpdateItem" width="800">
    <v-card class="rounded-lg elevation-5">
      <v-card-title class="headline mb-2">Update Author</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="selectedItem.title"
          label="First Name"
          required
        ></v-text-field>

        <v-text-field
          v-model="selectedItem.numPages"
          label="Middle Name"
          required
        ></v-text-field>

        <v-text-field
          v-model="selectedItem.lastName"
          label="Last Name"
          required
        ></v-text-field>

      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          variant="flat"
          color="secondary"
          @click="closeUpdateItem()"
          >Close</v-btn
        >
        <v-btn v-if="!addItemCheck" variant="flat" color="primary" @click="updateItem(selectedItem.id, selectedItem)"
          >Update Author</v-btn
        >
        <v-btn v-if="addItemCheck" variant="flat" color="primary" @click="addItem(selectedItem)"
          >Add Author</v-btn
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