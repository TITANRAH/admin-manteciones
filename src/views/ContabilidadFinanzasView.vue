<script setup>

import { useContabilidadStore } from '../stores/contabilidad';
import { propertyPrice } from '@/helpers';
import { RouterLink } from 'vue-router';



const contabilidad = useContabilidadStore();

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
</script>
<template>
    <div class="container">
        <div class="reporte-container">
            <h2 class="reporte-title text-indigo" >Ganancias por Mes</h2>

            <v-select v-model="contabilidad.selectedYear" :items="contabilidad.years" label="Año"
                placeholder="Selecciona año" outlined></v-select>

            <v-list>
                <v-list v-if="contabilidad.gananciasPorMes">
                    <v-list-item v-for="(ganancia, mes) in contabilidad.gananciasPorMes" :key="mes">
      
                            <v-list-item-title >
                                {{ nombresMeses[mes.split('-')[0]] }} - Ganancia: <b>{{ propertyPrice(ganancia) }}</b> 
                            </v-list-item-title>
                            
                            <v-list-item-subtitle class="mt-1">
                               Mantenciones: {{ contabilidad.cantidadMantencionesPorMes[mes] || 0 }}

                                <v-btn elevation="0" class="text-indigo" @click="contabilidad.verDetallePorMes(mes)"> <b>ir a detalle</b> <v-icon class="ml-2">mdi-eye-outline</v-icon> </v-btn>
                            </v-list-item-subtitle>
                            <v-divider class="mt-1"></v-divider>                   
                    </v-list-item>
                </v-list>
            </v-list>
        </div>
    </div>
</template>
  
  
<style>
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
}

.reporte-container {
    margin-top: 24px;
}

.reporte-title {
    font-size: 24px;
    margin-bottom: 16px;
}
</style>