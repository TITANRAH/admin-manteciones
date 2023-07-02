export const filterSchema = {
    filter(value) {
        if (!value || undefined) {
          return 'Este campo es obligatorio';
        }
        return true;
    },
  
}