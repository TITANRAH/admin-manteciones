        
<script setup>
import { formatedDate, propertyPrice } from '@/helpers';
import { onMounted, ref, computed } from 'vue';
import { useContabilidadStore } from '../stores/contabilidad';
import { useRoute } from 'vue-router';
const route = useRoute()

console.log(route.params.mes)

const nombresMeses = {
    '01': 'Enero',
    '02': 'Febrero',
    '03': 'Marzo',
    '04': 'Abril',
    '05': 'Mayo',
    '06': 'Junio',
    '07': 'Julio',
    '08': 'Agosto',
    '09': 'Septiembre',
    '10': 'Octubre',
    '11': 'Noviembre',
    '12': 'Diciembre',
    // y así sucesivamente para los otros meses
};


const isMobile = ref(false)
const store = useContabilidadStore()

const handleResize = () => {
    const mobileThreshold = 900;
    isMobile.value = window.innerWidth <= mobileThreshold;
};

onMounted(() => {
    handleResize();
    window.addEventListener('resize', handleResize);


})

const mesConsulta = computed(()=>{
    return nombresMeses[route.params.mes]
})

</script>
<template>
      <v-btn class="bg-indigo" :to="{ name: 'dashboard' }">Ir a Dashboard</v-btn>

      <v-text-field v-model="store.searchTerm" label="Buscar por nombre o patente" class=" mt-4"></v-text-field>
    <v-card-subtitle class="text-h5 py-3 text-indigo">
     Detalle mes:  <b>{{ mesConsulta }}</b> 
    </v-card-subtitle>
    <table v-if="!isMobile" class="table">
        <thead>
            <tr>
                <th>Nombre</th>
                <th>Patente</th>
                <th>Valor Mantención</th>
                <th>Fecha Mantención</th>
                <th>Acción</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(mantencion, index) in store.filterMantencionPorMes" :key="index">
                <td>{{ mantencion.nombreCliente }}</td>
                <td>{{ mantencion.patenteVehiculo }}</td>
                <td>{{ propertyPrice(mantencion.valorContable) }}</td>
                <td>{{ formatedDate(mantencion.fechaDeMantencion) }}</td>
                <td><v-btn icon :to="{name: 'item-contabilidad-finanza', params:{ id: mantencion.id}}"><v-icon>mdi-eye-outline</v-icon></v-btn></td>
            </tr>
        </tbody>
    </table>

    <v-card class="mb-3" v-else v-for="(mantencion, index) in store.mantencionesPorMes" :key="index" min-width="355">
        <v-list>

            <v-list-item>
                <!-- <v-list-item-title><b>{{ cliente.nombre }}</b> </v-list-item-title> -->
                <v-list-item-subtitle class="mb-2">
                    <v-icon color="indigo" class="mr-1">mdi-account</v-icon>
                    <v-label> nombre:</v-label>
                    <b> {{ mantencion.nombreCliente }}</b>
                </v-list-item-subtitle>
                <v-list-item-subtitle class="mb-2">
                    <v-icon color="indigo" class="mr-1">mdi-car-info</v-icon>
                    <v-label>patente:</v-label>
                    <b>{{ mantencion.patenteVehiculo }}</b>
                </v-list-item-subtitle>
                <v-list-item-subtitle class="mb-2">
                    <v-icon color="indigo" class="mr-1">mdi-currency-usd</v-icon>
                    <v-label>precio:</v-label>
                    <b>{{ propertyPrice(mantencion.valorContable) }}</b>
                </v-list-item-subtitle>
                <v-list-item-subtitle class="mb-2">
                    <v-icon color="indigo" class="mr-1">mdi-calendar-range</v-icon>
                    <v-label>fecha Mantención:</v-label>
                    <b> {{ formatedDate(mantencion.fechaDeMantencion) }}</b>
                </v-list-item-subtitle>
                <v-list-item-subtitle class="mb-2">
                    <v-btn class="text-indigo" elevation="0" :to="{name: 'item-contabilidad-finanza', params:{ id: mantencion.id}}"><v-icon class="mr-1">mdi-eye</v-icon> Ver más</v-btn>
                </v-list-item-subtitle>


                <!-- <v-row class="botones-movil">
                    <v-col class="col">
                        <v-btn class="mb-3 mt-2 mr-2" color="red" icon>
                            <v-icon @click="removeCosto(index)">mdi-minus-thick</v-icon>
                        </v-btn>

                    </v-col>
                    <v-col class="col">
                        <v-btn class="mb-3 mt-2 mr-2 ml-5" color="green" icon>
                            <v-icon @click="addCosto()">mdi-plus</v-icon>
                        </v-btn>

                    </v-col>
                </v-row> -->
            </v-list-item>

        </v-list>
    </v-card>


    <!-- <div v-else>
        <v-row>
            <v-col v-for="(mantencion, index) in store.mantencionesPorMes" :key="index" cols="3">
                <v-card outlined class="ma-2" min-width="300">
                    <v-card-title>{{ mantencion.nombreCliente }}</v-card-title>
                    <v-card-subtitle>Patente: {{ mantencion.patenteVehiculo }}</v-card-subtitle>
                    <v-card-text>Valor: {{ propertyPrice(mantencion.valorContable) }}</v-card-text>
                    <v-card-text>Fecha: {{ formatedDate(mantencion.fechaDeMantencion) }}</v-card-text>
                    <v-card-actions>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </div> -->
</template>

<style>
.table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #ccc;
}

.table th,
.table td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ccc;
}

.v-card {
    max-width: 200px;
}
</style>

