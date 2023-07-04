import { collection, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { computed, ref } from "vue";
import { useFirestore, useCollection, useFirebaseStorage, useDocument } from "vuefire";
import { ref as storageRef, deleteObject } from "firebase/storage";
import axios from 'axios';


export default function useMantenciones() {
  const patente = ref("");
  const nombre = ref("");
  const contactar = ref(false)
  const usoFamiliar = ref(0)
  const semanasRestantes = ref(0)
  const filterItemsCollection = ref([]);
  const contactarCliente = ref();
  const idDoc = ref()
  const mailCliente = ref('')
  const storage = useFirebaseStorage();
  const db = useFirestore();
  const mantencionesCollection = useCollection(collection(db, "mantenciones"));

  // const calculoKmProxMantencion = (km, proxKm)=>{
  //   kmActual.value = km
  //   proxMXkm.value = proxKm

  //   // pasar a logica de fecha
  //   contactarCliente(kmActual.value, proxMXkm.value)

  //   return proximaMantencionXkm.value = parseInt(km) + proxKm 
  // }

  async function deleteItem(id, urlImage) {
    if (confirm("¿Deseas eliminar esta mantención?")) {
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
          mantencion.nombreDueño.toLowerCase().includes(nombre.value.toLowerCase())
        );
      } else if (patente.value) {
        return mantencionesCollection.value.filter((mantencion) =>
          mantencion.patenteVehiculo.toLowerCase().includes(patente.value.toLowerCase())
        );
      }
    } else {
      return mantencionesCollection.value;
    }
  });

  // pasar a logica de fecha
  //    const contactarCliente = (km, proxKm)=>{
  //     if(parseInt(km) != null && proxKm != ''){

  //       if( (proxKm + parseInt(km)) - parseInt(km) <= 15000){      
  //        contactar.value = true
  //       } else if (((parseInt(km) - proxKm ) <= 10000)){       
  //         contactar.value = true
  //       } else {
  //         console.log((proxKm + parseInt(km)) - parseInt(km))
  //       }
  //     }
  //  }



  const calculoFechaProximaMantencion = (fecha) => {
    console.log('numeroMeses', usoFamiliar.value)
    const fechaOriginal = new Date(fecha);
    const fechaCalculada = new Date(fechaOriginal.getFullYear(), fechaOriginal.getMonth() + 6, fechaOriginal.getDate());
    // Formatear la fecha calculada al formato deseado
    const fechaFormateada = `${fechaCalculada.getDate()}/${fechaCalculada.getMonth() + 1}/${fechaCalculada.getFullYear()}`;

    const tiempoRestante = fechaCalculada.getTime() - Date.now();
    const semanas = Math.ceil(tiempoRestante / (1000 * 60 * 60 * 24 * 7));
    semanasRestantes.value = semanas;

    console.log('semanasRestantes.value', semanasRestantes.value)
    console.log('contactar Cliente desde compsable', contactarCliente.value)

    if (semanasRestantes.value == 2) {
      contactar.value = true;
      if (contactarCliente.value == true && semanasRestantes.value == 2) {
        sendMail(idDoc.value, mailCliente.value)
      }
    } else {
      contactar.value = false
    }

    return fechaFormateada;
  };

  const enviarWhatsapp = (numeroCliente, nombreCliente) => {
    if (numeroCliente != '' && nombreCliente != '') {
      const url = `https://api.whatsapp.com/send?phone=${numeroCliente}&text=Hola,%20${nombreCliente}%20no%20olvides%20que%20tu%20vehículo%20está%20próximo%20a%20necesitar%20una%20mantencíon%20hablemos !`;
      window.open(url, '_blank');
    } else {
      return
    }
  };

  const sendMail = async (idDoc, mailCliente) => {

    const dataMail = {
      to: `${mailCliente}`,
      from: 'granrah1@gmail.com',
      subject: 'Tu vehículo esta próximo a necesitar una mantención',
      text: 'Mantención de tu Vehículo!',
      html: '<p>Hola!, soy Diego, realicé la mantención de tu auto hace un tiempo y te quería recordar que tu vehículo está próximo a necesitar una nueva mantención, hablemos, contáctactame al: <br/> <b><a href="tel:+56999670451">+56999670451</a></b></p> <p>O bién respondeme este correo.</p><br/><p>Atte. Diego Tapia<p/><b><p>Ingeniero Mecánico<p/></b>'
    }
    try {
      const response = await axios.post('https://servernodemailer-production.up.railway.app/api/mail', dataMail).then(async (resp) => {
        console.log('respuesta de servicio mail', resp)
        // console.log('ID CLIENTE', idDoc)
        // console.log('mail ciente', mailCliente)
        const docRef = doc(db, 'mantenciones', idDoc)
        // const mantencion = useDocument(docRef);
        const data = {
          contactarCliente: false,
        }
        await updateDoc(docRef, data).then(() => {
          // console.log(value)
        })
      });
    } catch (error) {
      console.log(error)
    }
  }

  return {
    calculoFechaProximaMantencion,
    filterItemsCollection,
    filterItems,
    patente,
    deleteItem,
    nombre,
    contactar,
    semanasRestantes,
    enviarWhatsapp,
    usoFamiliar,
    contactarCliente,
    idDoc,
    mailCliente
  };
}
