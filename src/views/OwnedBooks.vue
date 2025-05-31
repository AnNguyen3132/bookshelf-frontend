<script setup>
import { onMounted } from 'vue'
import { ref, toRaw, computed  } from "vue";
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

const dateMenu = ref(false)

const displayDate = computed(() => {
  return selectedOwnedBook.value.dateBought
    ? new Date(selectedOwnedBook.value.dateBought).toISOString().slice(0, 10)
    : '';
})

const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

onMounted(async () => {
  try {
    fetchOwnedBooks()

    //const response = await fetch("http://localhost/bookshelfapi/ReadingStatusTypes");//leaving this here for now, will mod later when adding the true combo box
    // const data = await response.json();
    // statusOptions.value = data;

    statusOptions.value = [
      { id: 1, statusName: "To Read" },
      { id: 2, statusName: "Reading" },
      { id: 3, statusName: "Finished" },
      { id: 4, statusName: "DNF" }
    ];


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
      snackbar.value.text = error.response.data.message || "An unexpected error occurred";
    });
};

async function updateOwnedBook(ownedBookId, ownedBook) {
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
  
  const updatePayload = {
    ...ownedBook,
    title: ownedBook.book.title,
    link: ownedBook.book.link,
    numPages: ownedBook.book.numPages,
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
      snackbar.value.text = error.response.data.message || "An unexpected error occurred";
    });
};

async function addOwnedBook(book) {
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
    ...book,
    title: book.book.title,
    link: book.book.link,
    numPages: book.book.numPages,
    ReadingStatusTypesid: statusId
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
      snackbar.value.text = error.response.data.message || "An unexpected error occurred";
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
      book: {
        title: '',
        numPages: '',
        link: ''
      },
      paidAmount: '',
      dateBought: '',
      userNotes: '',
      ReadingStatusTypesid: null,
      ReadingStatusType: { statusName: '' }
    };
    statusNameInput.value = 'To Read';
  } else {
    // Clone and normalize Book to book
    const cloned = JSON.parse(JSON.stringify(ownedBook));
    selectedOwnedBook.value = {
      ...cloned,
      book: cloned.Book ?? cloned.book,
    };
    statusNameInput.value = cloned.ReadingStatusType.statusName || "";
}
  isUpdateOwnedBook.value = true;
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

    <v-table>
      <thead>
        <tr>
          <th class="text-left">Title</th>
          <th class="text-left">Purchase Price</th>
          <th class="text-left">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(ownedBook, index) in OwnedBooks" :key="index" class="mb-2">
          <td class = "cursor-pointer" @click="openUpdateOwnedBook(ownedBook, false)">{{ ownedBook.book.title || 'Untitiled' }}</td>
          <td class = "cursor-pointer" @click="openUpdateOwnedBook(ownedBook, false)">{{ currencyFormat.format(ownedBook.paidAmount) }}</td>
          <td class = "cursor-pointer" @click="openUpdateOwnedBook(ownedBook, false)">{{ ownedBook.ReadingStatusType.statusName || 'No Status' }}</td>
          <td>
            <v-icon color="red" class="cursor-pointer" @click="openUpdateOwnedBook(ownedBook, false)"> mdi-pencil </v-icon>
            | 
            <v-icon color="red" class="cursor-pointer" @click="deleteOwnedBook(ownedBook.id)"> mdi-delete </v-icon>
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn variant="flat" color="primary" @click="openUpdateOwnedBook(ownedBook, true)">Add Book</v-btn>
    </v-card-actions>

    <v-dialog persistent v-model="isUpdateOwnedBook" width="800">
      <v-card class="rounded-lg elevation-5">
        <v-card-title class="headline mb-2">
          {{ addOwnedBookCheck ? 'Book Details' : 'Update Book Details' }}
        </v-card-title>        <v-card-text>
          <v-text-field
            v-model="selectedOwnedBook.book.title"
            label="Title"
            required
          ></v-text-field>

          <v-text-field
            v-model="selectedOwnedBook.book.numPages"
            label="Number of Pages"
          ></v-text-field>

          <v-text-field
            v-model="selectedOwnedBook.book.link"
            label="Amazon Link"
          ></v-text-field>

          <v-text-field
            v-model="selectedOwnedBook.paidAmount"
            label="Purchase Price"
          ></v-text-field>

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
                v-model="displayDate"
                label="Purchase Date"
                readonly
                v-on="on"
                v-bind="attrs"
                @click="dateMenu = true"
              ></v-text-field>
            </template>

            <v-date-picker
              v-model="selectedOwnedBook.dateBought"
              scrollable
              :show-current="true"
            >
              <template v-slot:actions>
                <v-btn text color="primary" @click="dateMenu = false">OK</v-btn>
              </template>
            </v-date-picker>
          </v-menu>

          <v-combobox
            v-model="statusNameInput"
            :items="statusOptions.map(option => option.statusName)"
            item-title="statusName"
            label="Reading Status"
            clearable
          />

          <v-textarea
            v-model="selectedOwnedBook.userNotes"
            label="Notes"
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
</template>

<style scoped>
.title {
  text-align: center;
  margin: 0.5rem 0;
  font-weight: 600;
}
</style>