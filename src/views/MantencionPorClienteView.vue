<script setup>
import { ref, reactive, onMounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { INITIAL_EVENTS, createEventId } from '../utils/event-utils';
import { useRoute } from 'vue-router';
import { doc } from 'firebase/firestore';
import { useFirestore } from 'vuefire';
const route = useRoute();
const db = useFirestore(); 
const docRef = doc(db, 'mantenciones', route.params.id);

const calendarOptions = reactive({
   longPressDelay: 0,
   locale: 'es',
   plugins: [
     dayGridPlugin,
     timeGridPlugin,
     interactionPlugin
   ],
   headerToolbar: {
     left: 'prev,next today',
     center: 'title',
     right: 'dayGridMonth,timeGridWeek,timeGridDay'
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
   eventsSet: handleEvents 
});

const currentEvents = ref([]);

function handleWeekendsToggle() {
  calendarOptions.weekends = !calendarOptions.weekends;
}

function handleDateSelect(selectInfo) {
  let title = prompt('Ingresa un título para tu evento');
  let calendarApi = selectInfo.view.calendar;

  calendarApi.unselect();

  if (title) {
    calendarApi.addEvent({
      id: createEventId(),
      title,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay
    });
  }
}

function handleEventClick(clickInfo) {
  if (confirm(`Estás seguro de eliminar este evento '${clickInfo.event.title}'`)) {
    clickInfo.event.remove();
  }
}

function handleEvents(events) {
  currentEvents.value = events;
}
</script>

<template>
  <div class='demo-app'>
    <div class='demo-app-sidebar'>
      <div class='demo-app-sidebar-section'>
        <h2>Instrucciones</h2>
        <ul>
          <li>Seleccione las fechas y se le pedirá que cree un nuevo evento</li>
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
  </div>
</template>

<style lang='css'>

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