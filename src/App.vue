<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue';


const rail = true
const drawer = ref(true)


const toggle = () => {
  drawer.value = !drawer.value
}

</script>


<template>

<v-card elevation="3" max-width="1200" class="mx-auto">

<v-layout>
  <v-app-bar color="blue-darken-1">

    <template v-slot:prepend>
      <v-btn @click="toggle()" icon="mdi-menu"></v-btn>
    </template>
  </v-app-bar>

    <v-navigation-drawer app color="#2784ff" v-model="drawer" @click="toggle()">
        <v-list-item prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg" title="John Leider" nav>
          <template v-slot:append>
            <v-btn variant="text" icon="mdi-chevron-left" @click.stop="rail = !rail"></v-btn>
          </template>
        </v-list-item>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item prepend-icon="mdi-home-city" title="Home" value="home"></v-list-item>
          <v-list-item prepend-icon="mdi-account" title="My Account" value="account"></v-list-item>
          <v-list-item prepend-icon="mdi-account-group-outline" title="Users" value="users"></v-list-item>
        </v-list>
      </v-navigation-drawer>

    <!-- esto ubica el elemento al lado derecho -->
   
  




  <v-main>
    <v-container>
      <RouterView />

    </v-container>
  </v-main>

</v-layout>
</v-card>
 

 
</template>

<style scoped></style>
