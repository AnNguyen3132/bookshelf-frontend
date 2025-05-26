<script setup>
import { onMounted } from 'vue'
import { ref, toRaw } from "vue";
import OwnedBooksServices from "../services/OwnedBooksServices.js";
const OwnedBooks = ref([])
const selectedOwnedBook = ref({})
const isUpdateOwnedBook = ref(false);
const addOwnedBookCheck = ref(false);
const statusOptions = ref([]);
const statusNameInput = ref("");
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  try {
    fetchOwnedBooks()

    const response = await fetch("http://localhost/bookshelfapi/ReadingStatusTypes");
    const data = await response.json();
    statusOptions.value = data;

  } catch (error) {
    console.error("Cannot Fetch Owned Books: ", error)
  }
});

async function deleteOwnedBook(id) {
  await OwnedBooksServices.deleteOwnedBook(id)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Book Removed";
      fetchOwnedBooks()
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = error.response?.data?.message || "An unexpected error occurred";
    });
};

async function updateOwnedBook(ownedBookId, ownedBook) {
  let statusId = null;
  
  if (statusNameInput.value == "To Read") {
    statusId = 1;
  } else if (statusNameInput.value == "Reading") {
    statusId = 2;
  } else if (statusNameInput.value == "Finished") {
    statusId = 3;
  } else if (statusNameInput.value == "Abandoned") {
    statusId = 4;
  } else {
    snackbar.value.text = "Invalid reading status. Please choose a valid option.";
    snackbar.value.color = "red";
    snackbar.value.value = true;
    return;
  }

  const updatePayload = {
    ...ownedBook,
    title: ownedBook.book?.title,
    link: ownedBook.book?.link,
    numPages: ownedBook.book?.numPages,
    ReadingStatusTypesid: statusId
  };

  await OwnedBooksServices.updateOwnedBook(ownedBookId, updatePayload)
    .then(() => {
      fetchOwnedBooks()
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Book Updated";
      isUpdateOwnedBook.value = false;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = error.response?.data?.message || "An unexpected error occurred";
    });
};

async function addOwnedBook(book) {
  const addPayload = {
    ...book,
    title: book.book?.title,
    link: book.book?.link,
    numPages: book.book?.numPages,
    ReadingStatusTypesid: book.ReadingStatusTypesid
  };

  await OwnedBooksServices.addOwnedBook(addPayload)
    .then(() => {
      fetchOwnedBooks()
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Book Added";
      isUpdateOwnedBook.value = false;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = error.response?.data?.message || "An unexpected error occurred";
    });
};

async function fetchOwnedBooks() {
  const response = await OwnedBooksServices.getOwnedBook()
  console.log("Fetched books:", response.data);
  OwnedBooks.value = response.data
}

function openUpdateOwnedBook(ownedBook, addOwnedBook) {
  addOwnedBookCheck.value = addOwnedBook;
  if(addOwnedBookCheck.value) {
    selectedOwnedBook.value = {
      book: {},
      ReadingStatusTypesid: null
    };
  } else {
    selectedOwnedBook.value = JSON.parse(JSON.stringify(ownedBook));
  }
  isUpdateOwnedBook.value = true;
  statusNameInput.value = ownedBook.ReadingStatusType?.statusName || "";
}

function closeUpdateOwnedBook() {
  isUpdateOwnedBook.value = false;
}

function closeSnackBar() {
  snackbar.value.value = false;
}
</script>

<template>
  <h1 class="title">Owned Books</h1>
   <v-container>
    <v-row v-for="(ownedBook, index) in OwnedBooks" :key="index" class="mb-2">
      <v-col cols="2" class = "cursor-pointer" @click="openUpdateOwnedBook(ownedBook, false)">Title: {{ ownedBook.Book?.title || 'Untitiled'}}</v-col>
      <v-col cols="2" class = "cursor-pointer" @click="openUpdateOwnedBook(ownedBook, false)">Page Count: {{ ownedBook.Book?.numPages || 'N/A'}}</v-col>
      <v-col cols="2" class = "cursor-pointer" @click="openUpdateOwnedBook(ownedBook, false)">Link: {{ ownedBook.Book?.link || 'Empty'}}</v-col>
      <v-col cols="2" class = "cursor-pointer" @click="openUpdateOwnedBook(ownedBook, false)">Purchase Price: {{ ownedBook.paidAmount }}</v-col>
      <v-col cols="2" class = "cursor-pointer" @click="openUpdateOwnedBook(ownedBook, false)">Purchase Date: {{ ownedBook.dateBought }}</v-col>
      <v-col cols="2" class = "cursor-pointer" @click="openUpdateOwnedBook(ownedBook, false)">Status: {{ ownedBook.ReadingStatusType?.statusName || 'No Status' }}</v-col>
      <v-col cols="2" class = "cursor-pointer" @click="openUpdateOwnedBook(ownedBook, false)">Notes: {{ ownedBook.userNotes }}</v-col>
      <v-col cols="1" >
      <v-icon color="red" class="cursor-pointer" @click="openUpdateOwnedBook(ownedBook, false)"> mdi-pencil </v-icon>
      </v-col>
      <v-col cols="1" >
      <v-icon color="red" class="cursor-pointer" @click="deleteOwnedBook(ownedBook.id)"> mdi-delete </v-icon>
      </v-col>
      <v-col cols="12">
      <v-divider class="my-1" />
    </v-col>
    </v-row>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn variant="flat" color="primary" @click="openUpdateOwnedBook(ownedBook, true)">Add Book</v-btn>
    </v-card-actions>

    <v-dialog persistent v-model="isUpdateOwnedBook" width="800">
      <v-card class="rounded-lg elevation-5">
        <v-card-title class="headline mb-2">Update Book Details</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="selectedOwnedBook.Book.title"
            label="Title"
            required
          ></v-text-field>

          <v-text-field
            v-model="selectedOwnedBook.Book.numPages"
            label="Number of Pages"
          ></v-text-field>

          <v-text-field
            v-model="selectedOwnedBook.Book.link"
            label="Amazon Link"
          ></v-text-field>

          <v-text-field
            v-model="selectedOwnedBook.paidAmount"
            label="Amount Paid"
          ></v-text-field>

          <v-text-field
            v-model="selectedOwnedBook.dateBought"
            label="Purchase Date"
          ></v-text-field>


          <v-combobox
            v-model="statusNameInput"
            :items="statusOptions"
            item-title="statusName"
            item-value="statusNameInput"
            label="Reading Status"
            clearable
          />
          <!-- <v-text-field
            v-model="selectedOwnedBook.ReadingStatusType.statusName"
            label="Reading Status"
          ></v-text-field>           -->

          <v-text-field
            v-model="selectedOwnedBook.userNotes"
            label="Notes"
          ></v-text-field>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="flat"
            color="secondary"
            @click="closeUpdateOwnedBook()"
            >Close</v-btn
          >
          <v-btn v-if="!addOwnedBookCheck" variant="flat" color="primary" @click="updateOwnedBook(selectedOwnedBook.id, selectedOwnedBook)"
            >Update Book</v-btn
          >
          <v-btn v-if="addOwnedBookCheck" variant="flat" color="primary" @click="addOwnedBook(selectedOwnedBook)"
            >Add Book</v-btn
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
    <!-- <pre>{{ JSON.stringify(OwnedBooks, null, 2) }}</pre> -->
  </v-container>
</template>

<style scoped>
.title {
  text-align: center;
  margin: 0.5rem 0;
  font-weight: 600;
}
</style>
