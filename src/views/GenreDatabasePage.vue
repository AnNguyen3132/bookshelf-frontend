
<script setup>
import { onMounted } from 'vue'
import { ref, computed } from "vue";
import GenreServices from "../services/GenreServices.js";

const Genres = ref([])
const columns = ref(["ID","Descriptor"])
const selectedGenre = ref({})
const isUpdateGenre = ref(false);
const addGenreCheck = ref(false);
const searchQuery = ref('');
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

const filteredData = computed(() => {
  let data = Genres.value;
  let keyword = searchQuery.value.toLowerCase();
  if (keyword) {
    data = data.filter((row) => {
      return (
        String(row.id).toLowerCase().includes(keyword) ||
        String(row.descriptor).toLowerCase().includes(keyword)
      );
    });
  }
  return data
})

onMounted(async () => {
  try {
    fetchGenres()
  } catch (error) {
    console.error("Cannot Fetch Genres: ", error)
  }
});

async function deleteGenre(id) {
  await GenreServices.deleteGenre(id)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Genre Deleted";
      fetchGenres()
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = "Couldn't Delete Genre";
    });
};

async function updateGenre(id, Genre) {
  await GenreServices.updateGenre(id, Genre)
    .then(() => {
      fetchGenres()
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Genre Updated";
      isUpdateGenre.value = false;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = "Descriptor cannot be empty";
    });
};

async function addGenre(Genre) {
  await GenreServices.addGenre(Genre)
    .then(() => {
      fetchGenres()
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Genre Added";
      isUpdateGenre.value = false;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = "Descriptor cannot be empty";
    });
};

async function fetchGenres() {
  const response = await GenreServices.getGenres()
  Genres.value = response.data
}

function openUpdateGenre(Genre, addGenre) {
  addGenreCheck.value = addGenre;
  if(addGenreCheck.value) {
    selectedGenre.value = {};
  } else {
    selectedGenre.value = {...Genre}
  }
  isUpdateGenre.value = true;
}

function closeUpdateGenre() {
  isUpdateGenre.value = false;
}

function closeSnackBar() {
  snackbar.value.value = false;
}
</script>

<template>
  <h1 class="title">Genre Database</h1>
  <v-text-field
    v-model="searchQuery"
    label="Search"
    required
  ></v-text-field>
    <v-table>
      <thead>
        <tr>
          <th class="text-left">ID</th>
          <th class="text-left">Descriptor</th>
        </tr>
      </thead>
    <tbody>
      <tr v-for="genre in filteredData" :key="genre.id" class="mb-2">
        <td class = "cursor-pointer" @click="openUpdateGenre(genre, false)">{{ genre.id }}</td>
        <td class = "cursor-pointer" @click="openUpdateGenre(genre, false)">{{ genre.descriptor }}</td>
        <td>
          <v-icon color="red" class="cursor-pointer" @click="openUpdateGenre(genre, false)"> mdi-pencil </v-icon>
          |
          <v-icon color="red" class="cursor-pointer" @click="deleteGenre(genre.id)"> mdi-delete </v-icon>
        </td>
      </tr>
    </tbody>
  </v-table>
  <v-card-actions>
    <v-spacer></v-spacer>
    <v-btn variant="flat" color="primary" @click="openUpdateGenre(genre, true)">Add Genre</v-btn>
  </v-card-actions>

  <v-dialog persistent v-model="isUpdateGenre" width="800">
    <v-card class="rounded-lg elevation-5">
      <v-card-title class="headline mb-2">Update Genre</v-card-title>
      <v-card-text>

        <v-text-field
          v-model="selectedGenre.genre"
          label="Genre"
          required
        ></v-text-field>

      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          variant="flat"
          color="secondary"
          @click="closeUpdateGenre()"
          >Close</v-btn
        >
        <v-btn v-if="!addGenreCheck" variant="flat" color="primary" @click="updateGenre(selectedGenre.id, selectedGenre)"
          >Update Genre</v-btn
        >
        <v-btn v-if="addGenreCheck" variant="flat" color="primary" @click="addGenre(selectedGenre)"
          >Add Genre</v-btn
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