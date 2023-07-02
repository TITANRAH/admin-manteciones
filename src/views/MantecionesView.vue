<script setup>

import useMantenciones from '../composables/useMaintenance'
import Mantencion from '../components/Mantencion.vue';
import { useForm, useField } from 'vee-validate';
import { filterSchema } from '../validations/filterSchema';


const {   filterItems, patente
        } = useMantenciones()


const { handleSubmit } = useForm({filterSchema})
const submit = handleSubmit((value)=>{
    
    patente.value = value['filter']
   
})

const filter = useField('filter')

</script>
<template>
    <h1 class="text-indigo mb-10"> <v-icon color="indigo" icon="mdi-car-cog" class="mr-3"></v-icon>Mantenciones</h1>

    <v-card flat max-width="600" class=" my-10">
        <v-card-title class="text-h5 font-weight-bold mb-2">
            Buscar por patente
        </v-card-title>

        <v-form class="">

            <v-row>
            <v-col>
                <v-text-field
                    type="text"
                    label="Patente"
                    bg-color="blue-grey-lighten-5"
                    v-model="filter.value.value"
                    class="mb-1"
                    :error-messages="filter.errorMessage.value"
                />

            </v-col>

            <v-col>
                
                <v-icon 
                size="50"
                    block
                    icon="mdi-car-search-outline"
                    color="indigo"
                    @click="submit"
                    >
                </v-icon>
            </v-col>
        </v-row>

           
        </v-form>
    </v-card>
    <v-row>
        <Mantencion 
        
        v-for="mantencion in filterItems"
        :key="mantencion.id"
        :propiedad="mantencion"
        
        />
       
    </v-row>
</template>


<style></style>