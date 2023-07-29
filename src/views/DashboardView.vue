<template>
   <h2 class="reporte-title text-indigo" > <u>DASHBOARD</u> </h2>
  <div class="dashboard-container">

   
    <div class="dashboard-card" v-for="card in cards" :key="card.title" @click="goToRoute(card.route)">
      <div class="dashboard-card-content" :style="{ backgroundColor: card.backgroundColor }">
        <v-icon class="material-icons" style="font-size: 50px;">{{ card.icono }}</v-icon>
        <div class="card-title">{{ card.title }}</div>
        <div class="card-description">{{ card.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'firebase/storage';
import { useRouter } from 'vue-router';
const router = useRouter();

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
  router.push({ name: route });
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  grid-gap: 20px;
}

.dashboard-card {
  cursor: pointer;
}

.dashboard-card-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100%;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

.dashboard-card-content:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.material-icons {
  margin-bottom: 10px;
  color: white;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  color: white;
}

.card-description {
  font-size: 14px;
  color: #555;
  color: white;
}
</style>
