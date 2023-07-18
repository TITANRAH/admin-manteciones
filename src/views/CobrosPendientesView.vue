<script setup>
import { ref, onMounted } from 'vue';
import { useFirestore } from 'vuefire';
import { getDocs, collection, where, query } from "firebase/firestore";

const clientesEnFalse = ref([]);

onMounted(async () => {
  try {
    const db = useFirestore();
    console.log(db);

    const clientesSnapshot = await getDocs(collection(db, "clientes"));
    console.log(clientesSnapshot.docs);

    for (const clienteDoc of clientesSnapshot.docs) {
      const mantencionesSnapshot = await getDocs(collection(clienteDoc.ref, "mantenciones"));

      for (const mantencionDoc of mantencionesSnapshot.docs) {
        console.log("Mantención:", mantencionDoc.id);
        const costosSnapshot = await getDocs(collection(mantencionDoc.ref, "costosMantencion"));

        if (!costosSnapshot.empty) {
          for (const costoDoc of costosSnapshot.docs) {
            console.log("Costo:", costoDoc.id);
            console.log("Datos del costo:", costoDoc.data());
            const costosData = costoDoc.data().costos; // Obtener los datos del campo costos

            if (Array.isArray(costosData)) {
              // Agregar cada elemento del array costosData a clientesEnFalse
              costosData.forEach(costo => {
                const clienteData = clienteDoc.data();
                const cliente = {
                  id: clienteDoc.id,
                  nombre: clienteData.nombreDueño,
                  ...costo  // Operador spread para agregar los datos de costo al cliente
                };

                if(cliente.estadoPagoCosto != true){

                    clientesEnFalse.value.push(cliente);
                    console.log("Cliente agregado:", cliente);

                }

              });
            }
          }
        }
      }
    }

    clientesEnFalse.value.sort((a, b) => a.nombre.localeCompare(b.nombre));

    console.log(clientesEnFalse.value);
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
  }
});

</script>


<template>
   
</template>


<style></style>