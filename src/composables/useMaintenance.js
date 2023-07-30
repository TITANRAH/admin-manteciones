import axios from 'axios';
import { collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, ref as storageRef } from "firebase/storage";
import { computed, ref } from "vue";
import { useCollection, useFirebaseStorage, useFirestore } from "vuefire";
import Swal from 'sweetalert2';

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

  const enviarWhatsapp = (numeroCliente, nombreCliente) => {

    console.log('numero', nombreCliente)
    if (numeroCliente != '' && nombreCliente != '') {
      const url = `https://api.whatsapp.com/send?phone=${numeroCliente}&text=Hola,%20${nombreCliente}`;
      window.location.href = url;
    } else {
      return
    }
  };

  const sendMail = async (mailCliente, nombreDueño) => {
    const dataMail = {
      to: `${mailCliente}`,
      from: 'tapiamecanico2023@gmail.com',
      subject: 'Tu vehículo esta próximo a necesitar una mantención',
      text: 'Mantención de tu Vehículo!',
      html: `<p>Hola! <b>${nombreDueño}</b>, soy Diego, realicé la mantención de tu auto hace un tiempo y te quería recordar que tu vehículo está próximo a necesitar una nueva mantención, hablemos, contáctactame al: <br/> <b><a href="tel:+56999670451">+56999670451</a></b></p> <p>O bién respondeme este correo.</p><br/><p>Atte. Diego Tapia<p/><b><p>Ingeniero Mecánico<p/></b>`
    }
 
    try {
      const response = await axios.post('https://servernodemailer-production.up.railway.app/api/mail', dataMail);
  
      if (response.status === 200) {
      
        Swal.fire({
          title: `¡Correo enviado! a ${nombreDueño} `,
          text: 'El correo ha sido enviado exitosamente. con aviso de Mantención',
          icon: 'success',
        })
      }
    } catch (error) {
      console.log(error);
    }
  }

  const sendMailDialog = async (mailCliente, asunto, descripcion) => {


    const dataMail = {
      to: `${mailCliente}`,
      from: 'tapiamecanico2023@gmail.com',
      subject: `${asunto}`,
      text: 'Mantención de tu Vehículo!',
      html: `<p>Hola soy Diego ,te envío esta información por si la necesitas:</p><p>${descripcion}</p><br/><p>Atte. Diego Tapia<p/><b><p>Ingeniero Mecánico<p/></b>`
    }
    try {
      const response = await axios.post('https://servernodemailer-production.up.railway.app/api/mail', dataMail).then(async (resp) => {
        console.log('respuesta de servicio mail', resp)

        if(resp.status == 200){
          Swal.fire({
            icon: 'success',
            title: 'Correo enviado con éxito',
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    } catch (error) {
      console.log(error)
    }
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
    sendMail,
    sendMailDialog
  };
}
