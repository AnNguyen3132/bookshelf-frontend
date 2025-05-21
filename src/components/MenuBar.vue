<script setup>
import ocLogo from "/oc_logo.png";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/UserServices";

const router = useRouter();

const user = ref(null);
const title = ref("Recipes");
const logoURL = ref("");

onMounted(() => {
  logoURL.value = ocLogo;
  user.value = JSON.parse(localStorage.getItem("user"));
});

function logout() {
  UserServices.logoutUser()
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log(error);
    });
  localStorage.removeItem("user");
  user.value = null;
  router.push({ name: "login" });
}
</script>

<script>
export default {
  name: 'MenuControl',
  data() {
    return {
      menuVisible: false
    };
  }
};
</script>

<template>
  <div>
    <v-app-bar color="primary" app dark>
      <v-btn class="mx-2" :to="{ name: 'Recommendations' }"> Get Recommendations </v-btn>
      <v-btn class="mx-2" :to="{ name: 'Wishlist' }"> Wishlist </v-btn>
      <v-btn class="mx-2" :to="{ name: 'OwnedBooks' }"> OwnedBooks </v-btn>
      <v-btn class="mx-2" :to="{ name: 'Search' }"> Search </v-btn>
      <v-spacer></v-spacer>

      <v-menu v-model="menuVisible" offset-y>
        <template #activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item :to="{ name: 'Account' }" link>
            <v-list-item-title>Account</v-list-item-title>
          </v-list-item>
          <v-list-item :to="{ name: 'BookDatabasePage' }" link>
            <v-list-item-title>Book Database</v-list-item-title>
          </v-list-item>
          <v-list-item :to="{ name: 'AuthorDatabasePage' }" link>
            <v-list-item-title>Author Database</v-list-item-title>
          </v-list-item>
          <v-list-item :to="{ name: 'GenreDatabasePage' }" link>
            <v-list-item-title>Genre Database</v-list-item-title>
          </v-list-item>
          <v-list-item :to="{ name: 'UserDatabasePage' }" link>
            <v-list-item-title>User Database</v-list-item-title>
          </v-list-item>
          <v-list-item :to="{ name: 'Recommendations' }" link>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu v-if="user !== null" min-width="200px" rounded>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar class="mx-auto text-center" color="accent" size="large">
              <span class="white--text font-weight-bold">{{
                `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
              }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-card-text>
            <div class="mx-auto text-center">
              <v-avatar color="accent">
                <span class="white--text text-h5">{{
                  `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                }}</span>
              </v-avatar>
              <h3>{{ `${user.firstName} ${user.lastName}` }}</h3>
              <p class="text-caption mt-1">
                {{ user.email }}
              </p>
              <v-divider class="my-3"></v-divider>
              <v-btn rounded variant="text" @click="logout()"> Logout </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-app-bar>
  </div>
</template>
