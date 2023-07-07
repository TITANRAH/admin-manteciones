import axios from 'axios';
import { collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, ref as storageRef } from "firebase/storage";
import { computed, ref } from "vue";
import { useCollection, useFirebaseStorage, useFirestore } from "vuefire";

export default function useMantenciones() {

  const filtro = ref("");
  const contactar = ref(false)
  const filterItemsCollection = ref([]);
  const contactarCliente = ref();
  const idDoc = ref()
  const mailCliente = ref('')

  const storage = useFirebaseStorage();
  const db = useFirestore();
  const mantencionesCollection = useCollection(collection(db, "mantenciones"));

  async function deleteItem(id, urlImage) {
    if (confirm("¿Deseas eliminar esta mantención?")) {
      console.log(id);
      const docRef = doc(db, "mantenciones", id);
      const imageRef = storageRef(storage, urlImage);
      await Promise.all([deleteDoc(docRef), deleteObject(imageRef)]);
    }
  }
  const filterItems = computed(() => {
 
 if (filtro.value) {
        return mantencionesCollection.value.filter((mantencion) =>
          mantencion.patenteVehiculo.toLowerCase().includes(filtro.value.toLowerCase()) || mantencion.nombreDueño.toLowerCase().includes(filtro.value.toLowerCase())
        );
      }
   else {
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


  const enviarWhatsapp = (numeroCliente, nombreCliente) => {

    console.log('numero', numeroCliente)
    if (numeroCliente != '' && nombreCliente != '') {
      const url = `https://api.whatsapp.com/send?phone=${numeroCliente}&text=Hola,%20${nombreCliente}%20no%20olvides%20que%20tu%20vehículo%20está%20próximo%20a%20necesitara%20una%20mantencíon%20, hablemos!`;
      window.location.href = url;
    } else {
      return
    }
  };

  const sendMail = async (mailCliente, idDoc) => {
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
        cambiarCampo(idDoc, false)
      });
    } catch (error) {
      console.log(error)
    }
  }

 const cambiarCampo = async (idDoc, bool) =>{
        const docRef = doc(db, 'mantenciones', idDoc)
        const data = {
          contactarCliente: bool,
        }
        await updateDoc(docRef, data).then((value) => {
          console.log(value)
        })
 }

  return {
    filterItemsCollection,
    filterItems,
    deleteItem,
    filtro,
    contactar,
    enviarWhatsapp,
    contactarCliente,
    idDoc,
    mailCliente,
    cambiarCampo,
    sendMail
  };
}
