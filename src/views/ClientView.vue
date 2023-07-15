<script setup>
import useImage from '@/composables/useImage';
import { imageSchema, clienteSaveSchema } from "../validations/clienteSchema";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useField, useForm } from 'vee-validate';
import { useRouter, useRoute } from 'vue-router';
import { useFirestore, useDocument } from 'vuefire';
import Swal from 'sweetalert2';
import { watch, ref } from 'vue';
import { formatedDate } from '../helpers';

// CONST
const { uploadImage, image, url } = useImage()
const route = useRoute()
const router = useRouter()
const db = useFirestore()
const docRef = doc(db, 'clientes', route.params.id)
const cliente = useDocument(docRef);
const disabled = ref(true)
const mantenciones = ref([])
const mantencionesOrdenadas = ref([])
const dialogVisible = ref(false)
const años = [1990, 1991, 1992, 1993, 1994, 1995, 
1996, 1997, 1998, 1999, 2000, 2001, 2002, 
2003, 2004, 2005, 2006, 2007, 2008, 2009,
2010, 2011, 2012, 2013, 2014,2015, 2016, 
2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024
]
// FIN CONST

// VALIDACIONES FORMULARIO
const { handleSubmit } = useForm({
    validationSchema: {
        ...clienteSaveSchema,   
    }
})
// FIN VALIDACIONES FORMULARIO

// CAMPOS FORMULARIO
const nombreDueño = useField('nombreDueño')
const correoDueño = useField('correoDueño')
const añoVehiculo = useField('añoVehiculo')
const marcaVehiculo = useField('marcaVehiculo')
const patenteVehiculo = useField('patenteVehiculo')
const kmVehiculo = useField('kmVehiculo')
const fonoDueño = useField('fonoDueño')
const direccionDueño = useField('direccionDueño')
const imagenVehiculo = useField('imagenVehiculo')
//FIN CAMPOS FORMULARIO

// RELLENAR FORMULARIO CON LA DATA QUE SE OBTIENE DEL CLIENTE
watch(cliente, (cliente)=>{
 nombreDueño.value.value = cliente.nombreDueño
 correoDueño.value.value = cliente.correoDueño
 añoVehiculo.value.value = cliente.añoVehiculo
 marcaVehiculo.value.value = cliente.marcaVehiculo
 patenteVehiculo.value.value = cliente.patenteVehiculo
 kmVehiculo.value.value = cliente.kmVehiculo
 fonoDueño.value.value = cliente.fonoDueño
 direccionDueño.value.value = cliente.direccionDueño
})
// FIN RELLENAR FORMULARIO CON LA DATA QUE SE OBTIENE DEL CLIENTE

// ENVIAR A CREACION DE MANTENCION
const crearMantencion = async () => {
    dialogVisible.value = false
    router.push({ name: 'crear-mantencion' });
}
// ENVIAR A CREACION DE MANTENCION

// VERIFICAR SI TIENE ATNECIONES ABIERTAS
const verificarMantencionesExisten = async () => {
  const clienteId = route.params.id; // Obtén el ID del cliente de los parámetros de ruta

  const mantencionesCollectionRef = collection(db, 'clientes', clienteId, 'mantenciones');
  const querySnapshot = await getDocs(mantencionesCollectionRef);

  if (querySnapshot.size > 0) {
    mantenciones.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      fecha: doc.data().fechaMantencion,
    }));
    mantencionesOrdenadas.value = mantenciones.value.sort((b, a) => a.fecha.localeCompare(b.fecha));
    console.log('Mantenciones:', mantencionesOrdenadas.value);

    dialogVisible.value = true;
  } else {
    console.log('No hay mantenciones');
    crearMantencion();
  }
};
// VERIFICAR SI TIENE ATNECIONES ABIERTAS

// EDICION DE CLIENTE
const submit = handleSubmit(async (values) => {

const { imagenVehiculo, ...cliente } = values
console.log('values desde editar', cliente)

if (url.value) {

try {
  const data = { 
    ...cliente,
    imagen: url.value,
  }
  await updateDoc(docRef, data)
  Swal.fire({
    title: 'Éxito',
    text: 'Los cambios fueron guardados',
    icon: 'success',
    confirmButtonText: 'Aceptar',
  }).then((result) => {
    if (result.isConfirmed) {
    disabled.value = true
    }
  })
} catch (error) {
    console.log(error)
}
} else {
    try {
        const data = {   
          ...cliente,
        }
        await updateDoc(docRef, data)
      
        Swal.fire({
          title: 'Éxito',
          text: 'Los cambios fueron guardados',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        }).then((result) => {
          if (result.isConfirmed) {
              disabled.value = true
          }
        }) 
        
    } catch (error) {
        console.log(error)
    }
}
})
// FIN EDICION DE CLIENTE

// HABILITAR FORMULARIO PARA EDICION
const handleDisabled = () => {
    disabled.value = !disabled.value
}
// FIN HABILITAR FORMULARIO PARA EDICION

// ENVIAR A MANTENCION CON ID
const redirigirAMantencion = ( id) => {
    console.log('id mantencion', id)

    router.push({ name: 'mantencion-cliente', params: { idCliente: route.params.id, id: id } });
}
//FIN ENVIAR A MANTENCION CON ID
</script>

<template>
     <v-card max-width="800" flat class="mx-auto">
         <v-btn class="ml-2" icon :to="{name: 'calendario-general'}"><v-icon size="30">mdi-arrow-left</v-icon></v-btn>

      <v-form class="mt-10">
       <v-card-subtitle class="text-h5 py-5 px-0 text-indigo">
      Datos del Cliente
       </v-card-subtitle>
    
        <v-text-field  class="mb-5" label="Nombre Dueño" v-model="nombreDueño.value.value"
        :error-messages="nombreDueño.errorMessage.value"/>
  
        <v-text-field :disabled="disabled" class="mb-5" label="Correo" v-model="correoDueño.value.value"
        :error-messages="correoDueño.errorMessage.value"/>
  
        <v-text-field :disabled="disabled" class="mb-5" label="Fono" v-model="fonoDueño.value.value"/>
  
        <v-text-field :disabled="disabled" class="mb-5" label="Dirección" v-model="direccionDueño.value.value"   
        />
        
        <v-divider></v-divider>
        <v-card-subtitle class="text-h5 py-5 px-0 text-indigo" >
        Datos del Vehículo
       </v-card-subtitle>
  
        <v-text-field :disabled="disabled" class="mb-5" label="Marca Vehículo" v-model="marcaVehiculo.value.value" 
        :error-messages="marcaVehiculo.errorMessage.value"
        />
  
        <v-file-input :disabled="disabled" accept="image/jpeg" label="Fotografía" prepend-icon="mdi-camera" class="mb-5"
        v-model="imagenVehiculo.value.value" @change="uploadImage">
      </v-file-input>

      <div class="my-5">
        <p v-if="imagenVehiculo" class="font-weight-bold">Imagen Actual: </p>
        <img v-if="image" alt="" class="m-50 w-50" :src="image">
        <img v-else alt="" class="m-50 w-50" :src="cliente?.imagen">
      </div>
    
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field :disabled="disabled"  label="Kilometraje" v-model="kmVehiculo.value.value"
            :error-messages="kmVehiculo.errorMessage.value"
            />
          </v-col>
     
          <v-col cols="12" md="4">
            <v-text-field :disabled="disabled"  label="Patente" v-model="patenteVehiculo.value.value"
            :error-messages="patenteVehiculo.errorMessage.value"
            />
          </v-col>
  
          <v-col cols="12" md="4">
            <v-select :disabled="disabled" label="Año Vehículo"  :items="años" v-model="añoVehiculo.value.value" 
            :error-messages="añoVehiculo.errorMessage.value"
            ></v-select>
          </v-col>    
        </v-row>
  
        <v-row>
            <v-col>
                <v-btn v-if="disabled" color="pink-accent-3" block @click="handleDisabled()">
                  ¿Editar Cliente?
                </v-btn>
                <v-btn v-else color="pink-accent-3" block @click="submit">
                  Guardar Cambios
                </v-btn>
            </v-col>
            <v-col>
                <v-btn color="indigo" block @click="verificarMantencionesExisten()">
                  Crear Mantención
                </v-btn>
            </v-col>
        </v-row>
      </v-form>
    </v-card>

    <!-- DIALOGO SI HAY MANTENCIONES ABIERTAS -->
    <v-dialog v-model="dialogVisible" max-width="500px">  
      <v-btn color="primary">
        Atención
      </v-btn>   
      <v-card> 
       <v-card-subtitle class="text-center mt-2"> <span style="color: black !important;"> Tienes <b>{{ mantenciones.length }} </b> {{ mantenciones.length == 1 ? 'mantención abierta aún, ¿ Deseas continuar con esta ?' : 'mantenciones abiertas aún, ¿ Deseas ir a alguna ?' }}  </span> </v-card-subtitle>
      <v-card-title>
        Mantenciones:
      </v-card-title>

      <v-list max-height="300">
        <v-list-item v-for="(mantencion, index) in mantenciones" :key="mantencion.id" @click="redirigirAMantencion(mantencion.id)">
          <v-list-item-title><b>{{ index + 1 }} - </b>Ir a Mantencion con fecha: <b>{{ formatedDate(mantencion.fecha)  }}</b> </v-list-item-title>
        </v-list-item>
      </v-list>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" text @click="dialogVisible = false">
          Cerrar
        </v-btn>
        <v-btn color="indigo" text @click="crearMantencion()">
          No, crear nueva mantención
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
    <!--FIN DIALOGO SI HAY MANTENCIONES ABIERTAS -->
</template>