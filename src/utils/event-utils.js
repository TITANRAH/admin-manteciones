
let eventGuid = 0
let todayStr = new Date().toISOString().replace(/T.*$/, '') // YYYY-MM-DD of today

export const INITIAL_EVENTS = [
  {
    id: createEventId(),
    title: 'Evento del día',
    start: todayStr
  },
  {
    id: createEventId(),
    title: 'Hora del evento',
    start: todayStr
  }
]

export function createEventId() {
  return String(eventGuid++)
}