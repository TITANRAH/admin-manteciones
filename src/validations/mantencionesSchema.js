export const validacionSchema = {

    // valorMantencion (value) {
    //   /*
    //       ^ - Representa el inicio de la cadena.
    //       [0-9]+ - Representa cualquier número del 0 al 9. El + indica que debe haber al menos un dígito, pero puede haber más.
    //       $ - Representa el final de la cadena.
    //   */
    //   if (/^[0-9]+$/.test(value)) return true
    //   return 'El Valor solo deben ser números'
    // },
 
 
    fechaMantencion (value) {
      if (value) return true
      return 'Selecciona una fecha en que realizaste la mantención'
    },
   
   
} 
  
