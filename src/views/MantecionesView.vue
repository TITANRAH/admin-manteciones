<script setup>

import useMantenciones from '../composables/useMaintenance'
import Mantencion from '../components/Mantencion.vue';
import { useField } from 'vee-validate';
import { watch } from 'vue';



const { filterItems, patente, filtro
} = useMantenciones()


// watch(
//     semanasRestantes,
//       (nuevosItems, viejosItems) => {
//         console.log('semanasRestantes.value desde ', nuevosItems)

//       },
//     //     nuevosItems.forEach((mantencion) => {
//     //       if (
//     //         mantencion.contactarCliente &&
//     //         mantencion.semanasRestantes === 2 &&
//     //         !sentEmails.value.includes(mantencion.id)
//     //       ) {
//     //         enviarCorreo(mantencion.id, mantencion.mailCliente);
//     //         sentEmails.value.push(mantencion.id);
//     //       }
//     //     });

//     //     // Guarda la lista actualizada en el almacenamiento local
//     //     localStorage.setItem('sentEmails', JSON.stringify(sentEmails.value));
//     //   },
//       { deep: true }
//     );


const filter = useField('filter')

const filtrado = () => {
    if (filter.value.value != '' || filter.value.value != undefined) {
        filtro.value = filter.value.value
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
                <v-text-field type="text" label="Busca por Patente o por Nombre de Cliente" bg-color="blue-grey-lighten-5"
                    v-model="filter.value.value" class="mb-1" @input="filtrado" />
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