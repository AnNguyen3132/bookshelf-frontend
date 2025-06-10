
<script setup>
import { onMounted } from 'vue'
import { ref, computed } from "vue";
import PublisherServices from "../services/PublisherServices.js";

const Publishers = ref([])
const columns = ref(["ID","Name"])
const selectedPublisher = ref({})
const isUpdatePublisher = ref(false);
const addPublisherCheck = ref(false);
const searchQuery = ref('');
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

const filteredData = computed(() => {
  let data = Publishers.value;
  let keyword = searchQuery.value.toLowerCase();
  if (keyword) {
    data = data.filter((row) => {
      return (
        String(row.id).toLowerCase().includes(keyword) ||
        String(row.name).toLowerCase().includes(keyword)
      );
    });
  }
  return data
})

onMounted(async () => {
  try {
    fetchPublishers()
  } catch (error) {
    console.error("Cannot Fetch Publishers: ", error)
  }
});

async function deletePublisher(id) {
  await PublisherServices.deletePublisher(id)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Publisher Deleted";
      fetchPublishers()
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = "Couldn't Delete Publisher";
    });
};

async function updatePublisher(id, Publisher) {
  await PublisherServices.updatePublisher(id, Publisher)
    .then(() => {
      fetchPublishers()
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Publisher Updated";
      isUpdatePublisher.value = false;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = "Name cannot be empty";
    });
};

async function addPublisher(Publisher) {
  await PublisherServices.addPublisher(Publisher)
    .then(() => {
      fetchPublishers()
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Publisher Added";
      isUpdatePublisher.value = false;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = "Name cannot be empty";
    });
};

async function fetchPublishers() {
  const response = await PublisherServices.getPublishers()
  Publishers.value = response.data
}

function openUpdatePublisher(Publisher, addPublisher) {
  addPublisherCheck.value = addPublisher;
  if(addPublisherCheck.value) {
    selectedPublisher.value = {};
  } else {
    selectedPublisher.value = {...Publisher}
  }
  isUpdatePublisher.value = true;
}

function closeUpdatePublisher() {
  isUpdatePublisher.value = false;
}

function closeSnackBar() {
  snackbar.value.value = false;
}
</script>

<template>
  <h1 class="title">Publisher Database</h1>
  <v-text-field
    v-model="searchQuery"
    label="Search"
    required
  ></v-text-field>
    <v-table>
      <thead>
        <tr>
          <th class="text-left">ID</th>
          <th class="text-left">Name</th>
        </tr>
      </thead>
    <tbody>
      <tr v-for="publisher in filteredData" :key="publisher.id" class="mb-2">
        <td class = "cursor-pointer" @click="openUpdatePublisher(publisher, false)">{{ publisher.id }}</td>
        <td class = "cursor-pointer" @click="openUpdatePublisher(publisher, false)">{{ publisher.name }}</td>
        <td>
          <v-icon color="red" class="cursor-pointer" @click="openUpdatePublisher(publisher, false)"> mdi-pencil </v-icon>
          |
          <v-icon color="red" class="cursor-pointer" @click="deletePublisher(publisher.id)"> mdi-delete </v-icon>
        </td>
      </tr>
    </tbody>
  </v-table>
  <v-card-actions>
    <v-spacer></v-spacer>
    <v-btn variant="flat" color="primary" @click="openUpdatePublisher(publisher, true)">Add Publisher</v-btn>
  </v-card-actions>

  <v-dialog persistent v-model="isUpdatePublisher" width="800">
    <v-card class="rounded-lg elevation-5">
      <v-card-title class="headline mb-2">Update Publisher</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="selectedPublisher.name"
          label="Name"
          required
        ></v-text-field>

      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          variant="flat"
          color="secondary"
          @click="closeUpdatePublisher()"
          >Close</v-btn
        >
        <v-btn v-if="!addPublisherCheck" variant="flat" color="primary" @click="updatePublisher(selectedPublisher.id, selectedPublisher)"
          >Update Publisher</v-btn
        >
        <v-btn v-if="addPublisherCheck" variant="flat" color="primary" @click="addPublisher(selectedPublisher)"
          >Add Publisher</v-btn
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