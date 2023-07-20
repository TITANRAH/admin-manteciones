<script setup>
import { addDoc, collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useField, useForm } from 'vee-validate';
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFirestore } from 'vuefire';
import { costosSchema } from '../validations/costosSchema';
import { propertyPrice } from '../helpers/index';
import Swal from 'sweetalert2';
import { formatDate } from "@fullcalendar/core";

const route = useRoute()
const router = useRouter()
const db = useFirestore()
const costos = ref([]);
const showButtonActions = ref(true)
const isNotMobile = ref(false)

const nombreServicio = useField('nombreServicio')
const valorServicio = useField('valorServicio')
const estadoPagoCosto = useField('estadoPagoCosto', {
    initialValue: false
});

const nuevoCosto = ref({
    nombreServicio: nombreServicio.value.value,
    valorServicio: valorServicio.value.value,
    estadoPagoCosto: estadoPagoCosto.value.value
})

const handleResize = () => {
  const mobileThreshold = 900; // Puedes ajustar este valor según tus necesidades
  isNotMobile.value = window.innerWidth <= mobileThreshold;

  console.log('valor de isNotMobile en guardar costo maintenance', isNotMobile.value)
};


onMounted(async () => {
    handleResize()
    window.addEventListener('resize', handleResize); 
    const idMantencion = route.params.idMantencion;
    const idCliente = route.params.idCliente;
    const mantencionDocRef = doc(db, 'clientes', idCliente, 'mantenciones', idMantencion);
    const mantencionDocSnap = await getDoc(mantencionDocRef);
    console.log(mantencionDocSnap.data());
    if (mantencionDocSnap.exists()) {
        const mantencionData = mantencionDocSnap.data();

        const fecha = new Date()
        const fechaString = fecha.toISOString()
        // const options = {
        //     year: 'numeric',
        //     month: 'long',
        //     day: 'numeric',
        //     hour: 'numeric',
        //     minute: 'numeric',
        //     second: 'numeric',
        //     timeZone: 'America/Santiago'
        // };

        for (const key in mantencionData) {
            if (key !== 'fechaMantencion' && key !== 'detallesVehiculo' && key !== 'aceiteDescripcion' &&
                key !== 'inspeccionVisualMotor' && key !== 'revisiones' && key !== 'usoFamiliar' && key !== 'usoLaboral' && key !== 'cambioAceite' && mantencionData[key]) {

                const nuevoCosto = {
                    fecha: formatDate(fechaString),
                    nombreServicio: key,
                    valorServicio: '',
                    estadoPagoCosto: false
                };
                costos.value.push(nuevoCosto);
            }
        }
        console.log(mantencionData.fechaMantencion)
        console.log('Costos:', costos.value);
    } else {
        console.log('La mantención no existe');
    }
    console.log('Costos:', costos.value);
})

// const db = useFirestore()
// const costos = ref([]);




const addCosto = () => {

    showButtonActions.value = false;
    const fecha = new Date()
    const fechaString = fecha.toISOString()
    // const options = {
    //     year: 'numeric',
    //     month: 'long',
    //     day: 'numeric',
    //     hour: 'numeric',
    //     minute: 'numeric',
    //     second: 'numeric',
    //     timeZone: 'America/Santiago'
    // };
    nuevoCosto.value = {
        fecha: formatDate(fechaString),
        nombreServicio: nombreServicio.value.value,
        valorServicio: valorServicio.value.value,
        estadoPagoCosto: estadoPagoCosto.value.value
    };

    costos.value.push(nuevoCosto.value);

    console.log(costos.value)
};

const removeCosto = (index) => {
    costos.value.splice(index, 1);

    if (costos.value.length == 0) {

        showButtonActions.value = true
    }
};

const { handleSubmit } = useForm({
    validationSchema: {
        ...costosSchema
    }
})

const submit = handleSubmit(async () => {
    // Guardar los datos principales de la mantención

    console.log('entro al submit', costos.value);

    // Verificar si la mantención tiene costos asociados
    const costosMantencionRef = collection(
        db,
        'clientes',
        route.params.idCliente,
        'mantenciones',
        route.params.idMantencion,
        'costosMantencion'
    );
    const costosQuerySnapshot = await getDocs(costosMantencionRef);
    const tieneCostos = !costosQuerySnapshot.empty;

    if (tieneCostos) {
        // Redirigir a la pantalla de costo asociado
        const costoAsociadoId = costosQuerySnapshot.docs[0].id;

        Swal.fire({
            title: 'Atención',
            text: 'Esta mantención ya tiene un costo asociado, serás redirigido a la página del costo',
            icon: 'info',
            confirmButtonText: 'Aceptar'
        }).then(() => {
            router.push({
                name: 'costo-mantencion',
                params: {
                    idCliente: route.params.idCliente,
                    idMantencion: route.params.idMantencion,
                    idCosto: costoAsociadoId
                }
            });
        });


    } else {
        // No tiene costos asociados, permanecer en la pantalla actual para crear un nuevo costo
        for (const costo of costos.value) {
            if (
                costo.estadoPagoCosto === undefined ||
                costo.estadoPagoCosto === null ||
                costo.estadoPagoCosto === '' ||
                costo.estadoPagoCosto === 'false'
            ) {
                costo.estadoPagoCosto = false;
            }
        }

        const costosRef = collection(
            db,
            'clientes',
            route.params.idCliente,
            'mantenciones',
            route.params.idMantencion,
            'costosMantencion'
        );

        const costosDocRef = await addDoc(costosRef, { costos: costos.value });
        console.log('Array de costos guardado con ID:', costosDocRef.id);

        if (costosDocRef.id) {

            Swal.fire({
                title: 'Costo guardado correctamente',
                text: 'Serás redirigido a la página del costo guardado',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            }).then(() => {

                router.push({
                    name: 'costo-mantencion',
                    params: {
                        idCliente: route.params.idCliente,
                        idMantencion: route.params.idMantencion,
                        idCosto: costosDocRef.id
                    }
                });
                costos.value = [];
                showButtonActions.value = true;
            })
        }
    }
});




const pendiente = computed(() => {
    return costos.value.reduce((total, costo) => {
        const valorServicio = parseFloat(costo.valorServicio);
        const estadoPagoCosto = costo.estadoPagoCosto;

        if (!isNaN(valorServicio) && !estadoPagoCosto) {
            return total + valorServicio;
        } else {
            return total;
        }
    }, 0);
});

const pagado = computed(() => {

    return costos.value.reduce((total, costo) => {
        const valorServicio = parseFloat(costo.valorServicio);
        const estadoPagoCosto = costo.estadoPagoCosto;

        if (!isNaN(valorServicio) && estadoPagoCosto) {
            return total + valorServicio;
        } else {
            return total;
        }
    }, 0);
})





</script>
<template>
    <div>
        <v-card-subtitle class="text-h5 py-5 px-3 text-indigo">
            Ingresa los costos
        </v-card-subtitle>
        <v-form>
            <v-table  class="tabla">
                <thead>
                    <tr>
                        <th class="text-left">
                            Servicio
                        </th>
                        <th class="text-left">
                            Valor
                        </th>
                        <th class="text-left">
                            Estado
                        </th>
                        <th class="text-left">

                            <v-row class="acciones">
                                <p>Acciones</p>
                                <v-btn v-if="showButtonActions" class="mb-3 mt-2 mr-2 ml-5" color="green" icon>
                                    <v-icon @click="addCosto()">mdi-plus</v-icon>
                                </v-btn>
                            </v-row>
                        </th>
                    </tr>
                </thead>
                <tbody v-if="!isNotMobile">
                    <tr v-for="(costo, index) in costos" :key="index">
                        <td><v-text-field v-model="costo.nombreServicio"
                                :error-messages="nombreServicio.errorMessage.value"></v-text-field></td>
                        <td><v-text-field v-model="costo.valorServicio" :error-messages="valorServicio.errorMessage.value">$
                            </v-text-field></td>
                        <td>
                            <v-switch v-model="costo.estadoPagoCosto" hide-details inset
                                :label="`${(costo.estadoPagoCosto == undefined || costo.estadoPagoCosto == 'No Pagado' || costo.estadoPagoCosto == false ? 'Pendiente' : 'Pagado')}`">
                            </v-switch>
                        </td>
                        <td class="btn-actions">

                            <v-btn class="mb-3 mt-2 mr-2" color="red" icon>
                                <v-icon @click="removeCosto(index)">mdi-minus-thick</v-icon>
                            </v-btn>
                            <v-btn class="mb-3 mt-2 mr-2 ml-5" color="green" icon>
                                <v-icon @click="addCosto()">mdi-plus</v-icon>
                            </v-btn>

                        </td>
                    </tr>


                </tbody>
            </v-table>

            <v-card v-if="isNotMobile" class="mt-3" v-for="(costo, index) in costos" :key="index">
                <v-list>

                    <v-list-item>
                      
                        <v-list-item-subtitle><v-text-field v-model="costo.nombreServicio"
                                :error-messages="nombreServicio.errorMessage.value"></v-text-field>
                        </v-list-item-subtitle>
                        <v-list-item-subtitle> <v-text-field v-model="costo.valorServicio" :error-messages="valorServicio.errorMessage.value">$
                            </v-text-field></v-list-item-subtitle>
                        <v-list-item-subtitle><v-switch v-model="costo.estadoPagoCosto" hide-details inset
                                :label="`${(costo.estadoPagoCosto == undefined || costo.estadoPagoCosto == 'No Pagado' || costo.estadoPagoCosto == false ? 'Pendiente' : 'Pagado')}`">
                            </v-switch></v-list-item-subtitle>
                     <v-row class="botones-movil">
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
                     </v-row>
                    </v-list-item>

                </v-list>
            </v-card>
            <div v-if="costos.value != []" class="boton mt-6">
                <v-btn color="green" class="w-50" @click="submit">Guardar</v-btn>
            </div>

        </v-form>
    </div>

    <v-card class="mt-6" elevation="0">

        <v-card-subtitle class="text-h5 py-5 px-3 text-indigo">
            Contabilidad
        </v-card-subtitle>
        <v-table>

            <thead>
                <tr>
                    <th class="text-left">
                        Servicio
                    </th>
                    <th class="text-left">
                        Valor
                    </th>
                    <th class="text-left">
                        Estado
                    </th>

                </tr>
            </thead>
            <tbody>
                <tr v-for="(costo, index) in costos" :key="index">
                    <td>{{ costo.nombreServicio }}</td>
                    <td>$ {{ costo.valorServicio }}</td>
                    <td>{{ costo.estadoPagoCosto ? 'Pagado' : 'No pagado' }}</td>
                </tr>
            </tbody>
        </v-table>
    </v-card>



    <v-card v-if="costos.value != []" class=" mx-auto mt-5" max-width="500">
        <v-card-subtitle class="text-h5 py-5 px-3 text-indigo">
            Contabilidad
        </v-card-subtitle>
        <v-table>

            <thead>
                <tr>
                    <th class="text-left">
                        Servicio
                    </th>
                    <th class="text-left">
                        Valor
                    </th>
                    <th class="text-left">
                        Estado
                    </th>

                </tr>
            </thead>
            <tbody>
                <tr v-for="(costo, index) in costos" :key="index">
                    <td>{{ costo.nombreServicio }}</td>
                    <td>$ {{ costo.valorServicio ? propertyPrice(costo.valorServicio) : 0 }}</td>
                    <td>{{ costo.estadoPagoCosto ? 'Pagado' : 'Pendiente' }}</td>
                </tr>
            </tbody>
        </v-table>
        <v-divider></v-divider>

        <div class="d-flex justify-start py-5 px-3">
            <div class="text-left">
                <div> <b>Pagado:</b> {{ propertyPrice(pagado) }}</div>
                <div><b>Pendiente:</b> {{ propertyPrice(pendiente) }}</div>
                <v-divider></v-divider>
                <div class="mt-2"><b>Total Contable:</b> {{ propertyPrice(pagado) }}</div>
                <div><b>Total Pendiente:</b> {{ propertyPrice(pendiente) }}</div>
            </div>
        </div>

    </v-card>
</template>




<style>
.acciones {
    display: flex;
    align-items: center;
    flex-direction: row;
}

.boton {
    display: flex;
    justify-content: center;
}

@media (max-width: 600px) {
    .acciones p {
        display: none;
    }
}

.datos {
    display: flex;
    justify-content: right;
}
</style>