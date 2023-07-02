


export const formatedDate = (fechaString) => {
    const partesFecha = fechaString.split("-");
  
    const año = parseInt(partesFecha[0], 10);
    const mes = parseInt(partesFecha[1], 10) - 1;
    const dia = parseInt(partesFecha[2], 10);
  
    const fecha = new Date(año, mes, dia);
  
    // Obtener los componentes de la fecha
    const diaFormateado = fecha.getDate().toString().padStart(2, "0");
    const mesFormateado = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const añoFormateado = fecha.getFullYear();
  
    // Construir la cadena de fecha en el formato deseado
    const fechaFormateada = `${diaFormateado}/${mesFormateado}/${añoFormateado}`;
  
    return fechaFormateada;
  }
export const propertyPrice = (price) =>
  Number(price).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
  });
