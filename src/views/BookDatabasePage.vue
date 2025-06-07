<script setup>
import { onMounted } from 'vue'
import { ref, computed } from "vue";
import BookServices from "../services/BookServices.js";
import GenreServices from "../services/GenreServices.js";
import AuthorServices from "../services/AuthorServices.js";
import PublisherServices from "../services/PublisherServices.js";

const Items = ref([]);
const Genres = ref([])
const Authors = ref([])
const Publishers = ref([])
const columns = ref(["ID","FirstName","MiddleName","LastName"]);
const selectedItem = ref({});
const isUpdateItem = ref(false);
const addItemCheck = ref(false);
const searchQuery = ref('');
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const dateMenu = ref(false)

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

async function updateItem(Item) {
  await BookServices.updateBook(Item)
    .then(() => {
      fetchData()
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Book Updated";
      isUpdateItem.value = false;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      console.log(error)
      snackbar.value.text = "Last Name cannot be empty";
    });
};

async function addItem(Item) {
  Item.genres = [
    {
      "id": 1,
      "descriptor": "Horror",
      "createdAt": "2025-06-05T05:26:33.000Z",
      "updatedAt": "2025-06-05T05:26:33.000Z",
      "genre_book": {
        "createdAt": "2025-06-05T05:27:01.000Z",
        "updatedAt": "2025-06-05T05:27:01.000Z",
        "genreId": 1,
        "bookId": 1
      }
    },
    {
      "id": 2,
      "descriptor": "Romance",
      "createdAt": "2025-06-05T05:26:33.000Z",
      "updatedAt": "2025-06-05T05:26:33.000Z",
      "genre_book": {
        "createdAt": "2025-06-05T05:27:01.000Z",
        "updatedAt": "2025-06-05T05:27:01.000Z",
        "genreId": 2,
        "bookId": 1
      }
    }
  ];
  console.log(Item)
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
  const dataResponse = await BookServices.getBooks();
  Items.value = dataResponse.data;
  const genreResponse = await GenreServices.getGenres();
  Genres.value = genreResponse.data;
  const authorResponse = await AuthorServices.getAuthor();
  Authors.value = authorResponse.data;
  const publisherResponse = await PublisherServices.getPublishers();
  Publishers.value = publisherResponse.data;
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
function selectableItems(selectedItems,dataArray){
  let difference = [];
  //Adding a n^2 loop since the filter difference is not acting right
  dataArray.forEach(l => {
    let isFound = false;
    selectedItems.forEach(k => {
      if(k.id == l.id)
        isFound = true;
    });
    if(!isFound)
      difference.push(l);
  });
  return difference
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
        <v-card-title class="headline mb-2">Book Info</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="selectedItem.title"
            label="Title"
          ></v-text-field>
          <v-combobox
            v-model="selectedItem.authors"
            :items="selectableItems(selectedItem.authors,Authors)"
            label="Authors"
            chips
            multiple
          >
            <template v-slot:item="{ props, item }">
              <v-chip
                v-bind="props"
                color="primary"
                size="small"
                variant="flat"
                label
              >
                <strong>{{ item.value.firstName + " " + item.value.lastName }}</strong>&nbsp;
              </v-chip>
            </template>
            <template v-slot:chip="{ props, item }">
              <v-chip v-bind="props"
                color="primary"
                label
                closable
              >
                <strong>{{ item.value.firstName + " " + item.value.lastName }}</strong>&nbsp;
              </v-chip>
            </template>
          </v-combobox>
          <v-number-input control-variant="default"
            v-model="selectedItem.numPages"
            label="Number of Pages"
          ></v-number-input>
          <v-menu
            v-model="dateMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="selectedItem.publicationDate"
                label="Publication Date"
                readonly
                v-on="on"
                v-bind="attrs"
                @click="dateMenu = true"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="selectedItem.publicationDate"
              scrollable
              :show-current="true"
            >
              <template v-slot:actions>
                <v-btn text color="primary" @click="dateMenu = false">OK</v-btn>
              </template>
            </v-date-picker>
          </v-menu>
          <v-combobox
            v-model="selectedItem.publishers"
            :items="selectableItems(selectedItem.publishers,Publishers)"
            label="Publishers"
            chips
            multiple
          >
            <template v-slot:item="{ props, item }">
              <v-chip
                v-bind="props"
                color="primary"
                size="small"
                variant="flat"
                label
              >
                {{ item.value.name }}
              </v-chip>
            </template>
            <template v-slot:chip="{ props, item }">
              <v-chip v-bind="props"
                color="primary"
                label
                closable
              >
                <strong>{{ item.value.name}}</strong>&nbsp;
              </v-chip>
            </template>
          </v-combobox>
          <v-combobox
            v-model="selectedItem.genres"
            :items="selectableItems(selectedItem.genres,Genres)"
            label="Genres"
            chips
            multiple
            return-object
          >
            <template v-slot:item="{ props, item }">
              <v-chip
                v-bind="props"
                color="primary"
                size="small"
                variant="flat"
                label
              >
                {{ item.value.descriptor }}
              </v-chip>
            </template>
            <template v-slot:chip="{ props, item }">
              <v-chip v-bind="props"
                color="primary"
                label
                closable
              >
                <strong>{{ item.value.descriptor }}</strong>&nbsp;
              </v-chip>
            </template>
          </v-combobox>
          <v-text-field
            v-model="selectedItem.link"
            label="Link"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="flat"
            color="secondary"
            @click="closeUpdateItem()"
            >Close</v-btn>
          <v-btn v-if="!addItemCheck" variant="flat" color="primary" @click="updateItem(selectedItem)"
          >Update Book</v-btn>
          <v-btn v-if="addItemCheck" variant="flat" color="primary" @click="addItem(selectedItem)"
          >Add Book</v-btn>
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