import { collection, doc, deleteDoc } from "firebase/firestore";
import { computed, onMounted, ref } from "vue";
import { useFirestore, useCollection, useFirebaseStorage } from "vuefire";
import { ref as storageRef, deleteObject } from "firebase/storage";

export default function useMantenciones() {
  const patente = ref("");
  const nombre = ref("");
  const kmActual = ref()
  const proxMXkm = ref()
  const contactar = ref(false)
  const semanasRestantes = ref(0)
  const proximaMantencionXkm = ref(0)
  const filterItemsCollection = ref([]);
  const storage = useFirebaseStorage();
  const db = useFirestore();
  const mantencionesCollection = useCollection(collection(db, "mantenciones"));

 

  const calculoKmProxMantencion = (km, proxKm)=>{
    kmActual.value = km
    proxMXkm.value = proxKm

    // pasar a logica de fecha
    contactarCliente(kmActual.value, proxMXkm.value)

    return proximaMantencionXkm.value = parseInt(km) + proxKm 
  }

  async function deleteItem(id, urlImage) {
    if (confirm("¿Deseas eliminar esta mantencion?")) {
      console.log(id);
      const docRef = doc(db, "mantenciones", id);
      const imageRef = storageRef(storage, urlImage);
      await Promise.all([deleteDoc(docRef), deleteObject(imageRef)]);
    }
  }
  const filterItems = computed(() => {
    console.log("patente.value desde computed", patente.value);

    if (patente.value != "" || nombre.value != "") {
      if (nombre.value) {
        return mantencionesCollection.value.filter((mantencion) =>
          mantencion.nombreDueño.toLowerCase().includes(nombre.value.toLowerCase())
        );
      } else if (patente.value) {
        return mantencionesCollection.value.filter((mantencion) =>
          mantencion.patenteVehiculo.toLowerCase().includes(patente.value.toLowerCase())
        );
      }
    } else {
      return mantencionesCollection.value;
    }
  });

    // pasar a logica de fecha
   const contactarCliente = (km, proxKm)=>{
    if(parseInt(km) != null && proxKm != ''){
      
      if( (proxKm + parseInt(km)) - parseInt(km) <= 15000){      
       contactar.value = true
      } else if (((parseInt(km) - proxKm ) <= 10000)){       
        contactar.value = true
      } else {
        console.log((proxKm + parseInt(km)) - parseInt(km))
      }
    }
 }

 const calculoFechaProximaMantencion = (fecha) => {
  const fechaOriginal = new Date(fecha);
  const fechaCalculada = new Date(fechaOriginal.getFullYear(), fechaOriginal.getMonth() + 6, fechaOriginal.getDate());
  // Formatear la fecha calculada al formato deseado
  const fechaFormateada = `${fechaCalculada.getDate()}/${fechaCalculada.getMonth() + 1}/${fechaCalculada.getFullYear()}`;
   
  const tiempoRestante = fechaCalculada.getTime() - Date.now();
  const semanas = Math.ceil(tiempoRestante / (1000 * 60 * 60 * 24 * 7));
  semanasRestantes.value = semanas;

  if(semanasRestantes.value <= 1){
  
    contactar.value = true
  }else {
   
    contactar.value = false
  }
  return fechaFormateada;
};
  return {
    calculoFechaProximaMantencion,
    filterItemsCollection,
    filterItems,
    patente,
    deleteItem,
    nombre,
    calculoKmProxMantencion,
    contactarCliente,
    contactar,
    semanasRestantes
  };
}
