import { defineStore } from 'pinia';
import { collection, getDocs } from 'firebase/firestore';
import { useFirestore } from 'vuefire';// Asegúrate de tener una referencia a la base de datos de Firebase aquí
import {ref, computed }from 'vue';
import { useRouter } from 'vue-router';


const db = useFirestore()

export const UseProximasAtencionesStore = defineStore('proximas-atenciones',()=>{

    fetchProximasAtenciones()

    const proximasAtenciones = ref([])
    const searchTerm = ref('')

    async function  fetchProximasAtenciones() {
        try {
          const querySnapshot = await getDocs(collection(db, 'ProximasAtenciones'));
          proximasAtenciones.value = querySnapshot.docs.map(doc => ({
              id: doc.id, // Agregar el ID del documento al objeto
              ...doc.data(), // Agregar los datos del documento al objeto
            }));
  
        } catch (error) {
          console.error('Error al obtener datos de Firebase:', error);
        }
      }

      const semanasRestantes = computed(()=>{

        return (fechaProximaMantencion) => {
          const [dia, mes, anio] = fechaProximaMantencion.split('-');
          const fechaMantencion = new Date(anio, mes - 1, dia);
          const fechaActual = new Date();
          const tiempoRestante = fechaMantencion.getTime() - fechaActual.getTime();
          const semanas = Math.ceil(tiempoRestante / (1000 * 60 * 60 * 24 * 7));
          return semanas;
        }
        
      })

      const filterProximasAtenciones = computed(() => {
    
        const searchTermLower = searchTerm.value.toLowerCase().trim();
        return proximasAtenciones.value.filter(a => {
          const nombreLower = a?.nombreCliente?.toLowerCase() || '';
          const patenteLower = a?.patente?.toLowerCase() || '';
          
          return nombreLower.includes(searchTermLower) || patenteLower.includes(searchTermLower);
        });
       
      });



      return {
        proximasAtenciones,
        fetchProximasAtenciones,
        semanasRestantes,
        searchTerm,
        filterProximasAtenciones
      }

})