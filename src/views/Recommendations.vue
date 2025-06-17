<script setup>
import { onMounted } from 'vue'
import { ref, computed} from "vue";
import LLMServices from "../services/LLMServices.js";
import OwnedBooksServices from "../services/OwnedBooksServices.js";
import WishlistBooksServices from "../services/WishlistBooksServices.js";
import BookServices from "../services/BookServices.js";
const OwnedBooks = ref([])
const recommendedBooks = ref([])
const isAddRecBook = ref(false);
const selectedRecommendBook = ref({})
const selectRecommendBookID = ref(0)
const statusOptions = ref([]);
const statusNameInput = ref("");
const userData = JSON.parse(localStorage.getItem("user"));
const pubDateMenu = ref(false);
const purchDateMenu = ref(false);
const isWishlist = ref(false);
const token = userData.token || "";
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});


const displayPublicationDate = computed(() => {
  return selectedRecommendBook.value.book?.publicationDate
    ? new Date(selectedRecommendBook.value.book.publicationDate).toISOString().slice(0, 10)
    : '';
});

const displayPurchaseDate = computed(() => {
  return selectedRecommendBook.value.dateBought
    ? new Date(selectedRecommendBook.value.dateBought).toISOString().slice(0, 10)
    : '';
});

onMounted(async () => {
  try {
    getRecommendations()

    statusOptions.value = [
      { id: 1, statusName: "To Read" },
      { id: 2, statusName: "Reading" },
      { id: 3, statusName: "Finished" },
      { id: 4, statusName: "DNF" }
    ];
  } catch (error) {
    console.error(error)
  }
});

function getRecommendations() {
  fetchOwnedBooks().then(() => {
    LLMServices.getRecommendations(OwnedBooks.value)
      .then((response) => {
        const jsonText = response.data.replace(/```json\n?/, '').replace(/\n?```$/, '');
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

async function addOwnedBook(recBook, token) {
  const selectedStatus = statusOptions.value.find(
    option => option.statusName === statusNameInput.value
  );

  if (!selectedStatus) {
    snackbar.value.text = "Invalid reading status. Please choose a valid option.";
    snackbar.value.color = "red";
    snackbar.value.value = true;
    return;
  }

  const statusId = selectedStatus.id;

  const addPayload = {
    ...recBook,
    title: recBook.book.title,
    link: recBook.book.link,
    numPages: recBook.book.numPages,
    publicationDate: recBook.book.publicationDate,
    readingStatusTypesId: statusId,
    score: recBook.bookRating.score,
    description: recBook.bookRating.description
  };

  await OwnedBooksServices.addOwnedBook(addPayload, token)
    .then(() => {
      fetchOwnedBooks()
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Book Added";
      isAddRecBook.value = false;
      recommendedBooks.value = recommendedBooks.value.filter(bookArray => {
        return bookArray.book !== recBook.book.title
      });
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = error.response.data.message || "An unexpected error occurred";
    });
};

async function addWishListBooks(recBook) {
  const addPayload = {
    bookId: selectRecommendBookID.value,
    dateAdded: recBook.dateBought
  };
  await WishlistBooksServices.addWishlistBook(addPayload, token)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Book Wishlisted";
      isAddRecBook.value = false;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = "Issue Wishlisting Book";
    });
  
}

async function addItem(recBook) {
  const addPayload = {
    title: recBook.book.title,
    numPages: recBook.book.numPages,
    publicationDate: recBook.book.publicationDate,
    link: recBook.book.link
  };
  await BookServices.addBook(addPayload)
    .then((response) => {
      selectRecommendBookID.value = response.data.id;
      addWishListBooks(recBook);
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = "Issue Creating Book";
    });
};


function openAddRecommendBook(recommendedBook, wishlistStatus) {
  isWishlist.value = wishlistStatus;
  selectedRecommendBook.value = {
    book: {
      title: recommendedBook.book,
      numPages: '',
      publicationDate: '',
      link: ''
    },
    paidAmount: '',
    author: [recommendedBook.author],
    publisher: [recommendedBook.publisher],
    dateBought: '',
    userNotes: '',
    readingStatusTypesId: null,
    ReadingStatusType: {
      statusName: ''  
    },
    bookRating: {
      score: null,
      description: ''
    }
  };
  statusNameInput.value = 'To Read';
  isAddRecBook.value = true;
}

function closeAddRecBook() {
  isAddRecBook.value = false;
}

function closeSnackBar() {
  snackbar.value.value = false;
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
      <td class = "cursor-pointer" >{{recommendedBook.author }}</td>
      <td class = "cursor-pointer" >{{recommendedBook.publisher }}</td>
      <v-icon color="red" class="cursor-pointer" @click="openAddRecommendBook(recommendedBook, false)"> mdi-plus </v-icon>
      |
      <v-icon color="red" class="cursor-pointer" @click="openAddRecommendBook(recommendedBook, true)"> mdi-star </v-icon>
    </tr>
  </tbody>
  </v-table>
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

  <v-dialog persistent v-model="isAddRecBook" width="800">
    <v-card class="rounded-lg elevation-5">
      <v-card-title class="headline mb-2">
        Book Details
      </v-card-title>        <v-card-text>
        <v-text-field
          v-model="selectedRecommendBook.book.title"
          label="Title"
          required
        ></v-text-field>

        <v-text-field
          v-model="selectedRecommendBook.author"
          label="Author"
          required
        ></v-text-field>

        <v-text-field
          v-model="selectedRecommendBook.publisher"
          label="Publisher"
          required
        ></v-text-field>

        <v-menu
          v-if = "!isWishlist"
          v-model="pubDateMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="displayPublicationDate"
              label="Publication Date"
              readonly
              v-on="on"
              v-bind="attrs"
              @click="pubDateMenu = true"
            ></v-text-field>
          </template>

          <v-date-picker
            v-model="selectedRecommendBook.book.publicationDate"
            scrollable
            :show-current="true"
            @update:modelValue="pubDateMenu = false"
          />
        </v-menu>

        <v-text-field
          v-if = "isWishlist"
          v-model="selectedRecommendBook.book.numPages"
          label="Number of Pages"
        ></v-text-field>

        <v-text-field
          v-if = "isWishlist"
          v-model="selectedRecommendBook.book.link"
          label="Amazon Link"
        />

        <v-text-field
          v-if = "isWishlist"
          v-model="selectedRecommendBook.paidAmount"
          label="Purchase Price"
        ></v-text-field>

        <v-menu
          v-model="purchDateMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="displayPurchaseDate"
              label="Purchase Date"
              readonly
              v-on="on"
              v-bind="attrs"
              @click="purchDateMenu = true"
            ></v-text-field>
          </template>

          <v-date-picker
            v-model="selectedRecommendBook.dateBought"
            scrollable
            :show-current="true"
            @update:modelValue="purchDateMenu = false"
          />
        </v-menu>

        <v-combobox
          v-if = "!isWishlist"
          v-model="statusNameInput"
          :items="statusOptions.map(option => option.statusName)"
          item-title="statusName"
          label="Reading Status"
          clearable
        />

        <v-textarea
          v-if = "!isWishlist"
          v-model="selectedRecommendBook.userNotes"
          label="Notes"
          rows="4"
          auto-grow
          outlined
        ></v-textarea>

        <v-number-input control-variant="default"
          v-if = "!isWishlist"
          v-model="selectedRecommendBook.bookRating.score"
          label="Rating (1-10)"
        ></v-number-input>

        <v-textarea
          v-if = "!isWishlist"
          v-model="selectedRecommendBook.bookRating.description"
          label="Rating Description"
          rows="4"
          auto-grow
          outlined
        ></v-textarea>

      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          variant="flat"
          color="secondary"
          @click="closeAddRecBook()"
          >Close</v-btn
        >
        <v-btn v-if = "!isWishlist" variant="flat" color="primary" @click="addOwnedBook(selectedRecommendBook, token)"
          >Add Book</v-btn
        >

        <v-btn v-if = "isWishlist" variant="flat" color="primary" @click="addItem(selectedRecommendBook)"
          >Wishlist Book</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.title {
  text-align: center;
  margin: 0.5rem 0;
  font-weight: 600;
}
</style>