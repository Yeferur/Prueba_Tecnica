const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const validar_Dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

async function obtenerDatosJson() {
  try {
    const response = await axios.get('https://luegopago.blob.core.windows.net/luegopago-uploads/Pruebas%20LuegoPago/data.json');
    return response.data;
  } catch (error) {
    console.error('Error al obtener el JSON:', error.message);
    throw error;
  }
}

async function totalEspaciosDisponiblesCitas(dia) {
  try {
    if (!validar_Dias.includes(dia.toLowerCase())) {
      console.log('Por favor, ingrese un día válido.\n');
      console.log('Los días válidos son: lunes, martes, miércoles, jueves y viernes.\n');
      return -1;
    }

    const scheduleData = await obtenerDatosJson();
    const duracionMinima = 30;
    const duracionMaxima = 90;
    const intervaloMinimo = 30;
    const limiteInicio = new Date(`1970-01-01T09:00:00`);
    const limiteFin = new Date(`1970-01-01T17:00:00`);
    let totalEspacios = 0;

    const citasDia = scheduleData.filter(item => item.Day.toLowerCase() === dia.toLowerCase());

    if (citasDia.length === 0) {
      console.log(`No hay citas programadas para el día ${dia}.`);
      return -1;
    }

    citasDia.forEach((cita, index) => {
      const inicioCita = new Date(`1970-01-01T${cita.Hour}`);
      const finCita = new Date(inicioCita.getTime() + cita.Duration * 60 * 1000);

      if (finCita - inicioCita < duracionMinima * 60 * 1000 || finCita - inicioCita > duracionMaxima * 60 * 1000) {
        console.log(`Cita inválida en el índice ${index} del día ${cita.Day}.`);
        return;
      }

      const finCitaAjustado = finCita > limiteFin ? limiteFin : finCita;

      if (index < citasDia.length - 1) {
        let inicioSiguienteCita = new Date(`1970-01-01T${citasDia[index + 1].Hour}`);
        let finSiguienteCita = new Date(inicioSiguienteCita.getTime() + citasDia[index + 1].Duration * 60 * 1000);
        
        if (finSiguienteCita > limiteFin) {
          inicioSiguienteCita = limiteFin;
        }
    
        const intervalo = (inicioSiguienteCita - finCitaAjustado) / (60 * 1000);
    
        if (intervalo >= intervaloMinimo) {
          totalEspacios += Math.trunc(intervalo / intervaloMinimo);
        }
      }
    });

    const ultimaCita = citasDia[citasDia.length - 1];
    const finUltimaCita = new Date(`1970-01-01T${ultimaCita.Hour}`).getTime() + ultimaCita.Duration * 60 * 1000;

    if (finUltimaCita < limiteFin.getTime()) {
      const intervaloFinal = (limiteFin - finUltimaCita) / (60 * 1000);

      if (intervaloFinal >= intervaloMinimo) {
        totalEspacios += Math.trunc(intervaloFinal / intervaloMinimo);
      }
    }

    console.log(`Para el día ${dia} hay ${totalEspacios} espacios disponibles de 30 minutos entre las 9:00 AM y las 5:00 PM.`);
    return totalEspacios;
  } catch (error) {
    console.error('Error al calcular el espacio disponible:', error.message);
    return -1;
  }
}

function IngresarDia() {
  rl.question('Ingrese el día de la semana: ', async (DiaSemana) => {
    const total = await totalEspaciosDisponiblesCitas(DiaSemana);

    if (total >= 0) {
      rl.question('¿Desea seguir consultando? (s/n): ', (answer) => {
        if (answer.toLowerCase() === 's') {
          IngresarDia();
        } else {
          console.log('Gracias por usar el servicio de consulta de citas. ¡Hasta luego!');
          rl.close();
        }
      });
    } else {
      // Si el día no es válido, vuelva a preguntar
      IngresarDia();
    }
  });
}

console.log('Bienvenido al servicio de consulta de citas.');
console.log('Este servicio le proporcionará el total de espacios disponibles para programar citas en un día específico de la semana.\n');
console.log('Los días válidos son: lunes, martes, miércoles, jueves y viernes.\n');

// Iniciar el programa para que el usuario digite el día
IngresarDia();
