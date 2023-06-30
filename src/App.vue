<script setup>
import { RouterLink, RouterView } from 'vue-router'
import LogoTuercas from '../src/assets/img/logo-tuercas.png'
import { ref } from 'vue';


const drawer = ref(true)

const toggle = () => {
  drawer.value = !drawer.value
}

</script>

<template>
  <v-card elevation="1" max-width="1200" class="mx-auto">
    <v-layout>
      <v-app-bar class="bg-indigo">
        <!-- esto ubica el elemento al lado izquierdo -->
        <template v-slot:prepend>
          <v-btn :icon="drawer ? 'mdi-close' : 'mdi-menu'" @click="toggle()"></v-btn>
        </template>
        <!-- esto ubica el elemento al lado izquierdo -->
        <template v-slot:append>
          <div>
            <v-btn :to="{name: 'agregar-mantencion'}">
              Agregar Mantención
            </v-btn>
            <v-btn icon="mdi-logout">
            </v-btn>
          </div>
          <div>
            <v-btn :to="{ name: 'login' }" icon="mdi-login">
            </v-btn>
          </div>
        </template>
      </v-app-bar>
      <v-navigation-drawer class="bg-indigo" temporary v-model="drawer">
        <v-list-item color="#FFF" :prepend-avatar="LogoTuercas" title="TUERCAS" nav>
        
        </v-list-item>

        <v-divider></v-divider>

        <v-list density="compact" nav >
          <v-list-item prepend-icon="mdi-car-arrow-right" @click="toggle()" title="Agregar Mantención" value="car" :to="{name: 'agregar-mantencion'}"></v-list-item>
          <v-list-item prepend-icon="mdi-account-group-outline" @click="toggle()" title="Clientes" value="clientes"></v-list-item>
          <v-list-item prepend-icon="mdi-car-settings" title="Dashboard" @click="toggle()" value="dashboard" :to="{name: 'dashboard'}"></v-list-item>
          <v-list-item prepend-icon="mdi-logout" title="Salir" @click="toggle()" value="salir" :to="{name: 'login'}"></v-list-item>

        </v-list>
      </v-navigation-drawer>

      <v-main>
        <v-container>
          <RouterView />
        </v-container>
      </v-main>

    </v-layout>
  </v-card>
</template>

<style></style>
