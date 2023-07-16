<script setup>

import {  validacionSchema } from '@/validations/mantencionesSchema';
import { addDoc, collection, doc } from "firebase/firestore";
import { useField, useForm } from 'vee-validate';
import { useRouter, useRoute } from 'vue-router';
import { useFirestore } from 'vuefire';
import Swal from 'sweetalert2';
import { ref } from 'vue';


//ARRAY PARA LOS KM EN LA VISTA
const cadaCuantosKm = [10000, 15000]
const showButtonCost= ref(false)

const router = useRouter()
const route = useRoute()
const db = useFirestore()
const clienteRef = doc(db, 'clientes', route.params.id);
const mantencionesCollectionRef = collection(clienteRef, 'mantenciones');





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

const filtroAire =  useField('filtroAire', null, {
  initialValue: false
})
const filtroAceite =  useField('filtroAceite', null, {
  initialValue: false
})
const bujias =  useField('bujias', null, {
  initialValue: false
})

const aceite = useField('aceite', null, {
  initialValue: false
})
const polen =  useField('polen', null, {
  initialValue: false
})
const usoLaboral =  useField('usoLaboral', null, {
  initialValue: false
})
const usoFamiliar =  useField('usoFamiliar', null, {
  initialValue: false
})
const revisiones =  useField('revisiones', null, {
  initialValue: false
})
const niveles =  useField('niveles', null, {
  initialValue: false
})
const inspeccionVisualMotor =  useField('inspeccionVisualMotor', null, {
  initialValue: false
})
const correas =  useField('correas', null, {
  initialValue: false
})
const fugas =  useField('fugas', null, {
  initialValue: false
})
const trenDelantero =  useField('trenDelantero', null, {
  initialValue: false
})
const refrigeracion =  useField('refrigeracion', null, {
  initialValue: false
})
const frenosDelanteros =  useField('frenosDelanteros', null, {
  initialValue: false
})
const frenosTraseros =  useField('frenosTraseros', null, {
  initialValue: false
})
const neumaticos =  useField('neumaticos', null, {
  initialValue: false
})
const bateria =  useField('bateria', null, {
  initialValue: false
})
const scanner =  useField('scanner', null, {
  initialValue: false
})
// FIN CAMPOS TEXTFIELD FORMULARIO

//SUBMIT FORM
const submit = handleSubmit(async(values) => {
  const {  ...mantencion } = values

console.log('mantencion', mantencion)

if(mantencion.cambioAceite == undefined){
    mantencion.cambioAceite = 10000
}
if(mantencion.detallesVehiculo == undefined){
    mantencion.detallesVehiculo = ''
}
if(mantencion.aceiteDescripcion == undefined){
    mantencion.aceiteDescripcion = ''
}

const docRef = await addDoc(mantencionesCollectionRef, mantencion);



if (docRef.id) {
  console.log('docRef.id', docRef.id)

  Swal.fire({
      title: 'Guardado correctamente, ¿Deseas crear costos de Mantención?',
      showCancelButton: true,
      confirmButtonText: 'Costos de Mantención',
      cancelButtonText: 'ir a Calendario',
      reverseButtons: true,
      icon: 'question',
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirigir a la página de "mantenciones"
        router.push({ name: 'crear-costo', params: { idCliente: route.params.id, idMantencion: docRef.id } });
        // router.push({ name: 'crear-costo', params: {id:docRef.id} })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Redirigir a la página de "crear un costo asociado"
        router.push({ name: 'calendario-general' })
      }
    });
  
}

//  // Guardar en el historialMantenciones
//  const historialRef = collection(db, 'mantenciones', docRef.id, 'historialMantenciones');
//   const historialDocRef = await addDoc(historialRef, {
//     ...mantencion,
//     imagen: url.value,
//     fecha: new Date(), // Agrega la fecha actual o cualquier otra información que desees almacenar
//   });

//   console.log("documento guardado con ID: ", docRef.id);
//   console.log('Historial guardado con ID:', historialDocRef.id);
})
//FIN SUBMIT FORM


</script>

<template>
  <v-card max-width="800" flat class="mx-auto my-10">
    <v-btn class="ml-2 mb-6" icon :to="{name: 'cliente', params:{id: route.params.id}}"><v-icon size="30">mdi-arrow-left</v-icon></v-btn>
    <v-card-title  class="text-h4 font-weight-bold text-indigo" tag="h3">
      Crear Mantención
    </v-card-title>



    <v-form class="mt-10">

        <v-card-subtitle class="text-h5 py-5 px-0 text-indigo">
      Uso del Vehículo
       </v-card-subtitle>

      <v-row>
       <v-col cols="6" md="4">
          <v-checkbox label="Uso Familiar" v-model="usoFamiliar.value.value" />
        </v-col>
        <v-col cols="6" md="4">
          <v-checkbox label="Uso Laboral" v-model="usoLaboral.value.value" />
        </v-col>   
      </v-row>

      <v-divider></v-divider>

      <v-card-subtitle class="text-h5 py-5 px-0 text-indigo" >
      Datos de Mantención
     </v-card-subtitle>

      <v-row>
      

        <v-col cols="12" md="3">
          <v-text-field type="date"  label="Fecha Mantención (Hoy)" v-model="fechaMantencion.value.value" 
          :error-messages="fechaMantencion.errorMessage.value"
        />
        </v-col> 
      </v-row>

      <v-row>
          <v-col cols="12" md="4" >
            <v-checkbox label="¿Cambio de aceite?" v-model="aceite.value.value" />
          </v-col>

          <v-col cols="12" md="4"  v-if="aceite.value.value">
            <v-checkbox label="Cambio de Filtro de aceite" v-model="filtroAceite.value.value" />
          </v-col>

         
      </v-row>
      

      <v-row v-if="aceite.value.value">       
        <v-col  cols="12" md="6" >
          <v-select label="Cambio de aceite cada:  (km)"  :items="cadaCuantosKm" v-model="cambioAceite.value.value"    
          ></v-select>
        </v-col>

        <v-col cols="12" md="6"  v-if="aceite.value.value" >
            <v-text-field class="mb-0" label="Aceite" v-model="aceiteDescripcion.value.value"
          />       
          </v-col>
         
      
      </v-row>
      <v-row>
        <v-col cols="12" md="4">
          <v-checkbox label="Cambio de Filtro de aire" v-model="filtroAire.value.value" />
        </v-col>
        <v-col cols="12" md="4">
          <v-checkbox label="Cambio de bujías" v-model="bujias.value.value" />
        </v-col>
        <v-col cols="12" md="4">
          <v-checkbox label="Cambio de Filtro de polen" v-model="polen.value.value" />
        </v-col>   
      </v-row>

      <v-divider></v-divider>

      <v-card-subtitle class="text-h5 py-5 mt-4 px-0 text-indigo" >
      Datos de Revisiones
     </v-card-subtitle>

     <v-row>
       <v-col cols="12" md="12" >
          <v-checkbox label="¿Deseas agregar Revisiones?" v-model="revisiones.value.value" />
      </v-col>
      <v-card-title v-if="!revisiones.value.value" class="text-h6 font-weight-bold text-indigo mb-6" tag="h3">
      Sin Revisiones
    </v-card-title>
 
   
  </v-row>


    <v-row v-if="revisiones.value.value">
      <v-col cols="12" md="4" >
          <v-checkbox label="niveles" v-model="niveles.value.value" />
      </v-col>
      <v-col cols="12" md="4" >
          <v-checkbox label="Inspección visual de motor" v-model="inspeccionVisualMotor.value.value" />
      </v-col>
      <v-col cols="12" md="4" >
          <v-checkbox label="Correas" v-model="correas.value.value" />
      </v-col>
    </v-row>

    <v-row v-if="revisiones.value.value">
      <v-col cols="12" md="4" >
          <v-checkbox label="Fugas" v-model="fugas.value.value" />
      </v-col>
      <v-col cols="12" md="4" >
          <v-checkbox label="Tren delantero" v-model="trenDelantero.value.value" />
      </v-col>
      <v-col cols="12" md="4" >
          <v-checkbox label="Refrigeración" v-model="refrigeracion.value.value" />
      </v-col>
    </v-row>

    <v-row v-if="revisiones.value.value">
      <v-col cols="12" md="4" >
          <v-checkbox label="Frenos Delanteros" v-model="frenosDelanteros.value.value" />
      </v-col>
      <v-col cols="12" md="4" >
          <v-checkbox label="Frenos Traseros" v-model="frenosTraseros.value.value" />
      </v-col>
      <v-col cols="12" md="4" >
          <v-checkbox label="Neumáticos" v-model="neumaticos.value.value" />
      </v-col>
    </v-row>

    <v-row v-if="revisiones.value.value">
      <v-col cols="12" md="4" >
          <v-checkbox label="Batería" v-model="bateria.value.value" />
      </v-col>
      <v-col cols="12" md="4" >
          <v-checkbox label="Scanner" v-model="scanner.value.value" />
      </v-col>   
    </v-row>
  
     <v-divider></v-divider>

 
      <v-textarea class="mb-5" label="Detalles Extras" v-model="detallesVehiculo.value.value">
      </v-textarea>

    

      <v-btn v-if="showButtonCost" color="blue-accent-3" block @click="">
        Agregar Costos
      </v-btn>
      <v-btn v-else color="pink-accent-3" block @click="submit">
        Agregar Mantención
      </v-btn>

    </v-form>
  </v-card>
</template>
