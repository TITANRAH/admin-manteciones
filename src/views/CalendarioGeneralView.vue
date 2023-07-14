<script setup>
import { ref, onMounted, computed } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { useRoute } from 'vue-router';
import { query, where, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { useFirestore } from 'vuefire';
import { uid } from 'uid'
import { formatedDate } from '../helpers/index'
const route = useRoute();
const db = useFirestore();
const currentEvents = ref([]);
const modalOpen = ref(false);
const eventTitle = ref('');
const eventDescription = ref('');
const selectInfo = ref(null); // Agrega esta línea para declarar la variable selectInfo
const eventModalOpen = ref(false);
const selectedEvent = ref(null);
const weekends = ref(false)
const initialEvents = ref([])
const calendarRef = ref(null); 

const fetchEvents = async () => {
  const eventosCollectionRef = collection(db, 'eventosCalendarioGeneral');
  const eventosQuerySnapshot = await getDocs(eventosCollectionRef);
  const events = ref([]);

  eventosQuerySnapshot.forEach((doc) => {
    const evento = {
      id: doc.data().id,
      title: doc.data().title,
      start: doc.data().start, // Convertir la fecha a objeto Date
      end: doc.data().end, // Convertir la fecha a objeto Date
      allDay: doc.data().allDay,
      extendedProps: {
        descripcion: doc.data().extendedProps.descripcion,
      },
    };

  
    events.value.push(evento);
  });

  calendarOptions.value.events = events.value;
  initialEvents.value = events.value;
};

onMounted(async() => { await fetchEvents() });

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
}));

function handleDateSelect(info) {
  selectInfo.value = info; // Asigna el valor de selectInfo
  eventTitle.value = '';
  eventDescription.value = '';
  modalOpen.value = true;
}

function scrollToEvent(event) {
  const calendarApi = calendarRef.value.getApi();
  calendarApi.gotoDate(event.start);
}

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
      },
    };

    const calendarApi = selectInfoValue.view.calendar;
    calendarApi.addEvent(event);

    // Guardar el evento en la nueva colección "eventosCalendarioGeneral"
    const eventosCollectionRef = collection(db, 'eventosCalendarioGeneral');
    await addDoc(eventosCollectionRef, event);

    modalOpen.value = false;
  }
}

function cancelEvent() {
  modalOpen.value = false;
}

function handleEventClick(info) {
  selectedEvent.value = info.event;
  console.log('selecetedevent', selectedEvent.value)
  eventModalOpen.value = true;
}

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

function handleWeek() {
  weekends.value = !weekends.value
  fetchEvents()
}

function handleEvents(events) {
  currentEvents.value = events;
}
</script>
<template>
  <div class='demo-app'>
    <div class='demo-app-sidebar'>
     
      <v-btn color="indigo" @click="handleWeek()">{{ weekends ? 'VER LUNES A VIERNES' : 'VER LUNES A DOMINGO' }}</v-btn>

      <div class='demo-app-sidebar-section'>
        <h2>Todos los Eventos ({{ currentEvents.length }})</h2>
        <ul class="eventos">
          <li v-for='event in currentEvents' :key='event.id' @click="scrollToEvent(event)">
            <b>{{ formatedDate(event.startStr) }}</b>
            <i>{{ event.title }}</i>
          </li>
        </ul>
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
          <div class="descripcion">Descripción: {{ selectedEvent.extendedProps.descripcion }}</div>
        </v-card-text>
        <v-card-actions class="botones">
          <v-btn color="error" text @click="deleteEvent(selectedEvent.id)">Eliminar</v-btn>
          <v-btn text @click="eventModalOpen = false">Cerrar</v-btn>
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

.eventos{
  max-height: 20rem;
  overflow-y:auto;
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

.eventos li{
  cursor: pointer
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

  .fc .fc-button-group>*:first-child {
    margin-left: 0;
  }

  .fc .fc-button {
    font-size: 0.75em;
  }

}
</style>