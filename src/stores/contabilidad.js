import { defineStore } from 'pinia';
import { collection, getDocs } from 'firebase/firestore';
import { useFirestore } from 'vuefire';// Asegúrate de tener una referencia a la base de datos de Firebase aquí
import {ref, computed }from 'vue';
import { useRouter } from 'vue-router';


const db = useFirestore()

export const useContabilidadStore = defineStore('contabilidad', () => {

   const router = useRouter()

    fetchContabilidadMantenciones();
    const contabilidadMantenciones = ref([])
    const mantencionesPorMes = ref([])
    const selectedYear = ref(new Date().getFullYear().toString());
    const searchTerm = ref('')

   

  async function  fetchContabilidadMantenciones() {
      try {
        const querySnapshot = await getDocs(collection(db, 'ContabilidadMantencionesFinalizadas'));
        contabilidadMantenciones.value = querySnapshot.docs.map(doc => ({
            id: doc.id, // Agregar el ID del documento al objeto
            ...doc.data(), // Agregar los datos del documento al objeto
          }));

      } catch (error) {
        console.error('Error al obtener datos de Firebase:', error);
      }
    }
    const years = computed(() => {
      // Obtener todos los años únicos presentes en contabilidadMantenciones
      const uniqueYears = new Set(contabilidadMantenciones.value.map(item => item.fechaFinalizacionCostos.split('/')[2]));
      return Array.from(uniqueYears);
    });

    function logSelectedYear() {
        console.log('Selected Year:', selectedYear.value);
      }

    const gananciasPorMes = computed(() => {
        const gananciasPorMes = {};
      
        contabilidadMantenciones.value.forEach(item => {
          const fechaFinalizacionCostos = item.fechaFinalizacionCostos;
          const [dia, mes, año] = fechaFinalizacionCostos.split('/');
      
          if (año === selectedYear.value) {
            const mesAño = `${mes}-${año}`;
            const gananciaItem = Number(item.valorContable || 0);
      
            const gananciasMes = gananciasPorMes[mesAño] || 0;
            console.log('clave valor', gananciasPorMes)
            gananciasPorMes[mesAño] = gananciasMes + gananciaItem;
          }
        });
      
        return gananciasPorMes;
      });


      const cantidadMantencionesPorMes = computed(() => {
        const cantidadMantencionesPorMes = {};
    
        contabilidadMantenciones.value.forEach(item => {
          const fechaFinalizacionCostos = item.fechaFinalizacionCostos;
          const [dia, mes, año] = fechaFinalizacionCostos.split('/');
    
          if (año === selectedYear.value) {
            const mesAño = `${mes}-${año}`;
    
            // Incrementa el contador de mantenciones para el mes
            cantidadMantencionesPorMes[mesAño] = (cantidadMantencionesPorMes[mesAño] || 0) + 1;
          }
        });
    
        return cantidadMantencionesPorMes;
      });


      function verDetallePorMes(mes) {
        // Obtener el array de objetos de mantenciones por el mes seleccionado
        mantencionesPorMes.value = contabilidadMantenciones.value.filter(item => {
          const fechaFinalizacionCostos = item.fechaFinalizacionCostos;
          const [dia, m, año] = fechaFinalizacionCostos.split('/');
          const mesAño = `${m}-${año}`;
          return mesAño === mes;
        });

        router.push({name: 'detalles-mantenciones-mes', params:{mes: mes.split('-')[0]}})
      
        // Hacer algo con el array de mantencionesPorMes, por ejemplo, mostrarlo en una tabla
        console.log(mantencionesPorMes.value);
        // Aquí puedes redirigir a otra página o mostrar el detalle de mantenciones de alguna manera
      }

      const filterMantencionPorMes = computed(() => {
        const searchTermLower = searchTerm.value.toLowerCase().trim();
        return mantencionesPorMes.value.filter(m => {
          const nombreLower = m?.nombreCliente?.toLowerCase() || '';
          const patenteLower = m?.patenteVehiculo?.toLowerCase() || '';
          return nombreLower.includes(searchTermLower) || patenteLower.includes(searchTermLower);
        });
      });



    return {
        fetchContabilidadMantenciones,
        contabilidadMantenciones,
        gananciasPorMes,
        years,
        selectedYear,
        logSelectedYear,
        cantidadMantencionesPorMes,
        verDetallePorMes,
        mantencionesPorMes,
        searchTerm,
        filterMantencionPorMes
     
    }
 
});