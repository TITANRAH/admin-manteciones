<script setup>

import useImage from '@/composables/useImage';
import { imageSchema, clienteSaveSchema } from "../validations/clienteSchema";
import { addDoc, collection } from "firebase/firestore";
import { useField, useForm} from 'vee-validate';
import { useRouter } from 'vue-router';
import { useFirestore } from 'vuefire';
import Swal from 'sweetalert2';
import { ref } from 'vue';


const { handleSubmit } = useForm({

    validationSchema: {
      ...clienteSaveSchema,
      ...imageSchema
    }
})


const nombreDueño = useField('nombreDueño')
const correoDueño = useField('correoDueño')
const añoVehiculo = useField('añoVehiculo')
const marcaVehiculo = useField('marcaVehiculo')
const patenteVehiculo = useField('patenteVehiculo')
const kmVehiculo = useField('kmVehiculo')
const fonoDueño = useField('fonoDueño')
const direccionDueño = useField('direccionDueño')
const imagenVehiculo = useField('imagenVehiculo')

const showBotonAgregarMantencion = ref(true)
const idClienteCreado = ref(null)


const años = [1990, 1991, 1992, 1993, 1994, 1995, 
1996, 1997, 1998, 1999, 2000, 2001, 2002, 
2003, 2004, 2005, 2006, 2007, 2008, 2009,
2010, 2011, 2012, 2013, 2014,2015, 2016, 
2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024
]


const { uploadImage, image, url } = useImage()
const router = useRouter()
const db = useFirestore()


const submit = handleSubmit(async(values) => {

    console.log('entro al submit')
  const { imagenVehiculo, ...cliente } = values

console.log('cliente', cliente)
cliente.patenteVehiculo = cliente.patenteVehiculo.toLowerCase()


const docRef = await addDoc(collection(db, "clientes"), {
  ...cliente,
  imagen: url.value,
//   contactarCliente: false
});

if (docRef.id) {
  console.log('docRef.id', docRef.id)

  idClienteCreado.value = docRef.id

  showBotonAgregarMantencion.value = false;

  Swal.fire({
      title: 'Guardado correctamente, ¿Deseas crear una Mantención?',
      showCancelButton: true,
      confirmButtonText: 'Si',
      cancelButtonText: 'Volver a Dashboard',
      reverseButtons: true,
      icon: 'question',
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirigir a la página de "mantenciones"
        router.push({ name: 'crear-mantencion', params: {id:docRef.id} })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Redirigir a la página de "crear un costo asociado"
        router.push({ name: 'dashboard' })
      }
    }); 
}
})
//FIN SUBMIT FORM

</script>

<template>
    <v-card max-width="800" flat class="mx-auto">
      <v-btn class="bg-indigo mb-5" :to="{ name: 'dashboard' }">Ir a Dashboard</v-btn>
      <v-card-title class="text-h4 font-weight-bold text-indigo" tag="h3">
       Crear Cliente
      </v-card-title>
  
      <v-form class="mt-10">
       <v-card-subtitle class="text-h5 py-5 px-0 text-indigo">
      Datos del Cliente
       </v-card-subtitle>
       
  
        <v-text-field class="mb-5" label="Nombre Dueño" v-model="nombreDueño.value.value"
        :error-messages="nombreDueño.errorMessage.value"/>
  
        <v-text-field class="mb-5" label="Correo" v-model="correoDueño.value.value"
        :error-messages="correoDueño.errorMessage.value"/>
  
        <v-text-field class="mb-5" label="Fono" v-model="fonoDueño.value.value"/>
  
        <v-text-field class="mb-5" label="Dirección" v-model="direccionDueño.value.value"   
        />
        
        <v-divider></v-divider>
        <v-card-subtitle class="text-h5 py-5 px-0 text-indigo" >
        Datos del Vehículo
       </v-card-subtitle>
  
        <v-text-field class="mb-5" label="Marca Vehículo" v-model="marcaVehiculo.value.value" 
        :error-messages="marcaVehiculo.errorMessage.value"
        />
  
        <v-file-input accept="image/jpeg" label="Fotografía" prepend-icon="mdi-camera" class="mb-5"
          v-model="imagenVehiculo.value.value"
          :error-messages="imagenVehiculo.errorMessage.value"
          @change="uploadImage"
          >
        </v-file-input>
  
        <div v-if="image" class="my-5">
          <p class="font-weight-bold">Imagen Vehículo: </p>
          <img :src="image" class="w-50">
        </div>
  
      
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field  label="Kilometraje" v-model="kmVehiculo.value.value"
            :error-messages="kmVehiculo.errorMessage.value"
            />
          </v-col>
     
          <v-col cols="12" md="4">
            <v-text-field  label="Patente" v-model="patenteVehiculo.value.value"
            :error-messages="patenteVehiculo.errorMessage.value"
            />
          </v-col>
  
          <v-col cols="12" md="4">
            <v-select label="Año Vehículo"  :items="años.sort((a, b) => b - a)" v-model="añoVehiculo.value.value" 
            :error-messages="añoVehiculo.errorMessage.value"
            ></v-select>
          </v-col>  
  
       
        </v-row>
  
  
        <v-btn v-if="showBotonAgregarMantencion" color="pink-accent-3" block @click="submit">
          Agregar Cliente
        </v-btn>
        <v-btn v-else color="pink-accent-3" block :to="{name: 'crear-mantencion',params: {id:idClienteCreado} }">
          Crear Mantención
        </v-btn>
  
      </v-form>
    </v-card>
  </template>
  

<style>

</style>