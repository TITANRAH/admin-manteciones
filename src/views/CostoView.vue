<script setup>
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { useField, useForm } from 'vee-validate';
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useFirestore } from 'vuefire';
import { costosSchema } from '../validations/costosSchema';
import { propertyPrice } from '../helpers/index';

const route = useRoute()
const db = useFirestore()
const showButtonActions = ref(true)
const costosAsociados = ref([])
const showButtonFinishCost = ref(false)

const costos = ref([])

console.log('id costo', route.params.idCosto)

const nombreServicio = useField('nombreServicio')
const valorServicio = useField('valorServicio')
const estadoPagoCosto = useField('estadoPagoCosto', {
    initialValue: false
});

// const nuevoCosto = ref({
//     nombreServicio: nombreServicio.value.value,
//     valorServicio: valorServicio.value.value,
//     estadoPagoCosto: estadoPagoCosto.value.value
// })



onMounted(async () => {
    const idMantencion = route.params.idMantencion;
    const idCliente = route.params.idCliente;
    const idCosto = route.params.idCosto;
    const costoDocRef = doc(
        db,
        'clientes',
        idCliente,
        'mantenciones',
        idMantencion,
        'costosMantencion',
        idCosto
    );
    const costoDocSnap = await getDoc(costoDocRef);

    if (costoDocSnap.exists()) {
        costos.value = costoDocSnap.data();
        console.log('costo en costoView', costos.value);

        // Resto de la lógica para manejar el costo
    } else {
        console.log('El documento de costo no existe');
    }

    console.log('Costo:', costos.value.costos);

    for (const costo of costos.value.costos) {
        const nuevoCosto = {
            fecha: costo.fecha,
            nombreServicio: costo.nombreServicio,
            valorServicio: costo.valorServicio,
            estadoPagoCosto: costo.estadoPagoCosto
        };
        costosAsociados.value.push(nuevoCosto)
    }

    // Verificar si todos los campos estadoPagoCosto son true
    costosAsociados.value.every(
        (costo) => {
            if (costo.estadoPagoCosto === true) {
                console.log('si vienen todos en true')

                // Establecer el valor de showButtonFinishCost en consecuencia
                showButtonFinishCost.value = true;
            } else {

                console.log('viene al menos uno falso')
                showButtonFinishCost.value = false;

            }
        }
    );




});

console.log('costosAsociados', costosAsociados.value)

const pendiente = computed(() => {
    return costosAsociados.value.reduce((total, costo) => {
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

    return costosAsociados.value.reduce((total, costo) => {
        const valorServicio = parseFloat(costo.valorServicio);
        const estadoPagoCosto = costo.estadoPagoCosto;

        if (!isNaN(valorServicio) && estadoPagoCosto) {
            return total + valorServicio;
        } else {
            return total;
        }
    }, 0);
})




const submit = (event) => {
    event.preventDefault();
    // Guardar los datos principales de la mantención

    console.log('entro al submit', costosAsociados.value);

    // // Verificar si la mantención tiene costos asociados
    // const costosMantencionRef = collection(
    //     db,
    //     'clientes',
    //     route.params.idCliente,
    //     'mantenciones',
    //     route.params.idMantencion,
    //     'costosMantencion'
    // );
    // const costosQuerySnapshot = await getDocs(costosMantencionRef);
    // const tieneCostos = !costosQuerySnapshot.empty;

    // if (tieneCostos) {
    //     // Redirigir a la pantalla de costo asociado
    //     const costoAsociadoId = costosQuerySnapshot.docs[0].id;

    //     Swal.fire({
    //         title: 'Atención',
    //         text: 'Esta mantención ya tiene un costo asociado, serás redirigido a la página del costo',
    //         icon: 'info',
    //         confirmButtonText: 'Aceptar'
    //     }).then(() => {
    //         router.push({
    //             name: 'costo-mantencion',
    //             params: {
    //                 idCliente: route.params.idCliente,
    //                 idMantencion: route.params.idMantencion,
    //                 idCosto: costoAsociadoId
    //             }
    //         });
    //     });


    // } else {
    //     // No tiene costos asociados, permanecer en la pantalla actual para crear un nuevo costo
    //     for (const costo of costos.value) {
    //         if (
    //             costo.estadoPagoCosto === undefined ||
    //             costo.estadoPagoCosto === null ||
    //             costo.estadoPagoCosto === '' ||
    //             costo.estadoPagoCosto === 'false'
    //         ) {
    //             costo.estadoPagoCosto = false;
    //         }
    //     }

    //     const costosRef = collection(
    //         db,
    //         'clientes',
    //         route.params.idCliente,
    //         'mantenciones',
    //         route.params.idMantencion,
    //         'costosMantencion'
    //     );

    //     const costosDocRef = await addDoc(costosRef, { costos: costos.value });
    //     console.log('Array de costos guardado con ID:', costosDocRef.id);

    //     if (costosDocRef.id) {

    //         Swal.fire({
    //             title: 'Costo guardado correctamente',
    //             text: 'Serás redirigido a la página del costo guardado',
    //             icon: 'success',
    //             confirmButtonText: 'Aceptar'
    //         }).then(() => {

    //             router.push({
    //                 name: 'costo-mantencion',
    //                 params: {
    //                     idCliente: route.params.idCliente,
    //                     idMantencion: route.params.idMantencion,
    //                     idCosto: costosDocRef.id
    //                 }
    //             });
    //             costos.value = [];
    //             showButtonActions.value = true;
    //         })
    //     }
    // }
};


watch(
    costosAsociados.value,
    (newCostos, oldCostos) => {
        if (newCostos) {      
            newCostos.every((costo) => {
                if (costo.estadoPagoCosto === true) {
                    showButtonFinishCost.value = true;
                }             
                if (costo.estadoPagoCosto === false) {
                    showButtonFinishCost.value = false;
                }
            });
        }
    }
);

</script>
<template>
    <v-form>
        <div>
            <v-card-subtitle class="text-h5 py-5 px-3 text-indigo">
                Costos Asociados
            </v-card-subtitle>

            <v-table class="tabla">
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
                        <!-- <th class="text-left">

                            <v-row class="acciones">
                                <p>Acciones</p>
                                <v-btn v-if="showButtonActions" class="mb-3 mt-2 mr-2 ml-5" color="green" icon>
                                    <v-icon @click="addCosto()">mdi-plus</v-icon>
                                </v-btn>
                            </v-row>
                        </th> -->
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(costo, index) in costosAsociados" :key="index">
                        <td><v-text-field disabled v-model="costo.nombreServicio"
                                :error-messages="nombreServicio.errorMessage.value"></v-text-field></td>
                        <td><v-text-field v-model="costo.valorServicio" :error-messages="valorServicio.errorMessage.value">$
                            </v-text-field></td>
                        <td>
                            <v-switch v-model="costo.estadoPagoCosto" hide-details inset
                                :label="`${(costo.estadoPagoCosto == undefined || costo.estadoPagoCosto == 'No Pagado' || costo.estadoPagoCosto == false ? 'Pendiente' : 'Pagado')}`">
                            </v-switch>
                        </td>
                        <!-- <td class="btn-actions">

                            <v-btn class="mb-3 mt-2 mr-2" color="red" icon>
                                <v-icon @click="removeCosto(index)">mdi-minus-thick</v-icon>
                            </v-btn>
                            <v-btn class="mb-3 mt-2 mr-2 ml-5" color="green" icon>
                                <v-icon @click="addCosto()">mdi-plus</v-icon>
                            </v-btn>

                        </td> -->
                    </tr>


                </tbody>
            </v-table>

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
                    <tr v-for="(costo, index) in costosAsociados" :key="index">
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


        <div v-if="showButtonFinishCost" class="boton mt-6 ">
            <v-btn block color="green" class="w-50" @click="submit">Guardar</v-btn>

        </div>


        <div v-else class="boton mt-6">
            <v-btn block color="pink" @click="">Editar Valores o Pendientes</v-btn>
        </div>



    </v-form>
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