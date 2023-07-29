
<template>
  <v-container class="dashboard-container" fluid>
    <v-row justify="center">
      <v-col v-for="card in cards" :key="card.title" cols="12" md="6" lg="4">
        <v-card class="dashboard-card" @click="goToRoute(card.route)">
          <v-sheet
            class="dashboard-card-content"
            :color="card.backgroundColor"
            height="100%"
            rounded
          >
            <v-row align="center" justify="center" class="fill-height">
              <v-icon class="mr-3">{{ card.icono }}</v-icon>
              <v-col>
                <v-card-title class="text-center">{{ card.title }}</v-card-title>
              </v-col>
            </v-row>
          </v-sheet>
          <v-card-text>{{ card.description }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'firebase/storage';
import { useRouter } from 'vue-router';
const router = useRouter()


const cards = ref([
  {
    title: 'Clientes',
    description: 'Ver Clientes',
    icono: 'mdi-account',
    route: 'listado-clientes',
    backgroundColor: 'indigo',
  },
  {
    title: 'Calendario',
    description: 'Usa Calendario',
    icono: 'mdi-calendar-range',
    route: 'calendario-general',
    backgroundColor: 'orange',
  },
  {
    title: 'Finanzas',
    description: 'Ver finanzas',
    icono: 'mdi-cash-register',
    route: 'contabilidad-finanzas',
    backgroundColor: 'teal',
  },
  {
    title: 'Pendientes de pago',
    description: 'Ve a los pendientes',
    icono: 'mdi-cash-sync',
    route: 'cobros-pendientes',
    backgroundColor: 'purple',
  },
  // Agrega más objetos para tener más cajas
]);

function goToRoute(route) {
 router.push({name: route})
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-card {
  cursor: pointer;
  margin-bottom: 20px;
  height: 100%;
}

.dashboard-card-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100%;
}

/* Estilos para el tamaño de las cajas en vista móvil */
@media (max-width: 599px) {
  .dashboard-card {
    height: auto;
  }
}
</style>
