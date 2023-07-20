<script setup>

import { ref, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { useFirestore } from 'vuefire';
import useMantenciones from '../composables/useMaintenance';

const { sendMailDialog } = useMantenciones()
const db = useFirestore();
const clientes = ref([]);

onMounted(async () => {
  const clientesCollectionRef = collection(db, 'clientes');
  const querySnapshot = await getDocs(clientesCollectionRef);
  
  clientes.value = querySnapshot.docs.map((doc) => doc.data());
});

</script>
<template>
    <div>

        <div>
    <h2>Listado de Clientes</h2>
    <ul>
      <li @click="sendMailDialog(cliente.correoDueño, 'HOLA', 'HOLA')" v-for="cliente in clientes" :key="cliente.id">{{ cliente.correoDueño }}</li>
    </ul>
  </div>

    </div>
</template>


<style></style>