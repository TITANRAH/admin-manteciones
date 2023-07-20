<script setup>
import { ref, onMounted, computed } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { useRouter } from 'vue-router';
import { query, where, collection, addDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { useFirestore } from 'vuefire';
import { uid } from 'uid'
import { formatedDate } from '../helpers/index'

const router = useRouter();
const db = useFirestore();
const currentEvents = ref([]);
const modalOpen = ref(false);
const eventTitle = ref('');
const eventDescription = ref('');
const eventPatente = ref('');
const selectInfo = ref(null);
const eventModalOpen = ref(false);
const selectedEvent = ref(null);
const weekends = ref(false)
const initialEvents = ref([])
const calendarRef = ref(null);
const modalEdit = ref(false)
const clientExist = ref(false)
const clienteId = ref()
const patenteBuscada = ref('')





const fetchEvents = async () => {
  const eventosCollectionRef = collection(db, 'eventosCalendarioGeneral');
  const eventosQuerySnapshot = await getDocs(eventosCollectionRef);
  const events = ref([]);

  eventosQuerySnapshot.forEach((doc) => {
    const evento = {
      id: doc.data().id,
      title: doc.data().title,
      start: doc.data().start,
      end: doc.data().end,
      allDay: doc.data().allDay,
      extendedProps: {
        descripcion: doc.data().extendedProps.descripcion,
        patente: doc.data().extendedProps.patente,
      },
    };

    events.value.push(evento);
  });

  calendarOptions.value.events = events.value;
  initialEvents.value = events.value;
};

onMounted(async () => { await fetchEvents() });

const calendarOptions = computed(() => ({
  longPressDelay: 0,
  locale: esLocale,
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  initialView: 'dayGridMonth',
  initialEvents: initialEvents,
  events: initialEvents,
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: weekends.value,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventsSet: handleEvents,
  eventDrop: handleEventDrop
}));


// MOVER EL EVENTO DE FECHA Y ACTUALIZARLO EN LA FECHA QUE LO SUELTO
async function handleEventDrop(info) {
  const eventId = info.event.id;
  const newStart = info.event.start.toISOString().split('T')[0];
  const newEnd = info.event.end.toISOString().split('T')[0];

  // Actualizar el evento en Firebase
  const eventosCollectionRef = collection(db, 'eventosCalendarioGeneral');
  const eventQuery = query(eventosCollectionRef, where('id', '==', eventId));
  const querySnapshot = await getDocs(eventQuery);

  querySnapshot.forEach(async (doc) => {
    await updateDoc(doc.ref, {
      start: newStart,
      end: newEnd,
    });
  });
 
  // Actualizar el estado local del evento en el calendario
  const calendarApi = calendarRef.value.getApi();
  const eventObj = calendarApi.getEventById(eventId);
  if (eventObj) {
    eventObj.setStart(newStart);
    eventObj.setEnd(newEnd);
  }
}
 // FIN MOVER

function handleDateSelect(info) {
  selectInfo.value = info;
  eventTitle.value = '';
  eventDescription.value = '';
  eventPatente.value = '';
  modalOpen.value = true;
}


// CREAR EVENTO
async function createEvent() {
  if (eventTitle.value) {
    const selectInfoValue = selectInfo.value;
    const eventId = uid();
    const event = {
      id: eventId,
      title: eventTitle.value,
      start: selectInfoValue.startStr,
      end: selectInfoValue.endStr,
      allDay: selectInfoValue.allDay,
      extendedProps: {
        descripcion: eventDescription.value,
        patente: eventPatente.value.toLowerCase(),
      },
    };

    const calendarApi = selectInfoValue.view.calendar;
    calendarApi.addEvent(event);

    const eventosCollectionRef = collection(db, 'eventosCalendarioGeneral');
    await addDoc(eventosCollectionRef, event);

    modalOpen.value = false;
  }
}

// FIN CREAR EVENTO

// CERRAR MODEL DE CREACION DE EVENTO
function cancelEvent() {
  modalOpen.value = false;
}
// FIN CERRAR MODEL DE CREACION DE EVENTO


// CLIKEAR UN EVENTO Y SABER SI EL CLIENTE ESTA CREADO Y LLENAR LA VARIABLE ID CLIENTE
async function handleEventClick(info) {
  eventModalOpen.value = true;
  selectedEvent.value = info.event;
  console.log('patente',info.event.extendedProps.patente)

    const clientesCollectionRef = collection(db, 'clientes');
    const querySnapshot = await getDocs(query(clientesCollectionRef, where('patenteVehiculo', '==', info.event.extendedProps.patente.toLowerCase())));

    if (querySnapshot.size > 0) {
      console.log('cliente existe')
      const clienteDoc = querySnapshot.docs[0];
      clienteId.value = clienteDoc.id;    
      clientExist.value = true
    }  else {
      console.log('cliente no existe')
      clientExist.value = false 
    }
}
// FIN CLIKEAR UN EVENTO Y SABER SI EL CLIENTE ESTA CREADO Y LLENAR LA VARIABLE ID CLIENTE


// ELIMINAR EVENTO EN EL FRONT Y BACK
async function deleteEvent(eventId) {
  const eventosCollectionRef = collection(db, 'eventosCalendarioGeneral');
  const eventQuery = query(eventosCollectionRef, where('id', '==', eventId));

  try {
    const querySnapshot = await getDocs(eventQuery);
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  } catch (error) {
    console.log('error delete', error);
  }

  const calendarApi = calendarRef.value.getApi();
  const currentEventsValue = currentEvents.value;
  const eventIndex = currentEventsValue.findIndex((e) => e.id === eventId);
  if (eventIndex !== -1) {
    const eventObj = calendarApi.getEventById(eventId);
    if (eventObj) {
      eventObj.remove();
    }
    currentEventsValue.splice(eventIndex, 1);
  }
  eventModalOpen.value = false;
}
// FIN ELIMINAR EVENTO EN EL FRONT Y BACK

// ELIMINAR TODOS LOS EVENTOS
async function deleteAllEvents() {
  const eventosCollectionRef = collection(db, 'eventosCalendarioGeneral');
  const eventosQuerySnapshot = await getDocs(eventosCollectionRef);
  try {
    eventosQuerySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  } catch (error) {
    console.log('error delete', error);
  }
  const calendarApi = calendarRef.value.getApi();
  calendarApi.removeAllEvents();

  currentEvents.value = [];
  eventModalOpen.value = false;
}
// FIN ELIMINAR TODOS LOS EVENTOS

// SHOW SEMANA
function handleWeek() {
  weekends.value = !weekends.value
  fetchEvents()
}
// FIN SHOW SEMANA

// PASAR LOS EVENTOS A LA VARIABLE
function handleEvents(events) {
  currentEvents.value = events;
}
// FIN PASAR LOS EVENTOS A LA VARIABLE

// ACTUALIZAR EVENTO DESCRIPCION TITULO Y PATENTE
async function updateEvent(eventId) {
  if (selectedEvent.value && eventTitle.value && eventDescription.value) {
    // Obtener los nuevos valores del formulario
    const newTitle = eventTitle.value;
    const newDescription = eventDescription.value;
    const newPatente = eventPatente.value;

    // Actualizar el documento en la base de datos
    const eventosCollectionRef = collection(db, 'eventosCalendarioGeneral');
    const eventQuery = query(eventosCollectionRef, where('id', '==', eventId));
    const querySnapshot = await getDocs(eventQuery);

    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        title: newTitle,
        extendedProps: {
          descripcion: newDescription,
          patente: newPatente.toLowerCase(),
        },
      });
    });

    // Actualizar el evento en el calendario
    const calendarApi = calendarRef.value.getApi();
    const eventObj = calendarApi.getEventById(eventId);
    if (eventObj) {
      eventObj.setProp('title', newTitle);
      eventObj.setExtendedProp('descripcion', newDescription);
      eventObj.setExtendedProp('patente', newPatente.toLowerCase());
    }

    // Cerrar el modal de edición
    modalEdit.value = false;
  }
}
//FIN ACTUALIZAR EVENTO DESCRIPCION TITULO Y PATENTE


// EDITAR ABRIR MODAL Y PASAR VALORES A LA VISTA EN EL MODAL DE EDICION
function editEvent(event) {
  eventModalOpen.value = false
  eventTitle.value = event.title;
  eventDescription.value = event.extendedProps.descripcion;
  eventPatente.value = event.extendedProps.patente;
  modalEdit.value = true
}
// FIN EDITAR ABRIR MODAL Y PASAR VALORES A LA VISTA EN EL MODAL DE EDICION

// MOVER EVENTO DE FECHA
function scrollToEvent(event) {
  const calendarApi = calendarRef.value.getApi();
  calendarApi.gotoDate(event.start);
}
// MOVER EVENTO DE FECHA

// ENVIAR A VISTA DE CREACION DE CLIENTE
function crearCliente(){
  router.push({ name: 'crear-cliente'})
}
// FIN ENVIAR A VISTA DE CREACION DE CLIENTE

// IR A CLIENTE
function irAcliente(){
  console.log('cliente existe')
  router.push({ name: 'cliente', params: {id:clienteId.value}})
}
// FIN IR A CLIENTE


const eventosFiltrados = computed(() => {
  const patente = patenteBuscada.value.toLowerCase();
  return currentEvents.value.filter((evento) => {
    return evento.extendedProps.patente.toLowerCase().includes(patente);
  });
});
</script>
<template>
  <v-btn class="ml-2 mb-3" icon :to="{name: 'dashboard'}"><v-icon size="30">mdi-arrow-left</v-icon></v-btn>
  <div class='demo-app'>
   
  
    <div class='demo-app-sidebar'>

      <v-btn color="indigo" @click="handleWeek()">{{ weekends ? 'VER LUNES A VIERNES' : 'VER LUNES A DOMINGO' }}</v-btn>

      <div class='demo-app-sidebar-section'>
        <v-text-field type="text" v-model="patenteBuscada" label="Buscar evento por patente"></v-text-field>
       
        <h2>Todos los Eventos ({{ eventosFiltrados.length }})</h2>

        <ul class="eventos">
          <li v-for='event in eventosFiltrados' :key='event.id' @click="scrollToEvent(event)">
            <v-icon class="mb-1" size="30" color="red" @click="deleteEvent(event.id)">mdi-delete-forever-outline</v-icon>
            <b>{{ formatedDate(event.startStr) }}</b>
            <i>{{ event.title }}</i>
          </li>
        </ul>

        <v-btn v-if="currentEvents.length > 1" @click="deleteAllEvents()" color="red"><v-icon size="30"
            color="white">mdi-delete-forever-outline</v-icon>
          <h5>Eliminar Todos</h5>
        </v-btn>
      </div>
    </div>
    <div class='demo-app-main'>

      <keep-alive>

        <FullCalendar class='demo-app-calendar' :options='calendarOptions' ref="calendarRef">
          <template v-slot:eventContent='arg'>
            <b>{{ arg.timeText }}</b>
            <i>{{ arg.event.title }}</i>
          </template>


        </FullCalendar>
      </keep-alive>
    </div>


    <v-dialog v-model="modalOpen" max-width="500px">

      <v-card>
        <v-card-title>
          <span class="headline">Crear Nuevo Evento</span>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="eventTitle" label="Título"></v-text-field>
          <v-text-field v-model="eventPatente"  label="Patente"></v-text-field>
          <v-textarea v-model="eventDescription" label="Descripción"></v-textarea>         
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="createEvent">Guardar</v-btn>
          <v-btn color="secondary" @click="cancelEvent">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- MODAL EDIT -->
    <v-dialog v-model="modalEdit" max-width="500px">

      <v-card>
        <v-card-title>
          <span class="headline">Editar Evento</span>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="eventTitle" label="Título"></v-text-field>
          <v-text-field v-model="eventPatente" label="Patente"></v-text-field>
          <v-textarea v-model="eventDescription" label="Descripción"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="updateEvent(selectedEvent.id)">Guardar Cambios</v-btn>
          <v-btn color="secondary" @click="modalEdit = false">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de Vuetify para mostrar detalles del evento -->
    <v-dialog v-model="eventModalOpen" max-width="500px">
    
      <v-card>
        <v-btn text @click="eventModalOpen = false">Cerrar</v-btn>
        <v-card-title>
          {{ selectedEvent.title }}
        </v-card-title>
        <v-card-text>
          <div class="descripcion">Descripción: {{ selectedEvent.extendedProps.descripcion }}</div>
          <div class="descripcion">Patente: {{ selectedEvent.extendedProps.patente }}</div>
        </v-card-text>
        <v-card-actions class="botones">
          <v-btn color="blue" text @click="editEvent(selectedEvent)">Editar</v-btn>
          <v-btn color="error" text @click="deleteEvent(selectedEvent.id)">Eliminar</v-btn>         
          <v-btn v-if="clientExist" text @click="irAcliente()">Ir a Cliente</v-btn>
          <v-btn v-else text @click="crearCliente()">Crear Cliente</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>



<style lang='css'>
.botones {

  display: flex;
  justify-content: center;
}

h2 {
  margin: 0;
  font-size: 16px;
}

ul {
  margin: 0;
  padding: 0 0 0 1.5em;
}

li {
  margin: 1.5em 0;
  padding: 0;
}

b {
  /* used for event dates/times */
  margin-right: 3px;
}

.demo-app {
  display: flex;
  min-height: 100%;
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
}

.demo-app-sidebar {
  width: 300px;
  line-height: 1.5;
  background: #eaf9ff;
  border-right: 1px solid #d3e2e8;
}

.demo-app-sidebar-section {
  padding: 2em;
}

.eventos {
  max-height: 35rem;
  overflow-y: auto;
}

.demo-app-main {
  flex-grow: 1;
  padding: 3em;
}

.fc {
  /* the calendar root */
  max-width: 1200px;
  margin: 0 auto;
}

.descripcion {
  max-height: 15rem;
  overflow-y: auto;
}

.eventos li {
  cursor: pointer
}

@media (max-width: 600px) {
  .demo-app {
    flex-direction: column;
  }

  .fc .fc-toolbar.fc-header-toolbar {
    margin-bottom: 1.5em;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* justify-content: left; */
  }

  .demo-app-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #d3e2e8;
    order: 1;
  }

  .demo-app-main {
    width: 100%;
    padding: 1em;
  }

  .demo-app-sidebar {
    order: 2;
  }

  .fc {
    max-width: none;
  }

  .demo-app-main {
    padding: 1em;
  }

  .fc .fc-toolbar-title {
    font-size: 1em;
  }

  .fc .fc-toolbar-chunk {

    max-width: 100%;
  }

  .fc .fc-button-group>*:first-child {
    margin-left: 0;
  }

  .fc .fc-button {
    font-size: 0.75em;
  }

}
</style>