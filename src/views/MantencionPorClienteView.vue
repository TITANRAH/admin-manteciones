<script setup>

 import { useRoute } from 'vue-router';
 import { doc } from 'firebase/firestore';
import { useDocument, useFirestore } from 'vuefire';

const route = useRoute()
const db = useFirestore() // me identifico usando vuefire
const docRef = doc(db, 'mantenciones', route.params.id) // obtengo la referencia ald ocumento en firebase
const mantencion = useDocument(docRef)// uso eldocumento referenciado -->


</script>
<template>
   <h1>{{mantencion?.patenteVehiculo}}</h1>

 
</template>


<style ></style>