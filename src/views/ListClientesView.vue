<script setup>
import { formatedDate } from '@/helpers';
import { collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { deleteObject, ref as storageRef } from 'firebase/storage';
import Swal from 'sweetalert2';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFirebaseStorage, useFirestore } from 'vuefire';
import useMantenciones from '../composables/useMaintenance';
const router = useRouter()
const { sendMailDialog, enviarWhatsapp, sendMail } = useMantenciones();
const db = useFirestore();
const storage = useFirebaseStorage()
const clientes = ref([]);
const showStates = ref([]);
const dialog = ref(false);
const asunto = ref('');
const descripcion = ref('');
const correoCliente = ref('')
const searchTerm = ref('');
const contactar = ref(null);
const fechaFormateada = ref('')

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
 
      if (!clientesMap[clienteId]) {
        clientesMap[clienteId] = true; 
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
        console.log(mantencionData.contactarCliente)
        if (clienteIndex !== -1) {
          clientes.value[clienteIndex].mantencionesRealizadas.push({
            idMantencion: mantencionDoc.id,
            fechaMantencion: mantencionData.fechaMantencion,
            descripcion: mantencionData.detalleVehiculo,
            contactarCliente: mantencionData.contactarCliente       
          });

          console.log('contactarCliente', mantencionData.contactarCliente)

          clientes.value[clienteIndex].mantencionesRealizadas.sort((a, b) => {
            const fechaA = new Date(a.fechaMantencion);
            const fechaB = new Date(b.fechaMantencion);
            return fechaB - fechaA;
          });
        }
        calculoFechaProximaMantencion(mantencionData.fechaMantencion, mantencionDoc.id, mantencionData.contactarCliente, clienteDoc.id)
      }
    }
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
  }
});

const filteredClientes = computed(() => {
  const searchTermLower = searchTerm.value.toLowerCase().trim();
  return clientes.value.filter(cliente => {
    const nombreLower = cliente?.nombreCliente?.toLowerCase() || '';
    const patenteLower = cliente?.patenteVehiculo?.toLowerCase() || '';
    return nombreLower.includes(searchTermLower) || patenteLower.includes(searchTermLower);
  });
});

// const cambiarCampo = async (idCliente, idMantencion, bool) => {
//   const clienteRef = doc(db, 'clientes', idCliente);
//   const mantencionRef = doc(clienteRef, 'mantenciones', idMantencion);

//   const data = {
//     contactarCliente: bool,
//   };
//   try {
//     await updateDoc(mantencionRef, data);
//     console.log('Documento de mantención actualizado correctamente.');
//   } catch (error) {
//     console.error('Error al actualizar el documento de mantención:', error);
//   }
// };
// const calculoFechaProximaMantencion = (fecha, idMantencion, contactarCliente, idCliente) => {
//   // console.log('fecha desde mantencion', fecha)
//   // const fechaOriginal = new Date(props.mantencion?.fechaMantencion fecha);
//   const fechaOriginal = new Date(fecha);
//   // console.log('fecha original ', fechaOriginal)
//   const fechaCalculada = new Date(fechaOriginal.getFullYear(), fechaOriginal.getMonth() + 6, fechaOriginal.getDate());
//   fechaFormateada.value = `${fechaCalculada.getDate()}-${fechaCalculada.getMonth() + 1}-${fechaCalculada.getFullYear()}`;
//   // console.log('fecha formateada y calculada', fechaFormateada.value)
//   const tiempoRestante = fechaCalculada.getTime() - Date.now();
//   const semanas = Math.ceil(tiempoRestante / (1000 * 60 * 60 * 24 * 7));
//   const semanasRestantes = semanas;
//   // console.log('semanasRestantes.value', semanasRestantes)
//   //  console.log('contactar Cliente desde compsable', contactarCliente.value)

//   if (semanasRestantes >= 0 && semanasRestantes <= 2 ) {
//     console.log('se cumple la condicion de semanas y es true')
//     contactar.value = true;
//     cambiarCampo(idCliente, idMantencion, true)
//     if (contactarCliente == false) {
//       cambiarCampo(idCliente, idMantencion, true)
//       contactar.value = true;
//     }
//   } else {
//     console.log('no se cumple la condicion de semanas')
//     contactar.value = false
//     cambiarCampo(idCliente, idMantencion, false)
//     if (contactarCliente == true) {
//       cambiarCampo(idCliente, idMantencion, false)
//       contactar.value = false;
//     }
//   }
// };

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
    
        const mantencionesCollectionRef = collection(clienteDoc.ref, 'mantenciones');
        const mantencionesSnapshot = await getDocs(mantencionesCollectionRef);
        for (const mantencionDoc of mantencionesSnapshot.docs) {
  
          const costosAsociadosCollectionRef = collection(mantencionDoc.ref, 'costosMantencion');
          const costosAsociadosSnapshot = await getDocs(costosAsociadosCollectionRef);
          for (const costoDoc of costosAsociadosSnapshot.docs) {
            await deleteDoc(costoDoc.ref);
          }
       
          await deleteDoc(mantencionDoc.ref);
        } 
        const { imagen } = clienteDoc.data()
        console.log('producto en firebase desde delete', imagen)
        const imageRef = storageRef(storage, imagen)

        await Promise.all([
          deleteDoc(clienteDoc.ref),
          deleteObject(imageRef)
        ])
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
  <v-btn class="bg-indigo mb-5" :to="{ name: 'dashboard' }">Ir a Dashboard</v-btn>
  <v-text-field v-if="filteredClientes.length != 0" v-model="searchTerm" label="Buscar por nombre o patente" class="mb-4"></v-text-field>
  <v-card-subtitle class="text-h5 py-5 px-3 text-indigo mb-6">
   {{filteredClientes.length != 0 ? 'Tus Clientes' : 'Sin Clientes aún, ve a crear Cliente'  }} 
  </v-card-subtitle>
  <div class="cards">
    <v-card class="mx-auto mb-4 card" :class="cliente.mantencionesRealizadas.contactarCliente ? 'bg-red' : 'bg-indigo'"
      min-width="300" v-for="(cliente, index) in filteredClientes" :key="index"> 
      <div class="card-image">
        <v-img :src="cliente.foto" height="200px" cover></v-img>
        <v-btn :icon="true" class="delete-icon bg-red  mt-2 mr-2" @click="eliminarCliente(cliente.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>   
      <div v-for="mantencion in cliente.mantencionesRealizadas">
       <v-btn @click="showStates[index] = !showStates[index]" v-if="mantencion.contactarCliente == true" class="badge" icon> <v-icon color="red" size="30"  >mdi-bell-badge</v-icon> </v-btn>      
      </div>
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
          <v-btn size="40" @click="irAcliente(cliente.id)" class="mr-3 bg-purple" icon><v-icon size="25">mdi-history</v-icon></v-btn>
        </v-row>
      </v-card-subtitle>
      <v-dialog v-model="dialog" max-width="500px">
        <v-card max-width="800">
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
      <h3 class="sin-mantenciones" v-if="cliente.mantencionesRealizadas.length == []">Sin Mantenciones Nuevas</h3>
      <v-card-actions v-else>
        <h4>
          Mantenciones activas
        </h4>
        <v-spacer></v-spacer>
        <v-btn :icon="showStates[index] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="showStates[index] = !showStates[index]"></v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="showStates[index]">
          <v-card-text v-for="mantencion of cliente.mantencionesRealizadas"
            :class="mantencion.contactarCliente ? 'bg-red' : 'bg-indigo'">           
            <v-row>
              <v-col>
                <div class="boton-ir">
                  <span>{{ formatedDate(mantencion.fechaMantencion) }} </span>
                  <v-btn @click="irAmantencion(cliente.id, mantencion.idMantencion)" class="bg-light">Ir
                    <v-icon>mdi-arrow-right</v-icon></v-btn>
                  </div>                 
                </v-col>             
                <v-col v-if="mantencion.contactarCliente">
                  <v-btn @click="sendMail(cliente.correoCliente, cliente.nombreCliente)" class="bg-light">Aviso de Mantención
                  </v-btn>               
              </v-col>
            </v-row>
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
  max-height: 60vh;
  overflow-y: scroll;
  margin-bottom: 1rem;

}

.delete-icon {
  position: absolute;
  top: 0;
  right: 0;
}

.badge{
  position: absolute;
  top: 0;
  right: 1;
  margin-left: 0.5rem;
  margin-top: 0.5rem;
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
}
</style>