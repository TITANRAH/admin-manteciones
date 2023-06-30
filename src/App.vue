<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import LogoTuercas from '../src/assets/img/logo-tuercas.png'
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const route = useRoute()
const auth = useAuthStore()
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
          <v-btn v-if="route.name !== 'agregar-mantencion' && auth.isAuth" :to="{name: 'agregar-mantencion'}">
            Agregar Mantención
          </v-btn>
          <div v-if="auth.isAuth">
            <v-btn @click="auth.logout()" icon="mdi-logout">
            </v-btn>
          </div>
          <div v-else >
            <v-btn v-if="route.name !== 'login'" :to="{ name: 'login' }" icon="mdi-login">
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
          <v-list-item v-if="auth.isAuth" prepend-icon="mdi-logout" title="Salir" @click="auth.logout()" value="salir" :to="{name: 'login'}"></v-list-item>

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
