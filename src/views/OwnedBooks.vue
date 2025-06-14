<script setup>
import { onMounted } from 'vue'
import { ref, toRaw, computed } from 'vue';
import { nextTick } from 'vue';
import OwnedBooksServices from "../services/OwnedBooksServices.js";
import GenreServices from "../services/GenreServices.js";
import AuthorServices from "../services/AuthorServices.js";
import PublisherServices from "../services/PublisherServices.js";
const OwnedBooks = ref([])
const Genres = ref([])
const Authors = ref([])
const Publishers = ref([])
const selectedOwnedBook = ref({})
const isUpdateOwnedBook = ref(false);
const statusOptions = ref([]);
const statusNameInput = ref("");
const userData = JSON.parse(localStorage.getItem("user"));
const token = userData.token || "";
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

const pubDateMenu = ref(false);
const purchDateMenu = ref(false);

const displayPublicationDate = computed(() => {
  return selectedOwnedBook.value.book?.publicationDate
    ? new Date(selectedOwnedBook.value.book.publicationDate).toISOString().slice(0, 10)
    : '';
});

const displayPurchaseDate = computed(() => {
  return selectedOwnedBook.value.dateBought
    ? new Date(selectedOwnedBook.value.dateBought).toISOString().slice(0, 10)
    : '';
});

const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

onMounted(async () => {
  try {
    await fetchOwnedBooks()

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

async function deleteOwnedBook(id, token) {
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

async function updateOwnedBook(ownedBookId, ownedBook, token) {
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
    paidAmount: ownedBook.paidAmount,
    dateBought: ownedBook.dateBought,
    userNotes: ownedBook.userNotes,
    readingStatusTypesId: statusId,
    score: ownedBook.bookRating.score,
    description: ownedBook.bookRating.description,
    ownedBookId: ownedBook.id
  };

  await OwnedBooksServices.updateOwnedBook(ownedBookId, updatePayload, token)
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

async function fetchOwnedBooks() {
  try {
    const response = await OwnedBooksServices.getOwnedBook(token);
    OwnedBooks.value = response.data;
<<<<<<< 13351-JM
    const genreResponse = await GenreServices.getGenres();
    Genres.value = genreResponse.data;
    const authorResponse = await AuthorServices.getAuthor();
    Authors.value = authorResponse.data;
    const publisherResponse = await PublisherServices.getPublishers();
    Publishers.value = publisherResponse.data;
=======
>>>>>>> dev
  } catch (err) {
    console.error("Error fetching books:", err.response?.data || err);
    snackbar.value = {
      value: true,
      color: 'red',
      text: 'Failed to load books.'
    }
  }
}

function openUpdateOwnedBook(ownedBook){
  // Clone and normalize Book to book
  const cloned = JSON.parse(JSON.stringify(ownedBook));
    selectedOwnedBook.value = {
<<<<<<< 13351-JM
      book: {
        title: '',
        numPages: null,
        publicationDate: '',
        link: ''
      },
      authors: [],
      genres: [],
      publisher: [],
      paidAmount: '',
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
  } else {
    // Clone and normalize
    const cloned = JSON.parse(JSON.stringify(ownedBook));
    selectedOwnedBook.value = {
      ...cloned,
      book: cloned.Book ?? cloned.book,
      bookRating: cloned.bookRating ?? cloned.BookRating,
      authors: cloned.book.authors ?? [],
      genres: cloned.book.genres ?? [],
      publishers: cloned.book.publishers ?? []
    };
    statusNameInput.value = cloned.ReadingStatusType.statusName || "";
  }
=======
    ...cloned,
    book: cloned.Book ?? cloned.book,
    bookRating: cloned.bookRating ?? cloned.BookRating
  };
  statusNameInput.value = cloned.ReadingStatusType.statusName || "";
>>>>>>> dev
  nextTick(() => {
    isUpdateOwnedBook.value = true;
  });
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
          <th class="text-left">Authors</th>
          <th class="text-left">Genres</th>
          <th class="text-left">Purchase Price</th>
          <th class="text-left">Status</th>
          <th class="text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(ownedBook, index) in OwnedBooks" :key="index" class="mb-2">
          <td class = "cursor-pointer" @click="openUpdateOwnedBook(ownedBook, false)">{{ ownedBook.book.title || 'Untitiled' }}</td>
          <td class="cursor-pointer" @click="openUpdateOwnedBook(ownedBook, false)">
            <template v-if="ownedBook.book.authors?.length === 1">
              {{ `${ownedBook.book.authors[0].firstName ?? ''} ${ownedBook.book.authors[0].lastName ?? ''}` }}
            </template>
            <template v-else-if="ownedBook.book.authors?.length > 1">
              {{ `${ownedBook.book.authors[0].firstName ?? ''} ${ownedBook.book.authors[0].lastName ?? ''}...` }}
            </template>
            <template v-else>
              No Author Listed
            </template>
          </td>
          <td class="cursor-pointer" @click="openUpdateOwnedBook(ownedBook, false)">
            <template v-if="ownedBook.book.genres?.length === 1">
              {{ `${ownedBook.book.genres[0].descriptor}` }}
            </template>
            <template v-else-if="ownedBook.book.genres?.length > 1">
              {{ `${ownedBook.book.genres[0].descriptor}...` }}
            </template>
            <template v-else>
              No Genre Listed
            </template>
          </td>
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
    </v-card-actions>

    <v-dialog persistent v-model="isUpdateOwnedBook" width="800">
      <v-card class="rounded-lg elevation-5">
        <v-card-title class="headline mb-2">
          {{ 'Update Book Details' }}
        </v-card-title>        <v-card-text>
          <v-text-field
            v-model="selectedOwnedBook.book.title"
            label="Title"
            readonly
            disabled
          ></v-text-field>

          <v-text-field
            v-model="displayPublicationDate"
            label="Publication Date"
            readonly
            disabled
          ></v-text-field>

          <v-text-field
            v-model="selectedOwnedBook.book.numPages"
            label="Number of Pages"
            readonly
            disabled
          ></v-text-field>

<<<<<<< 13351-JM
          <v-text-field v-if="addOwnedBookCheck"
            v-model="selectedOwnedBook.book.link"
            label="Amazon Link"
          />
          

          <div v-else-if="selectedOwnedBook.book.link && !addOwnedBookCheck" class="mt-1 mb-3">
=======
          <div class="mt-1 mb-3">
>>>>>>> dev
            <a
              :href="selectedOwnedBook.book.link"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary"
            >
              Amazon Link
            </a>
          </div>

          <v-combobox
            v-model="selectedOwnedBook.authors"
            label="Authors"
            chips
            multiple
            disabled
          >
            <template v-slot:chip="{ props, item }">
              <v-chip v-bind="props" color="primary" label>
                <strong>{{ item.value.firstName + " " + item.value.lastName }}</strong>&nbsp;
              </v-chip>
            </template>
          </v-combobox>

          <v-combobox
            v-model="selectedOwnedBook.genres"
            label="Genres"
            chips
            multiple
            disabled
          >
            <template v-slot:chip="{ props, item }">
              <v-chip v-bind="props" color="primary" label>
                <strong>{{ item.value.descriptor }}</strong>&nbsp;
              </v-chip>
            </template>
          </v-combobox>

          <v-combobox
            v-model="selectedOwnedBook.publishers"
            label="Publishers"
            chips
            multiple
            disabled
          >
            <template v-slot:chip="{ props, item }">
              <v-chip v-bind="props" color="primary" label>
                <strong>{{ item.value.name }}</strong>&nbsp;
              </v-chip>
            </template>
          </v-combobox>

          <v-text-field
            v-model="selectedOwnedBook.paidAmount"
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
                v-bind="attrs"
                @click="purchDateMenu = true"
              ></v-text-field>
            </template>

            <v-date-picker
              v-model="selectedOwnedBook.dateBought"
              scrollable
              :show-current="true"
              @update:modelValue="purchDateMenu = false"
            />
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

          <v-number-input control-variant="default"
            v-model="selectedOwnedBook.bookRating.score"
            label="Rating (1-10)"
          ></v-number-input>

          <v-textarea
            v-model="selectedOwnedBook.bookRating.description"
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
            @click="closeUpdateOwnedBook()"
            >Close</v-btn
          >
          <v-btn variant="flat" color="primary" @click="updateOwnedBook(selectedOwnedBook.id, selectedOwnedBook, token)"
            >Update Book</v-btn
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