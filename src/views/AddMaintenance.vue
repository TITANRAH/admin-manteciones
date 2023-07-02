<script setup>
import { useForm, useField } from 'vee-validate';
import { validacionSchema, imageSchema } from '@/validations/mantencionesSchema'
import { collection, addDoc } from "firebase/firestore";
import { useFirestore } from 'vuefire'
import { useRouter } from 'vue-router';
import useImage from '@/composables/useImage';

//ARRAY PARA LOS AÑOS EN LA VISTA
const años = [1990, 1991, 1992, 1993, 1994, 1995, 
1996, 1997, 1998, 1999, 2000, 2001, 2002, 
2003, 2004, 2005, 2006, 2007, 2008, 2009,
2010, 2011, 2012, 2013, 2014,2015, 2016, 
2017, 2018, 2019, 2020
]
//ARRAY PARA LOS KM EN LA VISTA
const cadaCuantosKm = [10000, 15000]

const { uploadImage, image, url } = useImage()
const router = useRouter()
const db = useFirestore()

const { handleSubmit } = useForm({
    validationSchema: {
      ...validacionSchema,
      ...imageSchema
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
const filtroAire =  useField('filtroAire', null, {
  initialValue: false
})
const filtroAceite =  useField('filtroAceite', null, {
  initialValue: false
})
const vujias =  useField('vujias', null, {
  initialValue: false
})

const aceite =  useField('aceite', null, {
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
const refrigeración =  useField('refrigeracion', null, {
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
  const { imagenVehiculo, ...mantencion } = values

console.log('mantencion', mantencion)

const docRef = await addDoc(collection(db, "mantenciones"), {
  ...mantencion,
  imagen: url.value,
});

if (docRef.id) {
  console.log('docRef.id', docRef.id)
  router.push({ name: 'mantenciones' })
}
console.log("documento guardado con ID: ", docRef.id);
})
//FIN SUBMIT FORM


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
          <v-select label="Año Vehículo"  :items="años" v-model="añoVehiculo.value.value" 
          :error-messages="añoVehiculo.errorMessage.value"
          ></v-select>
        </v-col>  
      </v-row>

      <v-row>
          <v-col cols="12" md="4" >
            <v-checkbox label="¿Cambio de aceite?" v-model="aceite.value.value" />
          </v-col>

          <v-col cols="12" md="4"  v-if="aceite.value.value">
            <v-checkbox label="Cambio de Filtro de aceite" v-model="filtroAceite.value.value" />
          </v-col>

          <v-col cols="12" md="4"  v-if="aceite.value.value" >
            <v-text-field class="mb-0" label="Aceite" v-model="aceiteDescripcion.value.value"
            :error-messages="aceiteDescripcion.errorMessage.value"
          />       
          </v-col>
      </v-row>
      

      <v-row v-if="aceite.value.value">       
        <v-col  cols="12" md="6" >
          <v-select label="Cambio de aceite cada:  (km)"  :items="cadaCuantosKm" v-model="cambioAceite.value.value"
          :error-messages="cambioAceite.errorMessage.value"      
          ></v-select>
        </v-col>
         
        <v-col cols="12" md="6">
          <v-text-field  label="Fecha Mantención (Hoy)" v-model="fechaMantencion.value.value" 
          :error-messages="fechaMantencion.errorMessage.value"
        />
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

      <v-card-subtitle class="text-h5 py-5 mt-4 px-0 text-indigo" >
      Datos de Revisiones
     </v-card-subtitle>

     <v-row>
       <v-col cols="12" md="12" >
          <v-checkbox label="¿Deseas agregar Revisiones?" v-model="revisiones.value.value" />
      </v-col>
      <v-card-title v-if="!revisiones.value.value" class="text-h6 font-weight-bold text-indigo" tag="h3">
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
          <v-checkbox label="Refrigeración" v-model="refrigeración.value.value" />
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

      <v-text-field class="mb-5 mt-5" label="Valor Mantención" v-model="valorMantencion.value.value" 
      :error-messages="valorMantencion.errorMessage.value"
      />

      <v-textarea class="mb-5" label="Detalles Extras" v-model="detallesVehiculo.value.value">
      </v-textarea>

      <v-btn color="pink-accent-3" block @click="submit">
        Agregar Mantención
      </v-btn>

    </v-form>
  </v-card>
</template>
