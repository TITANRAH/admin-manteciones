import { defineStore } from 'pinia';
import { getDocs, collection, deleteDoc, doc as Doc } from 'firebase/firestore';

import { useFirestore } from 'vuefire';// Asegúrate de tener una referencia a la base de datos de Firebase aquí
import {ref, computed }from 'vue';
import { useRouter } from 'vue-router';


const db = useFirestore()

export const UseProximasAtencionesStore = defineStore('proximas-atenciones',()=>{

    fetchProximasAtenciones()

    const proximasAtenciones = ref([])
    const searchTerm = ref('')


    async function fetchProximasAtenciones() {
      try {
      // OBTENGO IDS DE CLIENTES
        const clientesSnapshot = await getDocs(collection(db, 'clientes'));
        const idsClientesExistentes = clientesSnapshot.docs.map(doc => doc.id);
    
        // /OBTENGO PRXIMAS ATENCUONES Y FILTRO POR IDS DE CLIENTES
        const proximasAtencionesSnapshot = await getDocs(collection(db, 'ProximasAtenciones'));
        proximasAtenciones.value = proximasAtencionesSnapshot.docs.map(doc => {
          const datosProximaAtencion = doc.data();
          if (idsClientesExistentes.includes(datosProximaAtencion.idCliente)) {
            return {
              id: doc.id,
              ...datosProximaAtencion,
            };
          } else {
          //  ELIMINO LA PROXIMA ATENCION QUE HAGA MATCH CON EL ID DE CLIENTE QUE YA NO EXISTE 
            deleteDoc(Doc(db, 'ProximasAtenciones', doc.id)).catch(error => {
              console.error('Error al eliminar próxima atención:', error);
            });
            return null; //RETORNO NULL PARA EXCLUIRLO DE LA LISTA
          }
        }).filter(Boolean); // FILTRO LOS CLIENTES NULOS QUE NO EXISTEN DE LA LISTA
    
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