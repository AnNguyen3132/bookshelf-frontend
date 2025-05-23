
<script setup>
import { onMounted } from 'vue'
import { ref, toRaw } from "vue";
import AuthorServices from "../services/AuthorServices.js";

const Authors = ref([])
const selectedAuthor = ref({})
const isUpdateAuthor = ref(false);
const addAuthorBool = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  try {
    fetchAuthors()
  } catch (error) {
    console.error("Cannot Fetch Authors: ", error)
  }
});

async function deleteAuthor(id) {
  await AuthorServices.deleteAuthor(id)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Author Deleted";
      fetchAuthors()
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = "Couldn't Delete Author";
    });
};

async function updateAuthor(id, Author) {
  await AuthorServices.updateAuthor(id, Author)
    .then(() => {
      fetchAuthors()
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Author Updated";
      isUpdateAuthor.value = false;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = "Couldn't Update Author";
    });
};

async function addAuthor(Author) {
  await AuthorServices.addAuthor(Author)
    .then(() => {
      fetchAuthors()
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Author Added";
      isUpdateAuthor.value = false;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = "Couldn't Add Author";
    });
};

async function fetchAuthors() {
  const response = await AuthorServices.getAuthor()
  Authors.value = response.data
}

function openUpdateAuthor(Author, addAuthor) {
  addAuthorBool.value = addAuthor;
  if(addAuthorBool.value) {
    selectedAuthor.value = {};
  } else {
    selectedAuthor.value = {...Author}
  }
  isUpdateAuthor.value = true;
}

function closeUpdateAuthor() {
  isUpdateAuthor.value = false;
}

function closeSnackBar() {
  snackbar.value.value = false;
}
</script>

<template>
  <h1 class="title">Author Database</h1>
   <v-container>
    <v-row v-for="(author, index) in Authors" :key="index" class="mb-2">
      <v-col cols="2" class = "cursor-pointer" @click="openUpdateAuthor(author)">ID: {{ author.id }}</v-col>
      <v-col cols="2" class = "cursor-pointer" @click="openUpdateAuthor(author)">First Name: {{ author.firstName }}</v-col>
      <v-col cols="2" class = "cursor-pointer" @click="openUpdateAuthor(author)">Middle Name: {{ author.middleName }}</v-col>
      <v-col cols="2" class = "cursor-pointer" @click="openUpdateAuthor(author)">Last Name: {{ author.lastName }}</v-col>
      <v-col cols="1" >
      <v-icon color="red" class="cursor-pointer" @click="openUpdateAuthor(author, false)"> mdi-pencil </v-icon>
      </v-col>
      <v-col cols="1" >
      <v-icon color="red" class="cursor-pointer" @click="deleteAuthor(author.id)"> mdi-delete </v-icon>
      </v-col>
      <v-col cols="12">
      <v-divider class="my-1" />
    </v-col>
    </v-row>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn variant="flat" color="primary" @click="openUpdateAuthor(author, true)">Add Author</v-btn>
    </v-card-actions>

    <v-dialog persistent v-model="isUpdateAuthor" width="800">
      <v-card class="rounded-lg elevation-5">
        <v-card-title class="headline mb-2">Update Author</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="selectedAuthor.firstName"
            label="First Name"
            required
          ></v-text-field>

          <v-text-field
            v-model="selectedAuthor.middleName"
            label="Middle Name"
            required
          ></v-text-field>

          <v-text-field
            v-model="selectedAuthor.lastName"
            label="Last Name"
            required
          ></v-text-field>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="flat"
            color="secondary"
            @click="closeUpdateAuthor()"
            >Close</v-btn
          >
          <v-btn v-if="!addAuthorBool" variant="flat" color="primary" @click="updateAuthor(selectedAuthor.id, selectedAuthor)"
            >Update Author</v-btn
          >
          <v-btn v-if="addAuthorBool" variant="flat" color="primary" @click="addAuthor(selectedAuthor)"
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
  </v-container>
</template>

<style scoped>
.title {
  text-align: center;
  margin: 0.5rem 0;
  font-weight: 600;
}
</style>