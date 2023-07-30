<script setup>
import { validacionSchema } from '@/validations/mantencionesSchema';
import { collection, doc, getDoc, updateDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { useField, useForm } from 'vee-validate';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFirestore } from 'vuefire';
import Swal from 'sweetalert2';


const router = useRouter()
const route = useRoute();
const db = useFirestore();
const mantencion = ref({});
const disableEdit = ref(true)
const showEdit = ref(false)
const costoAsociadoId = ref('')
const siHayCostoAsociado = ref(false)
//ARRAY PARA LOS KM EN LA VISTA
const cadaCuantosKm = [10000, 15000]

onMounted(async () => {
  const clienteRef = doc(db, 'clientes', route.params.idCliente);
  const mantencionesCollectionRef = collection(clienteRef, 'mantenciones');
  const mantencionDocRef = doc(mantencionesCollectionRef, route.params.id);
  const mantencionDocSnap = await getDoc(mantencionDocRef);
  if (mantencionDocSnap.exists()) {
    mantencion.value = {
      id: route.params.id,
      ...mantencionDocSnap.data()
    };

    console.log('Mantencion:', mantencion.value);

    // Verificar si existen costos asociados a esta mantención
    const costosMantencionRef = collection(
      mantencionDocRef,
      'costosMantencion'
    );
    const costosQuerySnapshot = await getDocs(costosMantencionRef);
    console.log('costo asociado', costosQuerySnapshot)
    const tieneCostos = !costosQuerySnapshot.empty;

    if (tieneCostos) {


      costosQuerySnapshot.forEach((doc) => {
        costoAsociadoId.value = doc.id;
      });

      siHayCostoAsociado.value = true
      Swal.fire({
        title: 'Atención',
        text: 'Esta mantención ya tiene costos asociados',
        showCancelButton: true,
        confirmButtonText: 'Ir a costo asociado',
      //  cancelButtonText: 'Cerrar y Editar Mantención',
        reverseButtons: true,
        icon: 'question',
        allowOutsideClick: true,
      }).then((result) => {
        if (result.isConfirmed) {
          // Redirigir a la página de "mantenciones"
          router.push({
            name: 'costo-mantencion',
            params: {
              idCliente: route.params.idCliente,
              idMantencion: route.params.id,
              idCosto: costoAsociadoId.value
            }
          });
          // router.push({ name: 'crear-costo', params: {id:docRef.id} })
        }
      });

    } else {
      siHayCostoAsociado.value = false
    }
  } else {
    console.log('La mantención no existe');
  }

});

const { handleSubmit } = useForm({
  validationSchema: {
    ...validacionSchema,
  }
})


//CAMPOS TEXTFIELD FORMULARIO
const fechaMantencion = useField('fechaMantencion')
const aceiteDescripcion = useField('aceiteDescripcion')
const detallesVehiculo = useField('detallesVehiculo')
const cambioAceite = useField('cambioAceite')

const filtroAire = useField('filtroAire', null, {
  initialValue: false
})
const filtroAceite = useField('filtroAceite', null, {
  initialValue: false
})
const bujias = useField('bujias', null, {
  initialValue: false
})

const aceite = useField('aceite', null, {
  initialValue: false
})
const polen = useField('polen', null, {
  initialValue: false
})
const usoLaboral = useField('usoLaboral', null, {
  initialValue: false
})
const usoFamiliar = useField('usoFamiliar', null, {
  initialValue: false
})
const revisiones = useField('revisiones', null, {
  initialValue: false
})
const niveles = useField('niveles', null, {
  initialValue: false
})
const inspeccionVisualMotor = useField('inspeccionVisualMotor', null, {
  initialValue: false
})
const correas = useField('correas', null, {
  initialValue: false
})
const fugas = useField('fugas', null, {
  initialValue: false
})
const trenDelantero = useField('trenDelantero', null, {
  initialValue: false
})
const refrigeracion = useField('refrigeracion', null, {
  initialValue: false
})
const frenosDelanteros = useField('frenosDelanteros', null, {
  initialValue: false
})
const frenosTraseros = useField('frenosTraseros', null, {
  initialValue: false
})
const neumaticos = useField('neumaticos', null, {
  initialValue: false
})
const bateria = useField('bateria', null, {
  initialValue: false
})
const scanner = useField('scanner', null, {
  initialValue: false
})
// FIN CAMPOS TEXTFIELD FORMULARIO



watch(mantencion, (mantencion) => {

  fechaMantencion.value.value = mantencion.fechaMantencion
  aceiteDescripcion.value.value = mantencion.aceiteDescripcion
  detallesVehiculo.value.value = mantencion.detallesVehiculo
  cambioAceite.value.value = mantencion.cambioAceite
  filtroAire.value.value = mantencion.filtroAire
  bujias.value.value = mantencion.bujias
  aceite.value.value = mantencion.aceite
  correas.value.value = mantencion.correas
  niveles.value.value = mantencion.niveles
  polen.value.value = mantencion.polen
  usoLaboral.value.value = mantencion.usoLaboral
  usoFamiliar.value.value = mantencion.usoFamiliar
  revisiones.value.value = mantencion.revisiones
  inspeccionVisualMotor.value.value = mantencion.inspeccionVisualMotor
  fugas.value.value = mantencion.fugas
  trenDelantero.value.value = mantencion.trenDelantero
  refrigeracion.value.value = mantencion.refrigeracion
  frenosDelanteros.value.value = mantencion.frenosDelanteros
  frenosTraseros.value.value = mantencion.frenosTraseros
  neumaticos.value.value = mantencion.neumaticos
  bateria.value.value = mantencion.bateria
  scanner.value.value = mantencion.scanner
})



//  // Guardar en el historialMantenciones
//  const historialRef = collection(db, 'mantenciones', docRef.id, 'historialMantenciones');
//   const historialDocRef = await addDoc(historialRef, {
//     ...mantencion,
//     imagen: url.value,
//     fecha: new Date(), // Agrega la fecha actual o cualquier otra información que desees almacenar
//   });

//   console.log("documento guardado con ID: ", docRef.id);
//   console.log('Historial guardado con ID:', historialDocRef.id);


const submit = handleSubmit(async (values) => {

  const { ...mantencion } = values
  const clienteId = route.params.idCliente;
  const mantencionId = route.params.id;

  const clienteRef = doc(db, 'clientes', clienteId);
  const mantencionesCollectionRef = collection(clienteRef, 'mantenciones');
  const mantencionDocRef = doc(mantencionesCollectionRef, mantencionId);

  // Actualizar los campos necesarios de la mantención
  await updateDoc(mantencionDocRef, {
    ...mantencion
  });

  const costosMantencionRef = collection(mantencionDocRef, 'costosMantencion');
  const costosQuerySnapshot = await getDocs(costosMantencionRef);

  if (!costosQuerySnapshot.empty) {
    const deletePromises = costosQuerySnapshot.docs.map(async (doc) => {
      await deleteDoc(doc.ref);
    });

    await Promise.all(deletePromises);
    console.log('Costos eliminados correctamente');
    siHayCostoAsociado.value = false

  } else {
    console.log('no habia costo que eliminar')
  }
  // Mostrar un mensaje de éxito
  Swal.fire({
    title: '¿Deseas crear costos para esta nueva esta Mantención?',
    showCancelButton: true,
    confirmButtonText: 'Costos de Mantención',
    cancelButtonText: 'ir a Calendario',
    reverseButtons: true,
    icon: 'question',
  }).then((result) => {
    if (result.isConfirmed) {
      // Redirigir a la página de "mantenciones"
      router.push({ name: 'crear-costo', params: { idCliente: clienteId, idMantencion: mantencionId } });
      // router.push({ name: 'crear-costo', params: {id:docRef.id} })
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // Redirigir a la página de "crear un costo asociado"
      router.push({ name: 'calendario-general' })
    }
  });
});

const handleEdit = () => {
  showEdit.value = true
  disableEdit.value = false
}

const handleIrAcostoAsociado = () => {
  router.push({
    name: 'costo-mantencion',
    params: {
      idCliente: route.params.idCliente,
      idMantencion: route.params.id,
      idCosto: costoAsociadoId.value
    }
  })
}



</script>

<template>
  <div>

    <v-card max-width="800" flat class="mx-auto my-10">
      <v-btn class="bg-indigo mb-5" :to="{ name: 'cliente', params: { id: route.params.idCliente } }">Ir a Cliente</v-btn>
     
      <v-card-title class="text-h4 font-weight-bold text-indigo" tag="h3">
       {{ !disableEdit ? 'Editar Mantención' : 'Mantención' }} 
      </v-card-title>




      <v-form class="mt-10">

        <v-card-subtitle class="text-h5 py-5 px-0 text-indigo">
          Uso del Vehículo
        </v-card-subtitle>

        <v-row>
          <v-col cols="6" md="4">
            <v-checkbox :disabled="disableEdit" label="Uso Familiar" v-model="usoFamiliar.value.value" />
          </v-col>
          <v-col cols="6" md="4">
            <v-checkbox :disabled="disableEdit" label="Uso Laboral" v-model="usoLaboral.value.value" />
          </v-col>
        </v-row>

        <v-divider></v-divider>

        <v-card-subtitle class="text-h5 py-5 px-0 text-indigo">
          Datos de Mantención
        </v-card-subtitle>

        <v-row>


          <v-col cols="12" md="3">
            <v-text-field type="date" label="Fecha Mantención (Hoy)" v-model="fechaMantencion.value.value"
              :error-messages="fechaMantencion.errorMessage.value" />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="4">
            <v-checkbox :disabled="disableEdit" label="¿Cambio de aceite?" v-model="aceite.value.value" />
          </v-col>

          <v-col cols="12" md="4" v-if="aceite.value.value">
            <v-checkbox :disabled="disableEdit" label="Cambio de Filtro de aceite" v-model="filtroAceite.value.value" />
          </v-col>


        </v-row>


        <v-row v-if="aceite.value.value">
          <v-col cols="12" md="6">
            <v-select :disabled="disableEdit" label="Cambio de aceite cada:  (km)" :items="cadaCuantosKm"
              v-model="cambioAceite.value.value"></v-select>
          </v-col>

          <v-col cols="12" md="6" v-if="aceite.value.value">
            <v-text-field :disabled="disableEdit" class="mb-0" label="Aceite" v-model="aceiteDescripcion.value.value" />
          </v-col>


        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <v-checkbox :disabled="disableEdit" label="Cambio de Filtro de aire" v-model="filtroAire.value.value" />
          </v-col>
          <v-col cols="12" md="4">
            <v-checkbox :disabled="disableEdit" label="Cambio de bujías" v-model="bujias.value.value" />
          </v-col>
          <v-col cols="12" md="4">
            <v-checkbox :disabled="disableEdit" label="Cambio de Filtro de polen" v-model="polen.value.value" />
          </v-col>
        </v-row>

        <v-divider></v-divider>

        <v-card-subtitle class="text-h5 py-5 mt-4 px-0 text-indigo">
          Datos de Revisiones
        </v-card-subtitle>

        <v-row>
          <v-col cols="12" md="12">
            <v-checkbox :disabled="disableEdit" label="¿Deseas agregar Revisiones?" v-model="revisiones.value.value" />
          </v-col>
          <v-card-title v-if="!revisiones.value.value" class="text-h6 font-weight-bold text-indigo mb-6" tag="h3">
            Sin Revisiones
          </v-card-title>


        </v-row>


        <v-row v-if="revisiones.value.value">
          <v-col cols="12" md="4">
            <v-checkbox :disabled="disableEdit" label="niveles" v-model="niveles.value.value" />
          </v-col>
          <v-col cols="12" md="4">
            <v-checkbox :disabled="disableEdit" label="Inspección visual de motor"
              v-model="inspeccionVisualMotor.value.value" />
          </v-col>
          <v-col cols="12" md="4">
            <v-checkbox :disabled="disableEdit" label="Correas" v-model="correas.value.value" />
          </v-col>
        </v-row>

        <v-row v-if="revisiones.value.value">
          <v-col cols="12" md="4">
            <v-checkbox :disabled="disableEdit" label="Fugas" v-model="fugas.value.value" />
          </v-col>
          <v-col cols="12" md="4">
            <v-checkbox :disabled="disableEdit" label="Tren delantero" v-model="trenDelantero.value.value" />
          </v-col>
          <v-col cols="12" md="4">
            <v-checkbox :disabled="disableEdit" label="Refrigeración" v-model="refrigeracion.value.value" />
          </v-col>
        </v-row>

        <v-row v-if="revisiones.value.value">
          <v-col cols="12" md="4">
            <v-checkbox :disabled="disableEdit" label="Frenos Delanteros" v-model="frenosDelanteros.value.value" />
          </v-col>
          <v-col cols="12" md="4">
            <v-checkbox :disabled="disableEdit" label="Frenos Traseros" v-model="frenosTraseros.value.value" />
          </v-col>
          <v-col cols="12" md="4">
            <v-checkbox :disabled="disableEdit" label="Neumáticos" v-model="neumaticos.value.value" />
          </v-col>
        </v-row>

        <v-row v-if="revisiones.value.value">
          <v-col cols="12" md="4">
            <v-checkbox :disabled="disableEdit" label="Batería" v-model="bateria.value.value" />
          </v-col>
          <v-col cols="12" md="4">
            <v-checkbox :disabled="disableEdit" label="Scanner" v-model="scanner.value.value" />
          </v-col>
        </v-row>

        <v-divider></v-divider>


        <v-textarea :disabled="disableEdit" class="mb-5" label="Detalles Extras" v-model="detallesVehiculo.value.value">
        </v-textarea>

        <v-row>
          <v-col>
            <!-- <v-btn v-if="showEdit" color="pink-accent-3" block @click="submit">
              Guardar Cambios
            </v-btn>
            <v-btn v-else color="pink-accent-3" block @click="handleEdit()">
              ¿Editar Mantención?
            </v-btn> -->

          <!-- </v-col>
          <v-col> -->

            <!-- <v-btn block v-if="siHayCostoAsociado" @click="handleIrAcostoAsociado()" color="blue-accent-3">
              Ir a Costo asociado
            </v-btn> -->
            <v-btn block  @click="handleIrAcostoAsociado()" color="blue-accent-3">
              Ir a Costo asociado
            </v-btn>
            <!-- <v-btn v-else color="blue-accent-3" block @click="submit">
              Agregar Costos
            </v-btn> -->

          </v-col>
        </v-row>


      </v-form>
    </v-card>

</div></template>