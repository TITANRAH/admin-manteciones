  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  const cards = ref([
    {
      title: 'Calendario General',
      description: 'Gestiona tus eventos, edítalos, crea clientes a partir de aquí si gustas, etc.',
      route: 'calendario-general',
      icono: 'mdi-calendar-clock-outline'
    },
    {
      title: 'Cobros Pendientes',
      description: 'Aquí encontrarás a los clientes con deuda, podrás además ir al costo asociado y editarlo',
      route: 'cobros-pendientes',
      icono: 'mdi-account-cash'
    },
    {
      title: 'Clientes',
      description: 'Aquí encontrarás a todos tus clientes, podrás enviarles correos o verlos por detalle',
      route: 'listado-clientes',
      icono: 'mdi-account-group'
    }
  ]);
  
  const router = useRouter();
  
  const goToRoute = (name) => {
    router.push({name: name});
  };
  </script>
<template>
    <v-container class="dashboard-container" fluid>
      <v-row justify="center">
        <v-col cols="12" md="6" lg="4" v-for="card in cards" :key="card.title">
          <v-card class="dashboard-card" @click="goToRoute(card.route)">
            <v-card-title class="bg-indigo">
            <v-icon class="mr-3">{{ card.icono }}</v-icon>  {{ card.title }}
            </v-card-title>
            <v-card-text>
              {{ card.description }}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  
  <style scoped>
  .dashboard-container {
    padding: 20px;
  }
  
  .dashboard-card {
    cursor: pointer;
    margin-bottom: 20px;
  }
  
 
  </style>
<!-- <v-btn :to="{name: 'calendario-general'}">Calendario General</v-btn>
<v-btn :to="{name: 'cobros-pendientes'}">Cobros Pendientes</v-btn> -->