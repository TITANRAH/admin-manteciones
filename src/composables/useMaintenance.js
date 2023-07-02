import { collection, doc, deleteDoc } from "firebase/firestore";
import { computed, ref } from "vue";
import { useFirestore, useCollection, useFirebaseStorage } from "vuefire";

// esto es para el storage basicamente para eliminar
// el ref es de referencia no es de ref de vue
import { ref as storageRef, deleteObject } from "firebase/storage";

// useCollection es para traerme toda la coleccion en base de datos

export default function useMantenciones() {
  const patente = ref("");
  const nombre = ref("");
  const filterItemsCollection = ref([]);
  const storage = useFirebaseStorage();
  const db = useFirestore();
  const mantencionesCollection = useCollection(collection(db, "mantenciones"));

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
          mantencion.nombreDueño.includes(nombre.value)
        );
      } else if (patente.value) {
        return mantencionesCollection.value.filter((mantencion) =>
          mantencion.patenteVehiculo.includes(patente.value)
        );
      }
    } else {
      return mantencionesCollection.value;
    }
  });
  return {
    filterItemsCollection,
    filterItems,
    patente,
    deleteItem,
    nombre,
  };
}
