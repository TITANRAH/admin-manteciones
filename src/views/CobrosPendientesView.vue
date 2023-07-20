
<script setup>
import { ref, onMounted, computed, reactive, onUnmounted } from 'vue';
import { useFirestore } from 'vuefire';
import { getDocs, collection } from "firebase/firestore";
import { propertyPrice, formatedDate } from '@/helpers';

const clientesEnFalse = ref([]);
const isNotMobile = ref(false);
const idCliente = ref('')
const idMantencion = ref('')
const idCosto = ref('')
const totalMontoDeuda = ref('')
const patenteBuscada = ref('')




const handleResize = () => {
  const mobileThreshold = 900; // Puedes ajustar este valor según tus necesidades
  isNotMobile.value = window.innerWidth > mobileThreshold;
};

onMounted(async () => {

  handleResize(); // Ejecuta la función cuando se monta el componente
  window.addEventListener('resize', handleResize); // Agrega un listener para el evento 'resize'
  try {
    const db = useFirestore();
    const clientesSnapshot = await getDocs(collection(db, "clientes"));

    for (const clienteDoc of clientesSnapshot.docs) {
      const mantencionesSnapshot = await getDocs(collection(clienteDoc.ref, "mantenciones"));

      idCliente.value = clienteDoc.id

      for (const mantencionDoc of mantencionesSnapshot.docs) {
        const costosSnapshot = await getDocs(collection(mantencionDoc.ref, "costosMantencion"));
        idMantencion.value = mantencionDoc.id
        if (!costosSnapshot.empty) {
          for (const costoDoc of costosSnapshot.docs) {
            const costosData = costoDoc.data().costos;

            if (Array.isArray(costosData)) {
              costosData.forEach(costo => {
                idCosto.value = costoDoc.id
                const clienteData = clienteDoc.data();
                const cliente = {
                  id: clienteDoc.id,
                  idMantencion: idMantencion.value,
                  idCosto: idCosto.value,
                  patente: clienteData.patenteVehiculo.toLowerCase(),
                  nombre: clienteData.nombreDueño,
                  fechaMantencion: mantencionDoc.data().fechaMantencion,
                  ...costo
                };

                if (cliente.estadoPagoCosto !== true) {
                  clientesEnFalse.value.push(cliente);
                }
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
  }
});

const filtrarPorPatente = () => {
      return clientesEnFalse.value.filter((cliente) => {
        return cliente.patente.includes(patenteBuscada.value.toLowerCase());
      });
    };

const clientesUnique = computed(() => {
  const clientesMap = new Map();

  console.log(clientesEnFalse.value)

  for (const cliente of filtrarPorPatente()) {

    console.log(cliente)
    if (!clientesMap.has(cliente.id)) {
      clientesMap.set(cliente.id, {
        idCliente: cliente.id,
        idMantencion: cliente.idMantencion,
        idCosto: cliente.idCosto,
        nombre: cliente.nombre,
        patente: cliente.patente,
        cantidadServiciosAdeudados: 0,
        totalMontoAdeudado: 0,
        fechaMantencion: cliente.fechaMantencion // Agregamos la fecha de la mantención al objeto del cliente
      });
    }

    const clienteData = clientesMap.get(cliente.id);
    clienteData.cantidadServiciosAdeudados++;
    clienteData.totalMontoAdeudado += parseFloat(cliente.valorServicio);

  }

  totalMontoDeuda.value = Array.from(clientesMap.values()).reduce((total, cliente) => {
    return total + cliente.totalMontoAdeudado;
  }, 0);

  console.log('total monto', totalMontoDeuda)

  return Array.from(clientesMap.values());
});

const getCostoMantencionRoute = (idCliente, idMantencion, idCosto) => {
  return `/costo-mantencion/${idCliente}/${idMantencion}/${idCosto}`;
};


onUnmounted(() => {
  window.removeEventListener('resize', handleResize); // Remueve el listener cuando se desmonta el componente
});

</script>
<template>
  <v-text-field
  label="Buscar por Patente"
  type="text"
  v-model="patenteBuscada"
  @input="filtrarPorPatente($event.target.value)"
></v-text-field>
  <div v-if="isNotMobile">


    <div v-if="clientesUnique.length == []" class="sk-chase">
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
    </div>
    <v-row v-else>
      <v-col cols="12">

        <v-table class="elevation-1">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Patente</th>
              <th>Cantidad de servicios adeudados</th>
              <th>Total monto adeudado</th>
              <th>Fecha de mantención</th>
              <th>Ir a Costo Cliente</th>
            </tr>
          </thead>

          <tbody>

            <tr v-for="(cliente, index) in clientesUnique" :key="index">

              <td>{{ cliente.nombre }}</td>
              <td>{{ cliente.patente }}</td>
              <td>{{ cliente.cantidadServiciosAdeudados }}</td>
              <td>{{ propertyPrice(cliente.totalMontoAdeudado) }}</td>
              <td>{{ formatedDate(cliente.fechaMantencion) }}</td>
              <td><v-btn class="mb-2 mt-2" icon
                  :to="getCostoMantencionRoute(cliente.idCliente, cliente.idMantencion, cliente.idCosto)">
                  <v-icon color="indigo">mdi-car-info</v-icon>
                </v-btn></td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
  </div>

  <div v-else >
    <div v-if="clientesUnique.length == []" class="sk-chase">
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
    </div>
    <v-card v-else class="mt-3" v-for="(cliente, index) in clientesUnique" :key="index">
      <v-list>
        
          <v-list-item>
            <v-list-item-title><b>{{ cliente.nombre }}</b> </v-list-item-title>
            <v-list-item-subtitle>Patente:<b>{{ cliente.patente }}</b>
            </v-list-item-subtitle>
            <v-list-item-subtitle>Cantidad de servicios adeudados:<b>{{ cliente.cantidadServiciosAdeudados }}</b>
            </v-list-item-subtitle>
            <v-list-item-subtitle> Total monto adeudado: <b>{{ propertyPrice(cliente.totalMontoAdeudado)
            }}</b></v-list-item-subtitle>
            <v-list-item-subtitle>Fecha de mantención:<b>{{ formatedDate(cliente.fechaMantencion)
            }}</b></v-list-item-subtitle>
            <v-list-item-subtitle>
              <v-btn color="green" class="mb-2 mt-2"
                :to="getCostoMantencionRoute(cliente.idCliente, cliente.idMantencion, cliente.idCosto)">Ir a Costo
                Cliente</v-btn></v-list-item-subtitle>
          </v-list-item>
       
      </v-list>
    </v-card>
  </div>
  <div class="d-flex justify-start py-5 px-3">
    <div v-if="totalMontoDeuda != ''" class="text-left">
      <div><b>Total Adeudado:</b> {{ propertyPrice(totalMontoDeuda) }}</div>
    </div>
  </div>
</template>
<style>
.sk-chase {
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  position: relative;
  animation: sk-chase 2.5s infinite linear both;
  margin: 0 auto; /* Agrega esta línea para centrar horizontalmente */
}

.sk-chase-dot {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  animation: sk-chase-dot 2.0s infinite ease-in-out both;
}

.sk-chase-dot:before {
  content: '';
  display: block;
  width: 25%;
  height: 25%;
  background-color: indigo;
  border-radius: 100%;
  animation: sk-chase-dot-before 2.0s infinite ease-in-out both;
}

.sk-chase-dot:nth-child(1) {
  animation-delay: -1.1s;
}

.sk-chase-dot:nth-child(2) {
  animation-delay: -1.0s;
}

.sk-chase-dot:nth-child(3) {
  animation-delay: -0.9s;
}

.sk-chase-dot:nth-child(4) {
  animation-delay: -0.8s;
}

.sk-chase-dot:nth-child(5) {
  animation-delay: -0.7s;
}

.sk-chase-dot:nth-child(6) {
  animation-delay: -0.6s;
}

.sk-chase-dot:nth-child(1):before {
  animation-delay: -1.1s;
}

.sk-chase-dot:nth-child(2):before {
  animation-delay: -1.0s;
}

.sk-chase-dot:nth-child(3):before {
  animation-delay: -0.9s;
}

.sk-chase-dot:nth-child(4):before {
  animation-delay: -0.8s;
}

.sk-chase-dot:nth-child(5):before {
  animation-delay: -0.7s;
}

.sk-chase-dot:nth-child(6):before {
  animation-delay: -0.6s;
}

@keyframes sk-chase {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes sk-chase-dot {

  80%,
  100% {
    transform: rotate(360deg);
  }
}

@keyframes sk-chase-dot-before {
  50% {
    transform: scale(0.4);
  }

  100%,
  0% {
    transform: scale(1.0);
  }
}</style>