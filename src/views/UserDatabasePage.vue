<script setup>
import { onMounted } from 'vue'
import { useRouter } from "vue-router";
import { ref, toRaw } from "vue";
import UserServices from "../services/UserServices.js";

const users = ref([])
const selectedUser = ref({})
const isUpdateUser = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  try {
    fetchUsers()
  } catch (error) {
    console.error("Cannot Fetch Users: ", error)
  }
});

async function deleteUser(id) {
  await UserServices.deleteUser(id)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "User Deleted";
      fetchUsers()
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = "Couldn't Delete User";
    });
};

async function updateUser(id, User) {
  await UserServices.updateUser(id, User)
    .then(() => {
      fetchUsers()
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "User Updated";
      isUpdateUser.value = false;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "red";
      snackbar.value.text = "Couldn't Update User";
    });
};

async function fetchUsers() {
  const response = await UserServices.getUser()
  users.value = response.data
}

function openUpdateUser(user) {
  selectedUser.value = {...user}
  isUpdateUser.value = true;
}

function closeUpdateUser() {
  isUpdateUser.value = false;
}

function closeSnackBar() {
  snackbar.value.value = false;
}

</script>

<template>
  <h1 class="title">User Database</h1>
    <v-container>
    <v-row v-for="(user, index) in users" :key="index" class="mb-2">
      <v-col cols="2" class = "cursor-pointer" @click="openUpdateUser(user)">ID: {{ user.id }}</v-col>
      <v-col cols="2" class = "cursor-pointer" @click="openUpdateUser(user)">First Name: {{ user.firstName }}</v-col>
      <v-col cols="2" class = "cursor-pointer" @click="openUpdateUser(user)">Last Name: {{ user.lastName }}</v-col>
      <v-col cols="2" class = "cursor-pointer" @click="openUpdateUser(user)">Email: {{ user.email }}</v-col>
      <v-col cols="2" class = "cursor-pointer" @click="openUpdateUser(user)">Role: {{ user.role }}</v-col>
      <v-col cols="1" >
      <v-icon color="red" class="cursor-pointer" @click="openUpdateUser(user)"> mdi-pencil </v-icon>
      </v-col>
      <v-col cols="1" >
      <v-icon color="red" class="cursor-pointer" @click="deleteUser(user.id)"> mdi-delete </v-icon>
      </v-col>
      <v-col cols="12">
      <v-divider class="my-1" />
    </v-col>
    </v-row>

    <v-dialog persistent v-model="isUpdateUser" width="800">
      <v-card class="rounded-lg elevation-5">
        <v-card-title class="headline mb-2">Update User</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="selectedUser.firstName"
            label="First Name"
            required
          ></v-text-field>

          <v-text-field
            v-model="selectedUser.lastName"
            label="Last Name"
            required
          ></v-text-field>

          <v-text-field
            v-model="selectedUser.email"
            label="Email"
            required
          ></v-text-field>

          <v-text-field
            v-model="selectedUser.role"
            label="role"
            required
          ></v-text-field>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="flat"
            color="secondary"
            @click="closeUpdateUser()"
            >Close</v-btn
          >
          <v-btn variant="flat" color="primary" @click="updateUser(selectedUser.id, selectedUser)"
            >Update</v-btn
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