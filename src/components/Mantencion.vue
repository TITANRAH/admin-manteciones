<script setup>
import useMantenciones from '../composables/useMaintenance';



const { calculoKmProxMantencion ,contactar } = useMantenciones()


defineProps({
   mantencion: {
      type: Object
   },
})
// utilizar fecha

</script>

<template>
   <v-card max-width="800" :to="{ name: 'mantencion', params: { id: mantencion?.id } }" flat
      class="mx-2 my-2 rounded-xl rounded-be-0">

      <v-row>

         <v-card :color="contactar ? '#ba4a4d' : '#3f51b5'" max-width="405" flat class="py-3 px-3">
            <v-row class="py-2 px-2">

               <v-col sm="4">
                  <v-avatar color="#dfedff" size="50">
                     <v-icon :icon="contactar ? 'mdi-card-account-phone' : 'mdi-account-check'" :color="contactar ? '#ba4a4d' : 'indigo'" ></v-icon>
                  </v-avatar>
               </v-col>

               <v-col cols="8" md="8" sm="12">
                  <h4 class="text-white">{{ mantencion?.nombreDueño }}</h4>
                  <h6 class="text-white">Auto: {{ mantencion?.marcaVehiculo + ': ' + mantencion?.añoVehiculo }}</h6>
                  <h6 class="text-white">Patente: {{ mantencion?.patenteVehiculo }}</h6>
               </v-col>

               <v-col class="mt-3" cols="12" md="12" sm="4">
                  <v-row>
                  
                     <v-col cols="12" md="4">
                        <h6 :class="contactar ? 'text-white no-wrap' : 'text-grey no-wrap'" style="white-space: nowrap">Mantención realizada:</h6>
                        <h6 class="text-white">El día: {{ mantencion?.fechaMantencion }}</h6>
                     </v-col>
                     <v-col cols="12" md="4">
                        <h6 :class="contactar ? 'text-white no-wrap' : 'text-grey no-wrap'">Km. Actual:</h6>
                        <h6 class="text-white">{{ mantencion?.kmVehiculo }} Km.</h6>
                     </v-col>
                     <v-col cols="12" sm="4">
                        <h6 :class="contactar ? 'text-white no-wrap' : 'text-grey no-wrap'" style="white-space: nowrap">Próxima Mantención:</h6>
                        <!-- realizar helper que calcule la proxima mantencion -->
                        <h6 class="text-white">A los {{ calculoKmProxMantencion(mantencion?.kmVehiculo,
                           mantencion?.cambioAceite) }} Km.</h6>
                     </v-col>
                  </v-row>
               </v-col>
            </v-row>
         </v-card>
      </v-row>
   </v-card>
</template>

<style></style>