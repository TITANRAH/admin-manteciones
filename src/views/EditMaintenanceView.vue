<script setup>
import useImage from '@/composables/useImage';
import { validacionSchema } from '@/validations/mantencionesSchema';
import { watch } from 'vue';
import { doc, updateDoc } from "firebase/firestore";
import { useField, useForm } from 'vee-validate';
import { useRoute, useRouter } from 'vue-router';
import { useFirestore, useDocument } from 'vuefire';

const route = useRoute()
const router = useRouter()
// asi rescato el id de la url
console.log('id que me traere para editar', route.params.id);
const db = useFirestore()
const docRef = doc(db, 'mantenciones', route.params.id)
const mantencion = useDocument(docRef);
console.log('propiedad a traer en editar ', mantencion)

//ARRAY PARA LOS AÑOS EN LA VISTA
const años = [1990, 1991, 1992, 1993, 1994, 1995,
  1996, 1997, 1998, 1999, 2000, 2001, 2002,
  2003, 2004, 2005, 2006, 2007, 2008, 2009,
  2010, 2011, 2012, 2013, 2014, 2015, 2016,
  2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024
]
//ARRAY PARA LOS KM EN LA VISTA
const cadaCuantosKm = [10000, 15000]

const { uploadImage, image, url } = useImage()

const { handleSubmit } = useForm({
  validationSchema: {
    ...validacionSchema,
 
  }
})

//CAMPOS TEXTFIELD FORMULARIO
const nombreDueño = useField('nombreDueño')
const fonoDueño = useField('fonoDueño')
const correoDueño = useField('correoDueño')
const direccionDueño = useField('direccionDueño')
const marcaVehiculo = useField('marcaVehiculo')
const patenteVehiculo = useField('patenteVehiculo')
const añoVehiculo = useField('añoVehiculo')
const fechaMantencion = useField('fechaMantencion')
const valorMantencion = useField('valorMantencion')
const kmVehiculo = useField('kmVehiculo')
const imagenVehiculo = useField('imagenVehiculo')
const aceiteDescripcion = useField('aceiteDescripcion')
const detallesVehiculo = useField('detallesVehiculo')
const cambioAceite = useField('cambioAceite')
const filtroAire = useField('filtroAire', null, {
  initialValue: false
})
const filtroAceite = useField('filtroAceite', null, {
  initialValue: false
})
const vujias = useField('vujias', null, {
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
const refrigeración = useField('refrigeracion', null, {
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
  nombreDueño.value.value = mantencion.nombreDueño
  fonoDueño.value.value = mantencion.fonoDueño
  correoDueño.value.value = mantencion.correoDueño
  direccionDueño.value.value = mantencion.direccionDueño
  marcaVehiculo.value.value = mantencion.marcaVehiculo
  patenteVehiculo.value.value = mantencion.patenteVehiculo
  añoVehiculo.value.value = mantencion.añoVehiculo
  fechaMantencion.value.value = mantencion.fechaMantencion
  valorMantencion.value.value = mantencion.valorMantencion
  kmVehiculo.value.value = mantencion.kmVehiculo
  aceiteDescripcion.value.value = mantencion.aceiteDescripcion
  detallesVehiculo.value.value = mantencion.detallesVehiculo
  cambioAceite.value.value = mantencion.cambioAceite
  filtroAire.value.value = mantencion.filtroAire
  vujias.value.value = mantencion.vujias
  aceite.value.value = mantencion.aceite
  polen.value.value = mantencion.polen
  usoLaboral.value.value = mantencion.usoLaboral
  usoFamiliar.value.value = mantencion.usoFamiliar
  revisiones.value.value = mantencion.revisiones
  inspeccionVisualMotor.value.value = mantencion.inspeccionVisualMotor
  fugas.value.value = mantencion.fugas
  trenDelantero.value.value = mantencion.trenDelantero
  refrigeración.value.value = mantencion.refrigeracion
  frenosDelanteros.value.value = mantencion.frenosDelanteros
  frenosTraseros.value.value = mantencion.frenosTraseros
  neumaticos.value.value = mantencion.neumaticos
  bateria.value.value = mantencion.bateria
  scanner.value.value = mantencion.scanner
})



const submit = handleSubmit(async (values) => {

  const { imagenVehiculo, ...mantencion } = values
  console.log('values desde editar', values)
  if (url.value) {
 
    const data = { 
      ...mantencion,
      imagen: url.value,
    }
    await updateDoc(docRef, data)
   
  
  } else {

    const data = {   
      ...mantencion,
    }
    await updateDoc(docRef, data)
   

    // Agregar un nuevo documento en la subcolección "historial"
   
  }
  router.push({ name: 'mantenciones' })
})

</script>

<template>
  <v-card max-width="800" flat class="mx-auto my-10">
    <v-card-title class="text-h4 font-weight-bold" tag="h3">
      Nueva Mantención
    </v-card-title>

    <v-card-subtitle class="text-h5 py-5">
      Crea una nueva mantención llenando el siguiente formulario
    </v-card-subtitle>

    <v-form class="mt-10">
      <v-card-subtitle class="text-h5 py-5 px-0 text-indigo">
        Datos del Cliente
      </v-card-subtitle>

      <v-text-field class="mb-5" label="Nombre Dueño" v-model="nombreDueño.value.value"
        :error-messages="nombreDueño.errorMessage.value" />

      <v-text-field class="mb-5" label="Correo" v-model="correoDueño.value.value"
        :error-messages="correoDueño.errorMessage.value" />

      <v-text-field class="mb-5" label="Fono" v-model="fonoDueño.value.value" />

      <v-text-field class="mb-5" label="Dirección" v-model="direccionDueño.value.value" />
      <v-divider></v-divider>
      <v-card-subtitle class="text-h5 py-5 px-0 text-indigo">
        Datos del Vehículo
      </v-card-subtitle>

      <v-text-field class="mb-5" label="Marca Vehículo" v-model="marcaVehiculo.value.value"
        :error-messages="marcaVehiculo.errorMessage.value" />

      <v-file-input accept="image/jpeg" label="Fotografía" prepend-icon="mdi-camera" class="mb-5"
        v-model="imagenVehiculo.value.value" @change="uploadImage">
      </v-file-input>

      <div class="my-5">

        <p v-if="imagenVehiculo" class="font-weight-bold">Imagen Actual: </p>

        <img v-if="image" alt="" class="m-50 w-50" :src="image">
        <img v-else alt="" class="m-50 w-50" :src="mantencion?.imagen">

      </div>


      <v-row>
        <v-col cols="6" md="4">
          <v-checkbox label="Uso Familiar" v-model="usoFamiliar.value.value" />
        </v-col>
        <v-col cols="6" md="4">
          <v-checkbox label="Uso Laboral" v-model="usoLaboral.value.value" />
        </v-col>
      </v-row>

      <v-divider></v-divider>

      <v-card-subtitle class="text-h5 py-5 px-0 text-indigo">
        Datos de Mantención
      </v-card-subtitle>

      <v-row>
        <v-col cols="12" md="3">
          <v-text-field label="Kilometraje" v-model="kmVehiculo.value.value"
            :error-messages="kmVehiculo.errorMessage.value" />
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field label="Patente" v-model="patenteVehiculo.value.value"
            :error-messages="patenteVehiculo.errorMessage.value" />
        </v-col>

        <v-col cols="12" md="3">
          <v-select label="Año Vehículo" :items="años" v-model="añoVehiculo.value.value"
            :error-messages="añoVehiculo.errorMessage.value"></v-select>
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field type="date" label="Fecha Mantención (Hoy)" v-model="fechaMantencion.value.value"
            :error-messages="fechaMantencion.errorMessage.value" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="4">
          <v-checkbox label="¿Cambio de aceite?" v-model="aceite.value.value" />
        </v-col>

        <v-col cols="12" md="4" v-if="aceite.value.value">
          <v-checkbox label="Cambio de Filtro de aceite" v-model="filtroAceite.value.value" />
        </v-col>


      </v-row>


      <v-row v-if="aceite.value.value">
        <v-col cols="12" md="6">
          <v-select label="Cambio de aceite cada:  (km)" :items="cadaCuantosKm" v-model="cambioAceite.value.value"
            :error-messages="cambioAceite.errorMessage.value"></v-select>
        </v-col>

        <v-col cols="12" md="6" v-if="aceite.value.value">
          <v-text-field class="mb-0" label="Aceite" v-model="aceiteDescripcion.value.value"
            :error-messages="aceiteDescripcion.errorMessage.value" />
        </v-col>


      </v-row>
      <v-row>
        <v-col cols="12" md="4">
          <v-checkbox label="Cambio de Filtro de aire" v-model="filtroAire.value.value" />
        </v-col>
        <v-col cols="12" md="4">
          <v-checkbox label="Cambio de Vujías" v-model="vujias.value.value" />
        </v-col>
        <v-col cols="12" md="4">
          <v-checkbox label="Cambio de Filtro de polen" v-model="polen.value.value" />
        </v-col>
      </v-row>

      <v-divider></v-divider>

      <v-card-subtitle class="text-h5 py-5 mt-4 px-0 text-indigo">
        Datos de Revisiones
      </v-card-subtitle>

      <v-row>
        <v-col cols="12" md="12">
          <v-checkbox label="¿Deseas agregar Revisiones?" v-model="revisiones.value.value" />
        </v-col>
        <v-card-title v-if="!revisiones.value.value" class="text-h6 font-weight-bold text-indigo" tag="h3">
          Sin Revisiones
        </v-card-title>
      </v-row>

      <v-row v-if="revisiones.value.value">
        <v-col cols="12" md="4">
          <v-checkbox label="niveles" v-model="niveles.value.value" />
        </v-col>
        <v-col cols="12" md="4">
          <v-checkbox label="Inspección visual de motor" v-model="inspeccionVisualMotor.value.value" />
        </v-col>
        <v-col cols="12" md="4">
          <v-checkbox label="Correas" v-model="correas.value.value" />
        </v-col>
      </v-row>

      <v-row v-if="revisiones.value.value">
        <v-col cols="12" md="4">
          <v-checkbox label="Fugas" v-model="fugas.value.value" />
        </v-col>
        <v-col cols="12" md="4">
          <v-checkbox label="Tren delantero" v-model="trenDelantero.value.value" />
        </v-col>
        <v-col cols="12" md="4">
          <v-checkbox label="Refrigeración" v-model="refrigeración.value.value" />
        </v-col>
      </v-row>

      <v-row v-if="revisiones.value.value">
        <v-col cols="12" md="4">
          <v-checkbox label="Frenos Delanteros" v-model="frenosDelanteros.value.value" />
        </v-col>
        <v-col cols="12" md="4">
          <v-checkbox label="Frenos Traseros" v-model="frenosTraseros.value.value" />
        </v-col>
        <v-col cols="12" md="4">
          <v-checkbox label="Neumáticos" v-model="neumaticos.value.value" />
        </v-col>
      </v-row>

      <v-row v-if="revisiones.value.value">
        <v-col cols="12" md="4">
          <v-checkbox label="Batería" v-model="bateria.value.value" />
        </v-col>
        <v-col cols="12" md="4">
          <v-checkbox label="Scanner" v-model="scanner.value.value" />
        </v-col>
      </v-row>

      <v-divider></v-divider>

      <v-text-field class="mb-5 mt-5" label="Valor Mantención" v-model="valorMantencion.value.value"
        :error-messages="valorMantencion.errorMessage.value" />

      <v-textarea class="mb-5" label="Detalles Extras" v-model="detallesVehiculo.value.value">
      </v-textarea>

      <v-btn color="pink-accent-3" block @click="submit">
        Guardar Cambios
      </v-btn>

    </v-form>
  </v-card>
</template>
