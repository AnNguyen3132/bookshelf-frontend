<script setup>
import { ref, computed } from "vue";
import BookService from "../services/BookServices.js";

const books = ref([]);
const selectedItem = ref({})
const isView = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

const props = defineProps({
  data: Array,
  columns: Array,
  filterKey: String
})

const sortKey = ref('')
const sortOrders = ref(
  props.columns.reduce((o, key) => ((o[key] = 1), o), {})
)
const filteredData = computed(() => {
  let { data, filterKey } = props
  if (filterKey) {
    filterKey = filterKey.toLowerCase()
    data = data.filter((row) => {
      return Object.keys(row).some((key) => {
        let value = '';
        if(key === 'authors'){
          row[key].forEach(element => {
            value += element.FirstName + element.LastName;
          });
        }
        else if(key === 'genres'){
          row[key].forEach(element => {
            value += element.Descriptor;
          });
        }
        else if(key === 'publishers'){
          row[key].forEach(element => {
            value += element.Name;
          });
        }
        else{
          value = String(row[key]);
        }
        return value.toLowerCase().indexOf(filterKey) > -1
      })
    })
  }
  if(!sortKey.value.includes('*')){
    const key = sortKey.value
    if (key) {
      const order = sortOrders.value[key]
      data = data.slice().sort((a, b) => {
        a = a[key]
        b = b[key]
        return (a === b ? 0 : a > b ? 1 : -1) * order
      })
    }
  }
  else if(sortKey.value === '*Authors'){
    const order = sortOrders.value[key]
      data = data.slice().sort((a, b) => {
        let valueA = '';
        let valueB = '';
        a['authors'].array.forEach(element => {
          valueA += element.FirstName + element.LastName;
        });
        a = valueA;
        b['authors'].array.forEach(element => {
          valueB += element.FirstName + element.LastName;
        });
        b = valueB;
        return (a === b ? 0 : a > b ? 1 : -1) * order
      })
  }
  return data
})
function sortBy(key) {
  sortKey.value = key
  sortOrders.value[key] *= -1
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
function openViewer(book) {
  selectedItem.value = {...book}
  isView.value = true;
}
function closeViewer() {
  isView.value = false;
}
function closeSnackBar() {
  snackbar.value.value = false;
}
</script>

<template>
  <h2 class="title">Book Search</h2>
  <v-table v-if="filteredData.length">
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
      <tr v-for="book in filteredData" :key="book.id">
        <td>{{ book.title }}</td>
        <td v-if="book.authors.length == 1">{{ `${book.authors[0].firstName} ${book.authors[0].lastName}` }}</td>
        <td v-else-if="book.authors.length > 1">{{ `${book.authors[0].firstName} ${book.authors[0].lastName}...` }}</td>
        <td v-else>{{ `No Author Listed` }}</td>
        <td>{{ book.publicationDate.split('T')[0] }}</td>
        <td v-if="book.publishers.length == 1">{{ `${book.publishers[0].name}` }}</td>
        <td v-else-if="book.publishers.length > 1">{{ `${book.publishers[0].name}...` }}</td>
        <td v-else>{{ `No Publisher Listed` }}</td>
        <td v-if="book.genres.length == 1">{{ `${book.genres[0].descriptor}` }}</td>
        <td v-else-if="book.genres.length > 1">{{ `${book.genres[0].descriptor}...` }}</td>
        <td v-else>{{ `No Genre Listed` }}</td>
        <td>
          <v-icon color="red" class="cursor-pointer" @click="alert('Update when Wishlist Book is in system')"> mdi-bag-checked </v-icon>
          |
          <v-icon color="red" class="cursor-pointer" @click="alert('Update when Owned Book is in system')"> mdi-bookshelf </v-icon>
          |
          <v-icon color="red" class="cursor-pointer" @click="openViewer(book)"> mdi-eye </v-icon>
        </td>
      </tr>
    </tbody>
  </v-table>
  <p v-else>No matches found.</p>
  <v-dialog persistent v-model="isView" width="800">
      <v-card class="rounded-lg elevation-5">
        <v-card-title class="headline mb-2">Book Info</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="selectedItem.title"
            label="Title"
            readonly
          ></v-text-field>
          <v-combobox
            v-model="selectedItem.authors"
            :items="selectedItem.authors"
            label="Authors"
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
            v-model="selectedItem.publicationDate"
            label="Publish Date"
            readonly
          ></v-text-field>
          <v-combobox
            v-model="selectedItem.publishers"
            :items="selectedItem.publishers"
            label="Publishers"
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
            v-model="selectedItem.genres"
            :items="selectedItem.genres"
            label="Genres"
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
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="flat"
            color="secondary"
            @click="closeViewer()"
            >Close</v-btn
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
