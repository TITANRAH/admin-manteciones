import { collection, doc, deleteDoc } from "firebase/firestore";
import { computed, ref } from "vue";
import { useFirestore, useCollection, useFirebaseStorage } from "vuefire";

// esto es para el storage basicamente para eliminar
// el ref es de referencia no es de ref de vue
import { ref as storageRef, deleteObject } from "firebase/storage";

// useCollection es para traerme toda la coleccion en base de datos

export default function useMantenciones() {
  const patente = ref("");
  const filterItemsCollection = ref([])
  const storage = useFirebaseStorage();
  const db = useFirestore();
  const mantencionesCollection = useCollection(collection(db, "mantenciones"));

  async function deleteItem(id, urlImage) {
    if (confirm("¿Deseas eliminar esta mantencion?")) {
      console.log(id);

      const docRef = doc(db, "mantenciones", id);
      const imageRef = storageRef(storage, urlImage);

      // como neceisto tener 2 await los puedo utilizar asi en un Promise.all
      await Promise.all([deleteDoc(docRef), deleteObject(imageRef)]);
    }
  }
  // si tiene alberca trae las que tienen alberca si no todas
  // filtra lo que hay en memoria no hace peticiones a la base de datos

//   const filterItems = (patente) => {

//     const existe = mantencionesCollection.value.filter(
//         (mantencion) => mantencion.patenteVehiculo === patente
//       )

//       if(existe){
//         filterItemsCollection.value = mantencionesCollection.value.filter(
//             (mantencion) => mantencion.patenteVehiculo === patente
//           )
    
//       } else {
//         filterItemsCollection.value = mantencionesCollection.value
//       }

  
  
//   };

  const filterItems = computed(() => {

    console.log('patente.value desde computed', patente.value)
    return patente.value != '' ? (mantencionesCollection.value.filter(
        (mantencion) => mantencion.patenteVehiculo === patente.value)
      ) : mantencionesCollection.value

  });
  return {
    filterItemsCollection,
    filterItems,
    patente,
    deleteItem,
  };
}
