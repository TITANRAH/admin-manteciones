<script setup>
import { useForm, useField } from 'vee-validate';
import { validacionSchema, imageSchema } from '../validations/mantencionesSchema'
// import { collection, addDoc } from "firebase/firestore";
// import { useFirestore } from 'vuefire'
import { useRouter } from 'vue-router';
// import useImage from '@/composables/useImage';




// PARA INTERACTUAR CON LA AUTENTICACION SE USA useFirebaseAuth 
// EN ESTE CASO PARA INTERACUTAR CON LA BASDE DE DATOS USAMOS useFirestore
const años = [1990, 1991, 1992, 1993, 1994, 1995, 
1996, 1997, 1998, 1999, 2000, 2001, 2002, 
2003, 2004, 2005, 2006, 2007, 2008, 2009,
2010, 2011, 2012, 2013, 2014,2015, 2016, 
2017, 2018, 2019, 2020
]

const cadaCuantosKm = [10000, 15000]




// const { uploadImage, image, url } = useImage()


const router = useRouter()

// const db = useFirestore()

const { handleSubmit } = useForm({

    validationSchema: {
      ...validacionSchema,
      ...imageSchema
    }
})

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
const proximaMantencion = useField('proximaMantencion')
const filtroAire =  useField('filtroAire', null, {
  initialValue: false
})
const filtroAceite =  useField('filtroAceite', null, {
  initialValue: false
})
const vujias =  useField('vujias', null, {
  initialValue: false
})



// const submit = handleSubmit(async (values) => {

//   const { imagen, ...propiedad } = values

//   console.log(propiedad)


//   const docRef = await addDoc(collection(db, "propiedades"), {

//     ...propiedad,
//     imagen: url.value,
//     ubicacion: center.value
//   });

//   if (docRef.id) {
//     router.push({ name: 'admin-propiedades' })
//   }
//   console.log("Document written with ID: ", docRef.id);
// })

const submit = handleSubmit((values) => {

  console.log('click subit')
  console.log(values);
  router.push({name: 'mantenciones'})
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

    <!-- se pone value.value por que tiene una propiedad value 
    esto es use Field de vee-validate 
   :error-messages="titulo.errorMessage.value"
  -->
    <v-form class="mt-10">

      <v-text-field class="mb-5" label="Nombre Dueño" v-model="nombreDueño.value.value"
      :error-messages="nombreDueño.errorMessage.value"
      />

      <v-text-field class="mb-5" label="Correo" v-model="correoDueño.value.value"
      :error-messages="correoDueño.errorMessage.value"
      />

      <v-text-field class="mb-5" label="Fono" v-model="fonoDueño.value.value"
      
      />

      <v-text-field class="mb-5" label="Dirección" v-model="direccionDueño.value.value"
      
      />

      <v-text-field class="mb-5" label="Marca Vehículo" v-model="marcaVehiculo.value.value" 
      :error-messages="marcaVehiculo.errorMessage.value"
      />

      <v-text-field class="mb-5" label="Valor Mantención" v-model="valorMantencion.value.value" 
      :error-messages="valorMantencion.errorMessage.value"
      />

      <!-- <v-text-field class="mb-5" label="Nombre Dueño" v-model="precio.value.value"
          :error-messages="precio.errorMessage.value" 
          :error-messages="imagen.errorMessage.value" @change="uploadImage"
          /> -->

      <!-- acepta iconos de material desing busco aca https://pictogrammers.com/library/mdi/ con el prefijo mdi -->
      <v-file-input accept="image/jpeg" label="Fotografía" prepend-icon="mdi-camera" class="mb-5"
        v-model="imagenVehiculo.value.value"
        :error-messages="imagenVehiculo.errorMessage.value"
        >
      </v-file-input>

      <v-text-field class="mb-5" label="Aceite" v-model="aceiteDescripcion.value.value"
      :error-messages="aceiteDescripcion.errorMessage.value"
      />



      <!-- <div v-if="image" class="my-5">
        <p class="font-weight-bold">Imagen Vehículo: </p>
        <img :src="image" class="w-50">
      </div> -->



      <v-row>
        <v-col cols="12" md="2.4">
          <v-select label="Año Vehículo"  :items="años" v-model="añoVehiculo.value.value" 
          :error-messages="añoVehiculo.errorMessage.value"
          ></v-select>
        </v-col>

        <v-col cols="12" md="2.4">
          <v-text-field  label="Patente" v-model="patenteVehiculo.value.value"
          :error-messages="patenteVehiculo.errorMessage.value"
          />
        </v-col>

        <v-col cols="12" md="2.4">
          <v-text-field  label="Fecha Mantención" v-model="fechaMantencion.value.value" 
          :error-messages="fechaMantencion.errorMessage.value"
          />
        </v-col>

        <v-col cols="12" md="2.4">
          <v-text-field  label="Kilometraje" v-model="kmVehiculo.value.value"
          :error-messages="kmVehiculo.errorMessage.value"
          />
        </v-col>

        <v-col cols="12" md="2.4">
          <v-select label="Próxima manteción (km)"  :items="cadaCuantosKm" v-model="proximaMantencion.value.value"
          :error-messages="proximaMantencion.errorMessage.value"
          
          ></v-select>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="4">
          <v-checkbox label="Cambio de filtro de aceite" v-model="filtroAire.value.value" />
        </v-col>
        <v-col cols="12" md="4">
          <v-checkbox label="Cambio de vujías" v-model="vujias.value.value" />
        </v-col>
        <v-col cols="12" md="4">
          <v-checkbox label="Cambio de filtro de aire" v-model="filtroAceite.value.value" />
        </v-col>
      </v-row>

      <v-textarea class="mb-5" label="Detalles Extras" v-model="detallesVehiculo.value.value">
      </v-textarea>

      <v-btn color="pink-accent-3" block @click="submit">
        Agregar Mantención
      </v-btn>

    </v-form>
  </v-card>
</template>
