<script setup>
import { ref, computed } from "vue";
import OwnedBooksServices from "../services/OwnedBooksServices.js";
import WishlistBooksServices from "../services/WishlistBooksServices.js";
const selectedItem = ref({})
const isView = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

const props = defineProps({
  data: Array,
  dataFetch: Function,
  owned: Array,
  wishlist: Array,
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
            value += element.firstName + element.lastName;
          });
        }
        else if(key === 'genres'){
          row[key].forEach(element => {
            value += element.descriptor;
          });
        }
        else if(key === 'publishers'){
          row[key].forEach(element => {
            value += element.name;
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
        let camelKey = key.charAt(0).toLowerCase() + key.slice(1)
        a = a[camelKey]
        b = b[camelKey]
        return (a === b ? 0 : a > b ? 1 : -1) * order
      })
    }
  }
  else if(sortKey.value.includes('*')){
    const key = sortKey.value
    const order = sortOrders.value[key]
      let camelKey = key.charAt(1).toLowerCase() + key.slice(2)
      data = data.slice().sort((a, b) => {
        let valueA = '';
        let valueB = '';
        if(a[camelKey]){
          a[camelKey].forEach(element => {
            if(key === '*Authors')
              valueA += element.lastName;
            else if(key === '*Publishers')
              valueA += element.name;
            else if(key === '*Genres')
              valueA += element.descriptor;
          });
        }
        if(b[camelKey]){
          b[camelKey].forEach(element => {
            if(key === '*Authors')
              valueB += element.lastName;
            else if(key === '*Publishers')
              valueB += element.name;
            else if(key === '*Genres')
              valueB += element.descriptor;
          });
        }
        return (valueA === valueB ? 0 : valueA > valueB ? 1 : -1) * order
      })
  }
  return data
})
function sortBy(key) {
  sortKey.value = key
  sortOrders.value[key] *= -1
}
function openViewer(book) {
  selectedItem.value = {...book}
  isView.value = true;
}
async function addOwnedBook(book, token) {
    let { dataFetch } = props;
  const selectedStatus = { id: 1, statusName: "To Read" };//Just setting new Owned Books to this Status
  if (!selectedStatus) {
    snackbar.value.text = "Invalid reading status. Please choose a valid option.";
    snackbar.value.color = "red";
    snackbar.value.value = true;
    return;
  }
  const statusId = selectedStatus.id;
  const addPayload = {
    title: book.title,
    link: book.link,
    numPages: book.numPages,
    publicationDate: book.publicationDate,
    paidAmount: 0,
    dateBought: new Date().toISOString().split('T')[0],
    userNotes: "",
    readingStatusTypesId: statusId,
    score: 1,
    description: ""
  };
  await OwnedBooksServices.addOwnedBook(addPayload, token)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Book Mark as Owned";
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = error.status || "An unexpected error occurred";
    })
    .finally(()=>{
      try{
        dataFetch();
      }
      catch(error)
      {
        console.log("Error Fetching after posting");
      }
    });
};
async function addWishlistBook(book, token) {
    let { dataFetch } = props;
  const addPayload = {
    bookId: book.id,
    dateAdded: new Date().toISOString().split('T')[0],
  };
  await WishlistBooksServices.addWishlistBook(addPayload, token)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Book Mark as Wishlisted";
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = error.status || "An unexpected error occurred";
    })
    .finally(()=>{
      try{
        dataFetch();
      }
      catch(error)
      {
        console.log("Error Fetching after posting");
      }
    });
};
function closeViewer() {
  isView.value = false;
}
function closeSnackBar() {
  snackbar.value.value = false;
}
const regex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
function isValid (link) {
    if (!link)
      return false;
    else
      return link.match(regex);
}
//Function is used to determine if book is an Owned Book
function isOwnedBook(item){
  let { owned } = props;
  let isOwned = false;
  if(owned)
    owned.forEach((k)=>{
      if(k.bookId == item.id)
        isOwned = true;
    });
  return isOwned;
}
//Function is used to determine if book is a Wishlist Book
function isWishlistBook(item){
  let { wishlist } = props;
  let isWishlist = false;
  if(wishlist)
    wishlist.forEach((k)=>{
      if(k.bookId == item.id)
        isWishlist = true;
    });
  return isWishlist;
}
</script>

<template>
  <h2 class="title">Book Search</h2>
  <v-table v-if="filteredData.length">
      <thead>
        <tr>
          <th class="text-left"
            @click="sortBy('Title')"
            :class="{ active: sortKey == 'Title' }"
          >
            Title
            <span class="arrow" :class="sortOrders['Title'] > 0 > 0 ? 'asc' : 'dsc'"/>
          </th>
          <th class="text-left"
            @click="sortBy('*Authors')"
            :class="{ active: sortKey == '*Authors' }"
          >
            Author
            <span class="arrow" :class="sortOrders['*Authors'] > 0 > 0 ? 'asc' : 'dsc'"/>  
          </th>
          <th class="text-left"
            @click="sortBy('PublicationDate')"
            :class="{ active: sortKey == 'PublicationDate' }"
          >
            Publication Date
            <span class="arrow" :class="sortOrders['PublicationDate'] > 0 > 0 ? 'asc' : 'dsc'"/>
          </th>
          <th class="text-left"
            @click="sortBy('*Publishers')"
            :class="{ active: sortKey == '*Publishers' }"
          >
            Publisher
            <span class="arrow" :class="sortOrders['*Publishers'] > 0 > 0 ? 'asc' : 'dsc'"/>
          </th>
          <th class="text-left"
            @click="sortBy('*Genres')"
            :class="{ active: sortKey == '*Genres' }"
          >
            Genre
            <span class="arrow" :class="sortOrders['*Genres'] > 0 > 0 ? 'asc' : 'dsc'"/>
          </th>
          <th class="text-left">Link</th>
          <th class="text-left">Action</th>
        </tr>
      </thead>
    <tbody>
      <tr v-for="book in filteredData" :key="book.id">
        <td>{{ book.title }}</td>
        <td v-if="book.authors.length == 1">{{ `${book.authors[0].firstName ?? ``} ${book.authors[0].lastName}` }}</td>
        <td v-else-if="book.authors.length > 1">{{ `${book.authors[0].firstName ?? ``} ${book.authors[0].lastName}...` }}</td>
        <td v-else>{{ `No Author Listed` }}</td>
        <td>{{ book.publicationDate.split('T')[0] }}</td>
        <td v-if="book.publishers.length == 1">{{ `${book.publishers[0].name}` }}</td>
        <td v-else-if="book.publishers.length > 1">{{ `${book.publishers[0].name}...` }}</td>
        <td v-else>{{ `No Publisher Listed` }}</td>
        <td v-if="book.genres.length == 1">{{ `${book.genres[0].descriptor}` }}</td>
        <td v-else-if="book.genres.length > 1">{{ `${book.genres[0].descriptor}...` }}</td>
        <td v-else>{{ `No Genre Listed` }}</td>
        <td>
          <a v-if="isValid(book.link)" class="primary" :href="book.link" target="_blank">Buy Book</a>
          <a v-else>Invalid Link</a>
        </td>
        <td>
          <v-icon v-if="!isOwnedBook(book)" color="red" class="cursor-pointer" @click="addOwnedBook(book)" title="Add to Owned Books"> mdi-bag-checked </v-icon>
          <v-icon v-else color="red" title="Already Owned Book"> mdi-checkbox-marked </v-icon>
          |
          <v-icon v-if="isOwnedBook(book)" color="red" title="Already Owned Book">mdi-block-helper</v-icon>
          <v-icon v-else-if="isWishlistBook(book)" color="red" title="Already Wishlisted Book"> mdi-checkbox-marked </v-icon>
          <v-icon v-else color="red" class="cursor-pointer" @click="addWishlistBook(book)" title="Add to Wishlisted Books"> mdi-bookshelf </v-icon>
          |
          <v-icon color="red" class="cursor-pointer" @click="openViewer(book)" title="View Book Details"> mdi-eye </v-icon>
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
table {
  border: 2px solid;
  border-radius: 3px;
}

th {
  cursor: pointer;
  user-select: none;
}

th,
td {
  min-width: 120px;
  padding: 10px 20px;
}

th.active {
  color: #3e3d3d;
}

th.active .arrow {
  opacity: 1;
}

.arrow {
  display: inline-block;
  vertical-align: middle;
  width: 0;
  height: 0;
  margin-left: 5px;
  opacity: 0.66;
}

.arrow.asc {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid black;
}

.arrow.dsc {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid black;
}
a {
  display: grid;
  align-content: center;
  border-radius: 5px;
  color: white;
  background-color: #80162B;
  text-decoration: none;
  text-align: center;
}
a:hover {
  background-color: #80162b9c;
}
</style>