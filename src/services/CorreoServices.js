import api from "../lib/axios"
import useMantenciones from '../composables/useMaintenance';

const {nombre} = useMantenciones()

export default {

  sendMail(){
            const data = {
                to:"titanrah@gmail.com", 
                from:"granrah1@gmail.com",
                subject:"prueba desde railway", 
                text:"prueba desde railway", 
                html: `Estimado <strong>${nombre.value}</strong> te recuerdo que tu vehículo necesita una nueva mantención, hablemos !`
            }
            return api.post('/api/mail', data)
    
    },

}