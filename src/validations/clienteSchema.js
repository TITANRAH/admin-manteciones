export const clienteSaveSchema = {
    nombreDueño (value) {
      if (value ) return true
      return 'El nombre del cliente es obligatorio'
    },
    // valorMantencion (value) {
    //   /*
    //       ^ - Representa el inicio de la cadena.
    //       [0-9]+ - Representa cualquier número del 0 al 9. El + indica que debe haber al menos un dígito, pero puede haber más.
    //       $ - Representa el final de la cadena.
    //   */
    //   if (/^[0-9]+$/.test(value)) return true
    //   return 'El Valor solo deben ser números'
    // },
 
    correoDueño(value) {
     
      // si es un email válido
      const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
      if (!regex.test(value)) {
        return 'Email no válido';
      }
      return true;
  },

  añoVehiculo (value) {
    if (value) return true
    return 'Agrega un año'
  },
  marcaVehiculo (value) {
      if (value) return true
      return 'Este campo es obligatorio'
    },

    patenteVehiculo (value) {
      if (value) return true
      return 'Indica una Patente'
    },
    kmVehiculo (value) {
      if (/^[0-9]+$/.test(value)) return true
      return 'El Valor solo deben ser números'
    },
   
} 

export const imageSchema = {
    imagenVehiculo (value) {
        if (value) return true
        return 'La Imagen es Obligatoria'
    },
  }