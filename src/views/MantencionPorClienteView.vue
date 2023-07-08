<script setup>
import { ref, reactive, onMounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { INITIAL_EVENTS, createEventId } from '../utils/event-utils';
import { useRoute } from 'vue-router';
import {query, where, doc, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { useFirestore, useDocument } from 'vuefire';
import { uid } from 'uid'
import useMantenciones from '../composables/useMaintenance';

const { sendMailDialog, enviarWhatsapp } = useMantenciones()
const route = useRoute();
const db = useFirestore();
const mantencionId = route.params.id;
const mantencionesCollectionRef = collection(db, 'mantenciones');
const mantencionRef = doc(mantencionesCollectionRef, mantencionId);
const mantencion = useDocument(mantencionRef)//






const calendarOptions = reactive({
  longPressDelay: 0,
  locale: 'es',
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  initialView: 'dayGridMonth',
  initialEvents: INITIAL_EVENTS,
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventsSet: handleEvents,
});

const currentEvents = ref([]);
const modalOpen = ref(false);
const eventTitle = ref('');
const eventDescription = ref('');
const selectInfo = ref(null); // Agrega esta línea para declarar la variable selectInfo
const eventModalOpen = ref(false);
const selectedEvent = ref(null);



const sendEmailInDialog = async (mail, asunto, descripcion) =>{
  await sendMailDialog(mail, asunto, descripcion)
}
const sendWhatsappInDialog =async (numeroCliente, nombreCliente) =>{
  console.log(numeroCliente)
  await enviarWhatsapp(numeroCliente, nombreCliente)
}
function handleWeekendsToggle() {
  calendarOptions.weekends = !calendarOptions.weekends;
}

function handleDateSelect(info) {
  selectInfo.value = info; // Asigna el valor de selectInfo
  eventTitle.value = '';
  eventDescription.value = '';
  modalOpen.value = true;
}

async function createEvent() {
  if (eventTitle.value) {
    const selectInfoValue = selectInfo.value; // Obtiene el valor de selectInfo
    const eventId = uid();
    const event = {
      id: eventId,
      title: eventTitle.value,
      start: selectInfoValue.startStr, // Usa selectInfoValue en lugar de selectInfo
      end: selectInfoValue.endStr, // Usa selectInfoValue en lugar de selectInfo
      allDay: selectInfoValue.allDay, // Usa selectInfoValue en lugar de selectInfo
      extendedProps: {
        descripcion: eventDescription.value,
      },
    };

    const calendarApi = selectInfoValue.view.calendar; // Usa selectInfoValue en lugar de selectInfo
    calendarApi.addEvent(event);

    // Guardar el evento en la subcolección "eventos" del documento de la mantención en Firebase
    const eventosCollectionRef = collection(mantencionRef, 'eventos');
    await addDoc(eventosCollectionRef, event);

    modalOpen.value = false;
  }
}

function cancelEvent() {
  modalOpen.value = false;
}

function handleEventClick(info) {
    selectedEvent.value = info.event;
    console.log('selecetedevent',selectedEvent.value)
    eventModalOpen.value = true;
  }

  
 
async function deleteEvent(eventId) {
  const eventosCollectionRef = collection(mantencionRef, 'eventos');
  const eventQuery = query(eventosCollectionRef, where('id', '==', eventId));
  
  try {
    const querySnapshot = await getDocs(eventQuery);
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  } catch (error) {
    console.log('error delete', error);
  }

  const calendarApi = selectInfo.value.view.calendar;
  const currentEventsValue = currentEvents.value;
  const eventIndex = currentEventsValue.findIndex(e => e.id === eventId);
  if (eventIndex !== -1) {
    const eventObj = calendarApi.getEvents().find(e => e.id === eventId);
    if (eventObj) {
      eventObj.remove();
    }
    currentEventsValue.splice(eventIndex, 1);
  }

  eventModalOpen.value = false;
}

function handleEvents(events) {
  currentEvents.value = events;
}
</script>
<template>
  <div class='demo-app'>
    <div class='demo-app-sidebar'>
      <div class='demo-app-sidebar-section'>
        <h2>Instrucciones {{ mantencion?.nombreDueño }}</h2>
        <ul>
          <li>Seleccione las fechas y se le pedirá que cree un nuevo evento </li>
          <li>Eventos de arrastrar, soltar y cambiar el tamaño</li>
          <li>Click en el evento para eliminar</li>
        </ul>
      </div>
      <div class='demo-app-sidebar-section'>
        <label>
          <input
            type='checkbox'
            :checked='calendarOptions.weekends'
            @change='handleWeekendsToggle'
          />
          cambia a semanas
        </label>
      </div>
      <div class='demo-app-sidebar-section'>
        <h2>Todos los Eventos ({{ currentEvents.length }})</h2>
        <ul>
          <li v-for='event in currentEvents' :key='event.id'>
            <b>{{ event.startStr }}</b>
            <i>{{ event.title }}</i>
          </li>
        </ul>
      </div>
    </div>
    <div class='demo-app-main'>
      <FullCalendar
        class='demo-app-calendar'
        :options='calendarOptions'
      >
        <template v-slot:eventContent='arg'>
          <b>{{ arg.timeText }}</b>
          <i>{{ arg.event.title }}</i>
        </template>
      </FullCalendar>
    </div>

    
    <v-dialog v-model="modalOpen" max-width="500px">
  
      <v-card>
        <v-card-title>
          <span class="headline">Crear Nuevo Evento</span>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="eventTitle" label="Título"></v-text-field>
          <v-textarea v-model="eventDescription" label="Descripción"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="createEvent">Guardar</v-btn>
          <v-btn color="secondary" @click="cancelEvent">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

     <!-- Modal de Vuetify para mostrar detalles del evento -->
     <v-dialog v-model="eventModalOpen" max-width="500px">
      <v-card>
    <v-card-title>
      {{ selectedEvent.title }}
    </v-card-title>
    <v-card-text>
      <div>Descripción: {{ selectedEvent.extendedProps.descripcion }}</div>
    </v-card-text>
    <v-card-actions class="botones">
      <v-btn color="error" text @click="deleteEvent(selectedEvent.id)">Eliminar</v-btn>
      <v-btn text @click="eventModalOpen = false">Cerrar</v-btn>
      <v-btn icon @click="sendEmailInDialog(mantencion?.correoDueño, selectedEvent.title, selectedEvent.extendedProps.descripcion)">
        <v-icon>mdi-email</v-icon>
      </v-btn>
      <v-btn icon @click="sendWhatsappInDialog(mantencion?.fonoDueño, mantencion?.nombreCliente)">
        <v-icon>mdi-whatsapp</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
    </v-dialog>
  </div>
</template>



<style lang='css'>

.botones{

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

b { /* used for event dates/times */
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

.demo-app-main {
  flex-grow: 1;
  padding: 3em;
}

.fc { /* the calendar root */
  max-width: 1100px;
  margin: 0 auto;
}

@media (max-width: 600px) {
  .demo-app {
    flex-direction: column;
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

  .fc .fc-button-group > *:first-child {
    margin-left: 0;
  }

  .fc .fc-button {
    font-size: 0.75em;
  }
  
}


</style>