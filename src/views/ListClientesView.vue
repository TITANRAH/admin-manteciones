<script setup>
import { ref, onMounted, computed } from 'vue';
import { collection, getDocs, getDoc, doc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from 'vuefire';
import useMantenciones from '../composables/useMaintenance';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
const router = useRouter()
const { sendMailDialog, enviarWhatsapp } = useMantenciones();
const db = useFirestore();
const clientes = ref([]);
const selectedImage = ref('');
const showStates = ref([]);
const dialog = ref(false);
const asunto = ref('');
const descripcion = ref('');
const correoCliente = ref('')
const searchTerm = ref('');


const openEmailModal = (correo) => {
  correoCliente.value = correo
  dialog.value = true;
};

const closeEmailModal = () => {
  dialog.value = false;
  asunto.value = '';
  descripcion.value = '';
}

const sendEmail = () => {
  sendMailDialog(correoCliente.value, asunto.value, descripcion.value);
  closeEmailModal();
};

onMounted(async () => {
  try {
    const clientesCollectionRef = collection(db, 'clientes');
    const clientesSnapshot = await getDocs(clientesCollectionRef);
    const clientesMap = {}; // Objeto auxiliar para evitar duplicaciones
    for (const clienteDoc of clientesSnapshot.docs) {
      const mantencionesCollectionRef = collection(clienteDoc.ref, 'mantenciones');
      const mantencionesSnapshot = await getDocs(mantencionesCollectionRef);

      const clienteData = clienteDoc.data();
      const clienteId = clienteDoc.id;

      // Verificar si el cliente ya ha sido agregado
      if (!clientesMap[clienteId]) {
        clientesMap[clienteId] = true; // Marcar el cliente como agregado
        const cliente = {
          id: clienteId,
          nombreCliente: clienteData.nombreDueño,
          correoCliente: clienteData.correoDueño,
          foto: clienteData.imagen,
          fonoCliente: clienteData.fonoDueño,
          patenteVehiculo: clienteData.patenteVehiculo,
          mantencionesRealizadas: [],
        };
        clientes.value.push(cliente);
      }

      for (const mantencionDoc of mantencionesSnapshot.docs) {
        const mantencionData = mantencionDoc.data();
        const clienteIndex = clientes.value.findIndex(c => c.id === clienteId);

        if (clienteIndex !== -1) {
          clientes.value[clienteIndex].mantencionesRealizadas.push({
            idMantencion: mantencionDoc.id,
            fechaMantencion: mantencionData.fechaMantencion,
            descripcion: mantencionData.detalleVehiculo
            // Otros campos de la mantención si los tienes en la base de datos
          });

          clientes.value[clienteIndex].mantencionesRealizadas.sort((a, b) => {
            const fechaA = new Date(a.fechaMantencion);
            const fechaB = new Date(b.fechaMantencion);
            return fechaB - fechaA;
          });
        }
      }
    }
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
  }
});

const filteredClientes = computed(() => {
  const searchTermLower = searchTerm.value.toLowerCase().trim();
  return clientes.value.filter(cliente => {
    const nombreLower = cliente?.nombreDueño?.toLowerCase() || '';
    const patenteLower = cliente?.patenteVehiculo?.toLowerCase() || '';
    return nombreLower.includes(searchTermLower) || patenteLower.includes(searchTermLower);
  });
});

const irAmantencion = (idCliente, idMantencion) => {
  console.log(idCliente)
  console.log(idMantencion)
  router.push({ name: 'mantencion-cliente', params: { idCliente: idCliente, id: idMantencion } })
}

const irAcliente = (idCliente) => {
  router.push({ name: 'cliente', params: { id: idCliente } })
}


const eliminarCliente = async (clienteId) => {
  try {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará al cliente y todas sus mantenciones con sus costos asociados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const clientesCollectionRef = collection(db, 'clientes');
      const clienteDoc = await getDoc(doc(clientesCollectionRef, clienteId));

      if (clienteDoc.exists()) {
        // Eliminar las mantenciones del cliente y sus subcolecciones (costosAsociados)
        const mantencionesCollectionRef = collection(clienteDoc.ref, 'mantenciones');
        const mantencionesSnapshot = await getDocs(mantencionesCollectionRef);
        for (const mantencionDoc of mantencionesSnapshot.docs) {
          // Eliminar la subcolección costosAsociados
          const costosAsociadosCollectionRef = collection(mantencionDoc.ref, 'costosMantencion');
          const costosAsociadosSnapshot = await getDocs(costosAsociadosCollectionRef);
          for (const costoDoc of costosAsociadosSnapshot.docs) {
            await deleteDoc(costoDoc.ref);
          }

          // Eliminar la mantención
          await deleteDoc(mantencionDoc.ref);
        }

        // Eliminar el cliente de la colección de clientes
        await deleteDoc(clienteDoc.ref);

        // Actualizar la lista de clientes después de eliminar el cliente
        const nuevosClientesSnapshot = await getDocs(clientesCollectionRef);
        clientes.value = nuevosClientesSnapshot.docs.map((doc) => {
          const clienteData = doc.data();
          return {
            id: doc.id,
            nombreCliente: clienteData.nombreDueño,
            correoCliente: clienteData.correoDueño,
            foto: clienteData.imagen,
            fonoCliente: clienteData.fonoDueño,
            patenteVehiculo: clienteData.patenteVehiculo,
            mantencionesRealizadas: [],
          };
        });

        // Mostrar un swal de éxito
        Swal.fire({
          title: '¡Cliente eliminado!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        console.error("El cliente no existe");
      }
    }
  } catch (error) {
    console.error("Error al eliminar el cliente:", error);
  }
};
</script>
<template>
  <v-text-field v-model="searchTerm" label="Buscar por nombre o patente" class="mb-4"></v-text-field>
  <v-card-subtitle class="text-h5 py-5 px-3 text-indigo mb-6">
    Tus Clientes
  </v-card-subtitle>
  <div class="cards">
    <v-card class="mx-auto mb-4 bg-indigo card" v-for="(cliente, index) of filteredClientes" :key="index">
      <div class="card-image">
        <v-img :src="cliente.foto" height="200px" cover></v-img>
        <v-btn :icon="true" class="delete-icon bg-red  mt-2 mr-2" @click="eliminarCliente(cliente.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
      <v-card-title>
        {{ cliente.nombreDueño }}
      </v-card-title>
      <v-card-subtitle>
        <b>Nombre:</b> {{ cliente.nombreCliente }}
      </v-card-subtitle>
      <v-card-subtitle>
        <b>Patente:</b> {{ cliente.patenteVehiculo }}
      </v-card-subtitle>
      <v-card-subtitle class="py-5 ml-5 mr-5">
        <v-row class="d-flex btn">
          <v-btn size="40" class="mr-3 bg-red" icon
            @click="openEmailModal(cliente.correoCliente)"><v-icon>mdi-email</v-icon></v-btn>
          <v-btn size="40" class="mr-3 bg-green" icon
            @click="enviarWhatsapp(cliente.fonoCliente, cliente.nombreCliente)"><v-icon>mdi-whatsapp</v-icon></v-btn>
          <a :href="`tel:${cliente.fonoCliente}`"><v-btn size="40" class="mr-3 bg-yellow"
              icon><v-icon>mdi-phone</v-icon></v-btn></a>
          <v-btn size="40" @click="irAcliente(cliente.id)" class="mr-3 bg-black" icon><v-icon>mdi-pencil</v-icon></v-btn>
        </v-row>
      </v-card-subtitle>
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title>Enviar correo</v-card-title>
          <v-card-text>
            <v-form ref="emailForm">
              <v-text-field v-model="asunto" label="Asunto"></v-text-field>
              <v-textarea v-model="descripcion" label="Descripción"></v-textarea>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="sendEmail()">Enviar</v-btn>
            <v-btn @click="closeEmailModal()">Cancelar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <h3 class="sin-mantenciones" v-if="cliente.mantencionesRealizadas.length == []">Sin Mantenciones aún</h3>
      <v-card-actions v-else>
        <h3 variant="text">
          Mantenciones
        </h3>
        <v-spacer></v-spacer>
        <v-btn :icon="showStates[index] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="showStates[index] = !showStates[index]"></v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="showStates[index]">
          <v-card-text v-for="mantencion of cliente.mantencionesRealizadas">
            <div class="boton-ir">
              <span>{{ mantencion.fechaMantencion }} </span>
              <v-btn @click="irAmantencion(cliente.id, mantencion.idMantencion)" class="bg-light">Ir
                <v-icon>mdi-arrow-right</v-icon></v-btn>
            </div>
          </v-card-text>

        </div>
      </v-expand-transition>
    </v-card>
  </div>
</template>

<style scoped>
.cards {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: left;
}
.delete-icon {
  position: absolute;
  top: 0;
  right: 0;
}


.sin-mantenciones {
  margin-top: 1rem;
  text-align: center;
  font-size: 14px;
  color: fff;
}

.card {
  width: 250px;
}

.boton-ir {

  display: flex;
  justify-content: space-around;
  align-items: center;
}

.btn {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

@media (max-width: 900px) {

  .card {
    width: 500px !important;
  }

  .btn {
    display: flex;
    justify-content: center;
  }
}</style>