<script setup>
import { doc, getDoc, updateDoc, where, addDoc, collection, deleteDoc, query, setDoc, getDocs } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { useField } from 'vee-validate';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFirestore } from 'vuefire';
import { formatedDate, propertyPrice } from '../helpers/index';

const route = useRoute()
const router = useRouter()
const db = useFirestore()
const showButtonActions = ref(true)
const costosAsociados = ref([])
const showButtonFinishCost = ref(false)

// campos documento

const nombreCliente = ref('')
const correoCliente = ref('')
const fonoCliente = ref('')
const kmAuto = ref('')
const usoFamiliar = ref(null)
const usoLaboral = ref(null)
const aceiteDescripcion = ref('')
const cambioAceite = ref('')
const inspeccionVisualMotor = ref(null)
const patenteVehiculo = ref('')
const descripcionServicio = ref('')
const fechaDeMantencion = ref('')
const isNotMobile = ref(false)
const documento = ref({})
const costos = ref([])
const fechaFormateada = ref('')


console.log('id costo', route.params.idCosto)

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
    const mobileThreshold = 900;
    isNotMobile.value = window.innerWidth >= mobileThreshold;
};

onMounted(async () => {
    handleResize();
    window.addEventListener('resize', handleResize);

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

    // OBTENER COSTO
    if (costoDocSnap.exists()) {
        costos.value = costoDocSnap.data();
        console.log('costo en costoView', costos.value);
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


    // OBTENER CLIENTE
    const clienteDocRef = doc(db, 'clientes', idCliente);
    const clienteDocSnap = await getDoc(clienteDocRef);
    if (clienteDocSnap.exists()) {
        const clienteData = clienteDocSnap.data();
        nombreCliente.value = clienteData.nombreDueño;
        correoCliente.value = clienteData.correoDueño;
        kmAuto.value = clienteData.kmVehiculo;
        fonoCliente.value = clienteData.fonoDueño;
        patenteVehiculo.value = clienteData.patenteVehiculo;

        console.log('nombre del cliente:', nombreCliente.value);

    }

    // OBTENER MATNENCION

    const mantencionDocRef = doc(db, 'clientes', idCliente, 'mantenciones', idMantencion);
    const mantencionDocSnap = await getDoc(mantencionDocRef);
    if (mantencionDocSnap.exists()) {
        const mantencionData = mantencionDocSnap.data();
        fechaDeMantencion.value = mantencionData.fechaMantencion;
        descripcionServicio.value = mantencionData.detallesVehiculo;
        usoFamiliar.value = mantencionData.usoFamiliar;
        usoLaboral.value = mantencionData.usoLaboral;
        aceiteDescripcion.value = mantencionData.aceiteDescripcion
        cambioAceite.value = mantencionData.cambioAceite
        inspeccionVisualMotor.value = mantencionData.inspeccionVisualMotor

    }
    costosAsociados.value.every(
        (costo) => {
            if (costo.estadoPagoCosto === true) {
                console.log('si vienen todos en true')
                showButtonFinishCost.value = true;
            } else {

                console.log('viene al menos uno falso')
                showButtonFinishCost.value = false;

            }
        }
    );
});

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

const addCosto = () => {

    showButtonActions.value = false;
    const fecha = new Date()
    const fechaString = fecha.toISOString()
    nuevoCosto.value = {
        fecha: formatedDate(fechaString),
        nombreServicio: nombreServicio.value.value,
        valorServicio: valorServicio.value.value,
        estadoPagoCosto: estadoPagoCosto.value.value
    };

    costosAsociados.value.push(nuevoCosto.value);

    console.log(costos.value)
};

const removeCosto = (index) => {
    costosAsociados.value.splice(index, 1);

    if (costosAsociados.value.length == 0) {

        console.log('array de costos asociados en cero')
    }
};

const submitUpdateCost = async (event) => {

    console.log('paso por actualizar primero')
    event.preventDefault();

    console.log(costosAsociados.value)
    const camposInvalidos = costosAsociados.value.some(costo => {
        return (
            costo.nombreServicio === null ||
            costo.nombreServicio === '' ||
            costo.nombreServicio === undefined ||
            costo.valorServicio === null ||
            costo.valorServicio === '' ||
            costo.valorServicio === undefined

        );
    });

    if (camposInvalidos) {
        Swal.fire({
            title: 'Error',
            text: 'Uno o más campos son inválidos',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    Swal.fire({
        title: 'Confirmación',
        text: '¿Estás seguro de actualizar estos costos antes de finalizar?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            console.log('todos pagados');
            const costoRef = doc(
                db,
                'clientes',
                route.params.idCliente,
                'mantenciones',
                route.params.idMantencion,
                'costosMantencion',
                route.params.idCosto
            );

            for (const costo of costosAsociados.value) {
                if (
                    costo.estadoPagoCosto === undefined ||
                    costo.estadoPagoCosto === null ||
                    costo.estadoPagoCosto === '' ||
                    costo.estadoPagoCosto === 'false'
                ) {
                    costo.estadoPagoCosto = false;
                }
            }

            updateDoc(costoRef, { costos: costosAsociados.value })
                .then(() => {
                    console.log('Costo actualizado con ID:', route.params.idCosto);
                    Swal.fire({
                        title: 'Costos actualizados',

                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    });
                })
                .catch((error) => {
                    console.error('Error al actualizar los costos:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Ocurrió un error al actualizar los costos',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    });
                });
        }
    });
};

const submitFinishedCost = (event) => {
    const camposInvalidos = costosAsociados.value.some(costo => {
        return (
            costo.nombreServicio === null ||
            costo.nombreServicio === '' ||
            costo.nombreServicio === undefined ||
            costo.valorServicio === null ||
            costo.valorServicio === '' ||
            costo.valorServicio === undefined
        );
    });
    if (camposInvalidos) {
        Swal.fire({
            title: 'Error',
            text: 'Uno o más campos son inválidos',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }
    event.preventDefault()
    const todosPagados = costosAsociados.value.every(costo => costo.estadoPagoCosto == true);
    if (todosPagados) {
        const costoRef = doc(
            db,
            'clientes',
            route.params.idCliente,
            'mantenciones',
            route.params.idMantencion,
            'costosMantencion',
            route.params.idCosto
        );
        Swal.fire({
            title: 'Confirmación',
            text: '¿Deseas guardar el costo en finanzas y terminar esta mantención?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                for (const costo of costosAsociados.value) {
                    if (
                        costo.estadoPagoCosto === undefined ||
                        costo.estadoPagoCosto === null ||
                        costo.estadoPagoCosto === '' ||
                        costo.estadoPagoCosto === 'false'
                    ) {
                        costo.estadoPagoCosto = false;
                    }
                }

                updateDoc(costoRef, { costos: costosAsociados.value })
                    .then(() => {
                        console.log('costo actualizado con id', costoRef.id)
                    })
                    .catch((error) => {
                        console.error('Error al actualizar los costos:', error);
                    });
                if (costoRef.id) {
                    console.log('guardar en coleccion');

                    guardarDocumentoContabilidad(costosAsociados.value, pagado.value)

                    Swal.fire({
                        title: 'Costo guardado',
                        text: `La próxima atención de este cliente la verás en Próximas Atenciones y Las ganancias irán a Finanzas.`,
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {

                        router.push({ name: 'contabilidad-finanzas' });
                    });
                }
            }
        });
    } else {
        Swal.fire({
            title: 'Atención',
            text: 'Para finalizar, todos los costos deben estar pagados',
            icon: 'warning',
            confirmButtonText: 'Aceptar'
        });
    }
}

// console.log('fecha desde mantencion', fecha)
// const fechaOriginal = new Date(props.mantencion?.fechaMantencion fecha);
// console.log('fecha original ', fechaOriginal)


const calculoFechaProximaMantencion = async (fecha, idCliente, nombreCliente, fonoCliente, correoCliente, patente) => {
    const fechaOriginal = new Date(fecha);
    const fechaCalculada = new Date(fechaOriginal.getFullYear(), fechaOriginal.getMonth() + 6, fechaOriginal.getDate());
    fechaFormateada.value = `${fechaCalculada.getDate()}-${fechaCalculada.getMonth() + 1}-${fechaCalculada.getFullYear()}`;

    const proximaAtencion = {
        idCliente: idCliente,
        nombreCliente: nombreCliente,
        fechaProximaMantencion: fechaFormateada.value,
        fonoCliente: fonoCliente,
        correoCliente: correoCliente,
        patente: patente
    };

    try {
        // Verificar si ya existe un documento con el mismo idCliente en la colección ProximasAtenciones
        const proximaAtencionQuery = query(collection(db, 'ProximasAtenciones'), where('idCliente', '==', idCliente));
        const proximaAtencionSnapshot = await getDocs(proximaAtencionQuery);

        if (!proximaAtencionSnapshot.empty) {
            // Si la próxima atención ya existe, recorrer los documentos y actualizar el objeto correspondiente
            proximaAtencionSnapshot.forEach((doc) => {
                setDoc(doc.ref, proximaAtencion);
              
            });
        } else {
            // Si la próxima atención no existe, crear un nuevo documento con el objeto
            await addDoc(collection(db, 'ProximasAtenciones'), proximaAtencion);
          
        }
    } catch (error) {
        console.error('Error al guardar o actualizar la información:', error);
    }
};
// console.log('fecha formateada y calculada', fechaFormateada.value)
//   const tiempoRestante = fechaCalculada.getTime() - Date.now();
//   const semanas = Math.ceil(tiempoRestante / (1000 * 60 * 60 * 24 * 7));
//   const semanasRestantes = semanas;

// console.log('semanasRestantes.value', semanasRestantes)
//  console.log('contactar Cliente desde compsable', contactarCliente.value)

//   if (semanasRestantes >= 0 && semanasRestantes <= 2 ) {
//     console.log('se cumple la condicion de semanas y es true')
//     contactar.value = true;
//     cambiarCampo(idCliente, idMantencion, true)
//     if (contactarCliente == false) {
//       cambiarCampo(idCliente, idMantencion, true)
//       contactar.value = true;
//     }
//   } else {
//     console.log('no se cumple la condicion de semanas')
//     contactar.value = false
//     cambiarCampo(idCliente, idMantencion, false)
//     if (contactarCliente == true) {
//       cambiarCampo(idCliente, idMantencion, false)
//       contactar.value = false;
//     }
//   }

const guardarDocumentoContabilidad = async (costosAsociados, valorContable) => {
    const fecha = new Date()
    const fechaString = fecha.toISOString()
    console.log(typeof fechaString);
    documento.value = {
        idCliente: route.params.idCliente,
        idMantencion: route.params.idMantencion,
        idCosto: route.params.idCosto,
        nombreCliente: nombreCliente.value,
        correoCliente: correoCliente.value,
        fonoCliente: fonoCliente.value,
        kmAuto: kmAuto.value,
        patenteVehiculo: patenteVehiculo.value,
        descripcionServicio: descripcionServicio.value,
        fechaDeMantencion: fechaDeMantencion.value,
        fechaFinalizacionCostos: formatedDate(fechaString),
        costosAsociados: costosAsociados,
        valorContable: valorContable,
        descripcionServicio: descripcionServicio.value,
        usoLaboral: usoLaboral.value,
        usoFamiliar: usoFamiliar.value,
        aceiteDescripcion: aceiteDescripcion.value,
        cambioAceite: cambioAceite.value,
        inspeccionVisualMotor: inspeccionVisualMotor.value
    }

    try {
        const docRef = await addDoc(collection(db, 'ContabilidadMantencionesFinalizadas'), {
            ...documento.value
        });
        console.log('Documento guardado en ContabilidadMantenciones con ID:', docRef.id);
        if (docRef.id) {

            await Promise.all([
                deleteManCost(documento.value.idCliente, documento.value.idMantencion, documento.value.idCosto),
                calculoFechaProximaMantencion(fechaDeMantencion.value, route.params.idCliente, nombreCliente.value, fonoCliente.value, correoCliente.value, patenteVehiculo.value)
            ])
        }

    } catch (error) {
        console.error('Error al guardar el documento en ContabilidadMantenciones:', error);
    }
};


const deleteManCost = async (idCliente, idMantencion, idCosto) => {

    const mantencionRef = doc(db, 'clientes', idCliente, 'mantenciones', idMantencion);
    await deleteDoc(mantencionRef);
    console.log('Documento de mantencion eliminado con éxito');
    const costomantencionRef = doc(db, 'clientes', idCliente, 'mantenciones', idMantencion, 'costosMantencion', idCosto);
    await deleteDoc(costomantencionRef);
    console.log('Documento de costomantencion eliminado con éxito');

}

watch(
    costosAsociados.value,
    (newCostos, oldCostos) => {
        if (newCostos) {
            const hayAlMenosUnFalse = newCostos.some(costo => costo.estadoPagoCosto === false);
            showButtonFinishCost.value = !hayAlMenosUnFalse;
        }
    }
);

</script>
<template>
    <v-form>
        <div>
            <v-btn class="bg-indigo" :to="{ name: 'cobros-pendientes' }">Ir a Pendientes</v-btn>
            <v-card-subtitle class="text-h5 py-5 px-3 text-indigo">
                Finalizar costos Asociados
            </v-card-subtitle>

            <v-table v-if="isNotMobile" class="tabla">
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
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(costo, index) in costosAsociados" :key="index">
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

            <v-card max-width="800" v-else class="mt-3" v-for="(costo, index) in costosAsociados" :key="index">
                <v-list>

                    <v-list-item>
                        <!-- <v-list-item-title><b>{{ cliente.nombre }}</b> </v-list-item-title> -->
                        <v-list-item-subtitle><v-text-field v-model="costo.nombreServicio"
                                :error-messages="nombreServicio.errorMessage.value"></v-text-field>
                        </v-list-item-subtitle>
                        <v-list-item-subtitle> <v-text-field v-model="costo.valorServicio"
                                :error-messages="valorServicio.errorMessage.value">$
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
        </div>

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
                    <tr v-for="(costo, index) in costosAsociados" :key="index">
                        <td>{{ costo.nombreServicio }}</td>
                        <td>$ {{ costo.valorServicio ? propertyPrice(costo.valorServicio) : 0 }}</td>
                        <td :class="costo.estadoPagoCosto ? 'bg-green' : 'bg-red'">{{ costo.estadoPagoCosto ? 'Pagado' :
                            'Pendiente' }}</td>
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
            <v-btn block color="green" class="w-50" @click="submitFinishedCost($event)">Finalizar costos asociados</v-btn>

        </div>
        <div v-else class="boton mt-6">
            <v-btn block color="pink" @click="submitUpdateCost($event)">Editar Valores o Pendientes</v-btn>
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

.botones-movil {
    display: flex;
    flex-direction: row;
    margin: auto;
    align-items: center;
    align-content: center;
    justify-content: center;

}

.col {
    display: flex;
    flex-direction: row;
    margin: auto;
    align-items: center;
    align-content: center;
    justify-content: center;

}
</style>