<script setup>

import useMantenciones from '../composables/useMaintenance'
import Mantencion from '../components/Mantencion.vue';
import { useField } from 'vee-validate';



const { filterItems, patente, nombre
} = useMantenciones()


const patenteFilter = useField('patenteFilter')
const nameFilter = useField('nameFilter')

const filterPatente = () => {
    if (patenteFilter.value.value != '' || patenteFilter.value.value != undefined) {
        patente.value = patenteFilter.value.value
    } else {
        return
    }
}

const filterName = () => {  
    if (nameFilter.value.value != '' || nameFilter.value.value != undefined) {
        nombre.value = nameFilter.value.value
    } else {
        return
    }
}
</script>
<template>
    <h1 class="text-indigo mb-10"> <v-icon color="indigo" icon="mdi-car-cog" class="mr-3"></v-icon>Mantenciones</h1>
    <v-card flat>
        <v-row>
            <v-col cols="12" md="6" sm="6">
                <v-text-field type="text" label="Busca por Patente" bg-color="blue-grey-lighten-5"
                    v-model="patenteFilter.value.value" class="mb-1" @input="filterPatente" />
            </v-col>
           <v-col cols="12" md="6" sm="6">
                <v-text-field type="text" label="Busca por Nombre de Cliente" bg-color="blue-grey-lighten-5"
                    v-model="nameFilter.value.value" class="mb-1" @input="filterName" />
            </v-col>
        </v-row>
    </v-card>
    <v-row>
        <Mantencion 
                v-for="mantencion in filterItems" 
                :key="mantencion.id" 
                :mantencion="mantencion" />
    </v-row>
</template>


<style></style>