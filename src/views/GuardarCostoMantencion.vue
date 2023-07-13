<script setup>
import { addDoc, collection } from "firebase/firestore";
import { useField, useForm } from 'vee-validate';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useFirestore } from 'vuefire';
import { costosSchema } from '../validations/costosSchema';
import { propertyPrice } from '../helpers/index';

const route = useRoute()
const mantencionId = route.params.id;

const db = useFirestore()
const costos = ref([]);
const showButtonActions = ref(true)


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


const addCosto = () => {

    showButtonActions.value = false;
    const fecha = new Date()
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZone: 'America/Santiago'
    };
    nuevoCosto.value = {
        fecha: fecha.toLocaleString('es-CL', options),
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

    // Guardar los datos principales de la mantencion

    console.log('entro al submit', costos.value)

    //   Guardar el array completo de costos bajo un ID único en la subcolección "costos"
    const costosRef = collection(db, 'mantenciones', mantencionId, 'costosMantencion');

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
    const costosDocRef = await addDoc(costosRef, { costos: costos.value });
    console.log('Array de costos guardado con ID:', costosDocRef.id);
    if (costosDocRef.id) {
        costos.value = []
        showButtonActions.value = true
    }

});

// const show = () => {
//     console.log('boton funciona')
// }


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

const pagado = computed(()=>{

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
                <tbody>
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
            <div class="boton mt-6">

                <v-btn color="green" class="w-50" @click="submit">Guardar</v-btn>
            </div>

        </v-form>
    </div>

    <!-- <v-card class="mt-6" elevation="0">

    <v-card-subtitle class="text-h5 py-5 px-3 text-indigo" >
      Contabilidad
     </v-card-subtitle>
        <v-table >

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
                    <td>{{costo.nombreServicio}}</td>
                    <td>$ {{costo.valorServicio}}</td>
                    <td>{{costo.estadoPagoCosto ? 'Pagado' : 'No pagado'}}</td>
                </tr>
            </tbody>
        </v-table>   
    </v-card> -->



    <v-card class=" mx-auto mt-5" max-width="500">
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
                <div> <b>Pagado:</b>  {{propertyPrice(pagado) }}</div>
                <div><b>Pendiente:</b>  {{ propertyPrice(pendiente) }}</div>
                <v-divider></v-divider>
                <div class="mt-2"><b>Total Contable:</b>  {{ propertyPrice(pagado)  }}</div>
                <div><b>Total Pendiente:</b>  {{ propertyPrice(pendiente)}}</div>
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