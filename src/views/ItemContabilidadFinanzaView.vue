<script setup>
import { ref, onMounted } from 'vue';
import { useFirestore } from 'vuefire';
import { doc, getDoc } from "firebase/firestore";
import { useRoute } from 'vue-router';
import { propertyPrice } from '@/helpers';


const route = useRoute();
const conta = ref({});
const progress = ref(false)
const tab = ref('')
const existe = ref(false)


// Función para obtener el documento por ID desde Firebase Firestore
async function getDocumentoPorId(id) {

    progress.value = true;
    try {
        const db = useFirestore();
        const docRef = doc(db, 'ContabilidadMantencionesFinalizadas', id);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
            conta.value = snapshot.data();
            existe.value = true;

            console.log(conta.value)

            if (conta.value != {}) {
                progress.value = false;
            }
        } else {
            existe.value = false
            setTimeout(() => {
                progress.value = false;
            }, 2500);
            console.log('El documento no existe');
        }
    } catch (error) {
        console.error('Error al obtener el documento:', error);
        progress.value = false;
    }
    setTimeout(() => {
        progress.value = false;
    }, 2000);
}

onMounted(async () => {
    tab.value = 'General'
    await getDocumentoPorId(route.params.id);
});
</script>
<template>
    <v-btn class="bg-indigo mb-5" :to="{ name: 'contabilidad-finanzas' }">Ir a Contabilidad</v-btn>
    <div class="text-center">
        <v-progress-circular class="center" v-if="progress" indeterminate></v-progress-circular>
    </div>

    <v-card v-if="existe" max-width="1190">
        <v-card-title>Nombre Cliente: {{ conta.nombreCliente }}</v-card-title>
        <v-card-subtitle>Fecha de Mantención: {{ conta.fechaDeMantencion }}</v-card-subtitle>

        <v-tabs v-model="tab" grow>
            <v-tab value="General">General</v-tab>
            <v-tab value="Servicios">Servicios</v-tab>
        </v-tabs>

        <v-card-text v-if="tab === 'General'">
            <!-- Aquí colocamos la información general -->
            <v-row>
                <v-col cols="12" md="6">
                    <p><strong>Descripción del servicio:</strong> {{ conta.descripcionServicio == '' ? 'Sin detalles' :
                        conta.descripcionServicio }}</p>
                    <p><strong>Teléfono del cliente:</strong> {{ conta.fonoCliente == '' ? 'Sin Teléfono' :
                        conta.fonoCliente }}</p>
                    <p><strong>Correo del cliente:</strong> {{ conta.correoCliente == '' ? 'Sin Correo' :
                        conta.correoCliente }}</p>
                    <p><strong>Valor contable:</strong> {{ propertyPrice(conta.valorContable) }}</p>
                    <p><strong>Fecha finalización costos:</strong> {{ conta.fechaFinalizacionCostos }}</p>
                    <p><strong>Kilometraje del auto:</strong> {{ conta.kmAuto }}</p>
                    <p><strong>Patente del vehículo:</strong> {{ conta.patenteVehiculo }}</p>
                </v-col>
            </v-row>
        </v-card-text>

        <v-card-text v-else-if="tab === 'Servicios'">
            <!-- Aquí colocamos los costos asociados -->
            <v-list>


                <v-list-item v-if="conta.costosAsociados.length > 0" v-for="(costo, index) in conta.costosAsociados"
                    :key="index">
                    <div>
                        <v-list-item-title>Nombre del Servicio: {{ costo.nombreServicio }}</v-list-item-title>
                        <v-list-item-subtitle>Estado de Pago: {{ costo.estadoPagoCosto ? 'Pagado' : 'Pendiente'
                        }}</v-list-item-subtitle>
                        <v-list-item-subtitle>Fecha de Pago: {{ costo.fecha }}</v-list-item-subtitle>
                        <v-list-item-subtitle>Valor del Servicio: {{ propertyPrice(costo.valorServicio)
                        }}</v-list-item-subtitle>
                    </div>
                    <v-divider class="mt-2"></v-divider>
                </v-list-item>



                <div v-else>
                    No hay costos asociados.
                </div>
            </v-list>
        </v-card-text>
    </v-card>

    <h3 v-else class="text-indigo">no hay contabilidad que mostrar</h3>
</template>
  
<style>
/* Estilos adicionales si los necesitas */
</style>
  