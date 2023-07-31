<script setup>

import { UseProximasAtencionesStore } from '../stores/proximasAtenciones';
import useMantenciones from '../composables/useMaintenance';
import { onMounted, ref } from 'vue';

const isNotMobile = ref(false);
const loadingValue = ref(true)

const { enviarWhatsapp, sendMail } = useMantenciones();
const proximasAtenciones = UseProximasAtencionesStore()

const handleResize = () => {
    const mobileThreshold = 900; // Puedes ajustar este valor según tus necesidades
    isNotMobile.value = window.innerWidth > mobileThreshold;
};

onMounted(() => {



    handleResize(); // Ejecuta la función cuando se monta el componente
    window.addEventListener('resize', handleResize); // Agrega un listener para el evento 'resize'

    proximasAtenciones.fetchProximasAtenciones()

    if (proximasAtenciones.proximasAtenciones = []) {
        setTimeout(() => {
            loadingValue.value = false;
        }, 1000);
    } else {
        loadingValue.value = false
    }

    console.log(proximasAtenciones.proximasAtenciones)
})

</script>
<template>
    <v-btn class="bg-indigo mb-5" :to="{ name: 'dashboard' }">Ir a Dashboard</v-btn>
    <v-text-field v-model="proximasAtenciones.searchTerm" label="Buscar por nombre o patente" class=" mt-4"></v-text-field>
    <div v-if="isNotMobile">

        <div v-if="loadingValue" class="sk-chase">
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
        </div>
        <v-row v-else>
            <v-col cols="12">
                <v-table class="">
                    <thead>
                        <tr>
                            <th> <b>Cliente</b> </th>
                            <th> <b>Patente</b> </th>
                            <th> <b> Próxima Mantención</b></th>
                            <th> <b>Semanas Restantes</b> </th>
                            <th> <b>Acciones</b> </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(atencion, index) in proximasAtenciones.filterProximasAtenciones.sort((a, b) => proximasAtenciones.semanasRestantes(a.fechaProximaMantencion) - proximasAtenciones.semanasRestantes(b.fechaProximaMantencion))"
                            :key="index" class="cobros-pendientes-box">
                            <td>{{ atencion.nombreCliente }}</td>
                            <td>{{ atencion.patente }}</td>
                            <td>{{ atencion.fechaProximaMantencion }}</td>
                            <td>{{ 'En ' + proximasAtenciones.semanasRestantes(atencion.fechaProximaMantencion) + ' semanas'
                            }}</td>
                            <td>
                                <v-row>
                                    <v-col>
                                        <v-btn icon class="bg-purple"
                                            @click="sendMail(atencion.correoCliente, atencion.nombreCliente)"><v-icon>mdi-email-alert-outline</v-icon></v-btn>
                                    </v-col>

                                    <v-col>
                                        <v-btn icon class="bg-teal"
                                            @click="enviarWhatsapp(atencion.fonoCliente, atencion.nombreCliente)"><v-icon>mdi-whatsapp</v-icon></v-btn>
                                    </v-col>
                                    <v-col>
                                        <a :href="`tel:${atencion.fonoCliente}`"><v-btn class="mr-3 bg-yellow"
                                                icon><v-icon>mdi-phone</v-icon></v-btn></a>
                                    </v-col>
                                    <v-col>
                                        <v-btn icon class="bg-indigo" :to="{name: 'cliente', params: {id: atencion.idCliente}}"><v-icon>mdi-account</v-icon></v-btn>
                                    </v-col>
                                </v-row>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </v-col>
        </v-row>
    </div>

    <div v-else class="cobros-pendientes-box mb-4 mt-4">
        <div v-if="loadingValue" class="sk-chase">
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
        </div>
        <v-card v-else class="mt-3"
            v-for="(atencion, index) in proximasAtenciones.filterProximasAtenciones.sort((a, b) => proximasAtenciones.semanasRestantes(a.fechaProximaMantencion) - proximasAtenciones.semanasRestantes(b.fechaProximaMantencion))"
            :key="index" max-width="800">

            <v-list>

                <v-list-item class="cobros-pendientes-box">
                    <v-list-item-title><b>{{ atencion.nombreCliente }}</b> </v-list-item-title>
                    <v-list-item-subtitle>Patente:<b>{{ atencion.patente }}</b>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle>Próxima Mantención: <b>{{ atencion.fechaProximaMantencion }}</b>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle> Semanas Restantes:
                        <b>{{ proximasAtenciones.semanasRestantes(atencion.fechaProximaMantencion) + ' semanas'
                        }}</b></v-list-item-subtitle>
                    <v-list-item-subtitle>
                        <div class="botones-tel">
                            <v-btn icon class="bg-purple"
                                @click="sendMail(atencion.correoCliente, atencion.nombreCliente)"><v-icon>mdi-email-alert-outline</v-icon></v-btn>
                            <v-btn icon class="bg-teal"
                                @click="enviarWhatsapp(atencion.fonoCliente, atencion.nombreCliente)"><v-icon>mdi-whatsapp</v-icon></v-btn>
                            <a :href="`tel:${atencion.fonoCliente}`"><v-btn class="mr-3 bg-yellow"
                                    icon><v-icon>mdi-phone</v-icon></v-btn></a>
                            <v-btn icon class="bg-indigo" :to="{name: 'cliente', params: {id: atencion.idCliente}}"><v-icon>mdi-account</v-icon></v-btn>
                        </div>
                    </v-list-item-subtitle>
                </v-list-item>

            </v-list>
        </v-card>
    </div>
</template>


<style>
.botones-tel {
    display: flex;
    flex-direction: row;
    margin-top: 1rem;
    gap: 1rem;
    justify-content: center;
}

.v-table__wrapper {
    border-radius: inherit;
    overflow: hidden !important;
}

.cobros-pendientes-box {
    max-height: 65vh;
    overflow-x: scroll;
}

.sk-chase {
    width: 80px;
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    align-content: center;
    position: relative;
    animation: sk-chase 2.5s infinite linear both;
    margin: 0 auto;

    /* Agrega esta línea para centrar horizontalmente */
}

.sk-chase-dot {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    animation: sk-chase-dot 2.0s infinite ease-in-out both;
}

.sk-chase-dot:before {
    content: '';
    display: block;
    width: 25%;
    height: 25%;
    background-color: indigo;
    border-radius: 100%;
    animation: sk-chase-dot-before 2.0s infinite ease-in-out both;
}

.sk-chase-dot:nth-child(1) {
    animation-delay: -1.1s;
}

.sk-chase-dot:nth-child(2) {
    animation-delay: -1.0s;
}

.sk-chase-dot:nth-child(3) {
    animation-delay: -0.9s;
}

.sk-chase-dot:nth-child(4) {
    animation-delay: -0.8s;
}

.sk-chase-dot:nth-child(5) {
    animation-delay: -0.7s;
}

.sk-chase-dot:nth-child(6) {
    animation-delay: -0.6s;
}

.sk-chase-dot:nth-child(1):before {
    animation-delay: -1.1s;
}

.sk-chase-dot:nth-child(2):before {
    animation-delay: -1.0s;
}

.sk-chase-dot:nth-child(3):before {
    animation-delay: -0.9s;
}

.sk-chase-dot:nth-child(4):before {
    animation-delay: -0.8s;
}

.sk-chase-dot:nth-child(5):before {
    animation-delay: -0.7s;
}

.sk-chase-dot:nth-child(6):before {
    animation-delay: -0.6s;
}

@keyframes sk-chase {
    100% {
        transform: rotate(360deg);
    }
}

@keyframes sk-chase-dot {

    80%,
    100% {
        transform: rotate(360deg);
    }
}

@keyframes sk-chase-dot-before {
    50% {
        transform: scale(0.4);
    }

    100%,
    0% {
        transform: scale(1.0);
    }
}
</style>