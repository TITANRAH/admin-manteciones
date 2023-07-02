<template>



   <v-card max-width="800" :to="{name: 'mantencion', params: {id: 1}}" flat class="mx-2 my-2 rounded-xl rounded-be-0">

      <v-row >
        
               <v-card color="#3f51b5"  max-width="405" flat class="py-3 px-3" >
                  <v-row class="py-2 px-2">
                     
                     <v-col sm="4">
                        <v-avatar color="#dfedff" size="50">
                          <v-icon icon="mdi-account-check" color="indigo"></v-icon>
                        </v-avatar>
                     </v-col>

                     <v-col cols="8" md="8" sm="12">
                        <h4 class="text-white">Sergio Miranda</h4>
                        <h6 class="text-white">Auto Lada año: 1995</h6>
                     </v-col>

                     <v-col class="mt-3" cols="12" md="12" sm="4">
                           <v-row>
                              <v-col cols="12" md="4">
                                 <h6 class="text-grey">Patente:</h6>
                                 <h6 class="text-white">KD-AD-12</h6>
                              </v-col>
                              <v-col cols="12" md="4">
                                 <h6 class="text-grey no-wrap" style="white-space: nowrap">Mantención realizada:</h6>
                                 <h6 class="text-white">12-07-2023</h6>
                              </v-col>
                              <v-col cols="12" sm="4">
                                 <h6 class="text-grey no-wrap" style="white-space: nowrap">Próxima Mantención:</h6>
                                 <h6 class="text-white">12-02-2024</h6>
                              </v-col>
                           </v-row>
                     </v-col>
                  </v-row>

               </v-card>
       

      </v-row>

   </v-card>
   

 
</template>

<script setup>

</script>

<style>


</style>