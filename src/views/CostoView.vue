<script setup>
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { useField, useForm } from 'vee-validate';
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useFirestore } from 'vuefire';
import { costosSchema } from '../validations/costosSchema';
import { propertyPrice } from '../helpers/index';

const route = useRoute()
const db = useFirestore()
const costos = ref([]);
const showButtonActions = ref(true)

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

    
</script>
<template>
    <h1>costo mantencion</h1>
</template>
<style>

</style>