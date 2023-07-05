<script setup>

import useMantenciones from '../composables/useMaintenance';
import { formatedDate } from '../helpers/index'
import { onMounted, ref } from 'vue';

const { contactar, enviarWhatsapp, cambiarCampo, sendMail } = useMantenciones()

const fechaFormateada = ref('')
const props = defineProps({
   mantencion: {
      type: Object
   },
})
// utilizar fecha

onMounted(() => {
   calculoFechaProximaMantencion()
})

const calculoFechaProximaMantencion = () => {

   const fechaOriginal = new Date(props.mantencion?.fechaMantencion);
   const fechaCalculada = new Date(fechaOriginal.getFullYear(), fechaOriginal.getMonth() + 6, fechaOriginal.getDate());
   fechaFormateada.value = `${fechaCalculada.getDate()}/${fechaCalculada.getMonth() + 1}/${fechaCalculada.getFullYear()}`;
   const tiempoRestante = fechaCalculada.getTime() - Date.now();
   const semanas = Math.ceil(tiempoRestante / (1000 * 60 * 60 * 24 * 7));
   const semanasRestantes = semanas;
   //  console.log('semanasRestantes.value', semanasRestantes.value)
   //  console.log('contactar Cliente desde compsable', contactarCliente.value)

   if (semanasRestantes == 2) {
      contactar.value = true;
      cambiarCampo(props.mantencion?.id, true)
   if (props.mantencion?.contactarCliente == true) {
         sendMail(props.mantencion?.correoDueño, props.mantencion?.id).then((value) => console.log(value))
      }
   } else {
      contactar.value = false
      // cambiarCampo(props.mantencion?.id, false)
   }
};

</script>
<template>
   <v-card max-width="800" :to="{ name: 'mantencion', params: { id: props.mantencion?.id } }" flat
      class="mx-2 my-2 rounded-xl rounded-be-0">
      <v-row>
         <v-card :color="contactar ? '#ba4a4d' : '#3f51b5'" max-width="405" flat class="py-3 px-3">
            <v-row class="py-2 px-2">
               <v-col sm="4">
                  <v-avatar color="#dfedff" size="50">
                     <v-icon v-if="!contactar" icon='mdi-account-check' color="indigo"></v-icon>
                     <v-icon v-else icon='mdi-chat-alert-outline' color="#ba4a4d"
                        @click="enviarWhatsapp(props.mantencion?.fonoDueño, props.mantencion?.nombreDueño)"></v-icon>
                  </v-avatar>
               </v-col>
               <v-col cols="8" md="8" sm="12">
                  <h4 class="text-white">{{ props.mantencion?.nombreDueño }}</h4>
                  <h6 class="text-white">Auto: {{ props.mantencion?.marcaVehiculo + ' ' + props.mantencion?.añoVehiculo }}
                  </h6>
                  <h6 class="text-white">Patente: {{ props.mantencion?.patenteVehiculo }}</h6>
               </v-col>
               <v-col class="mt-3" cols="12" md="12" sm="4">
                  <v-row>
                     <v-col cols="12" md="4">
                        <h6 :class="contactar ? 'text-white no-wrap' : 'text-grey no-wrap'" style="white-space: nowrap">
                           Mantención realizada:</h6>
                        <h6 class="text-white">El día: {{ formatedDate(props.mantencion?.fechaMantencion) }}</h6>
                     </v-col>
                     <v-col cols="12" sm="4">
                        <h6 :class="contactar ? 'text-white no-wrap' : 'text-grey no-wrap'" style="white-space: nowrap">
                           Próxima Mantención:</h6>
                        <!-- realizar helper que calcule la proxima mantencion -->
                        <h6 class="text-white">El día: {{ fechaFormateada }}</h6>
                     </v-col>
                     <v-col cols="12" md="4">
                        <h6 :class="contactar ? 'text-white no-wrap' : 'text-grey no-wrap'">Km. Actual:</h6>
                        <h6 class="text-white">{{ props.mantencion?.kmVehiculo }} Km.</h6>
                     </v-col>
                  </v-row>
               </v-col>
            </v-row>
         </v-card>
      </v-row>
   </v-card>
</template>

<style></style>