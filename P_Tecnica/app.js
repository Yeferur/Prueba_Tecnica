const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const validar_Dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

async function totalEspaciosDisponiblesCitas(DiaSemana) {
  if (!validar_Dias.includes(DiaSemana.toLowerCase())) {
    console.log('Por favor, ingrese un día válido.\n');
    console.log('Los días válidos son: lunes, martes, miércoles, jueves y viernes.\n');
    return -1;
  }

  try {
    const response = await axios.get('https://luegopago.blob.core.windows.net/luegopago-uploads/Pruebas%20LuegoPago/data.json');
    const data = response.data;

    const appointments = data.filter(appointment => appointment.Day.toLowerCase() === DiaSemana.toLowerCase());

    if (appointments.length === 0) {
      console.log(`No hay citas programadas para ${DiaSemana}.`);
      return 0;
    }

    const minutosOcupados = appointments.reduce((total, appointment) => total + parseInt(appointment.Duration), 0);
    const minutosTotalesDisponibles = 8 * 60; // 8 horas * 60 minutos
    const minutosDisponiblesParaCitas  = minutosTotalesDisponibles - minutosOcupados;

    const totalEspaciosDisponiblesCitas = Math.floor(minutosDisponiblesParaCitas  / 30);

    console.log(`Total de espacios disponibles para el ${DiaSemana}: ${totalEspaciosDisponiblesCitas}\n`);
    return totalEspaciosDisponiblesCitas;
  } catch (error) {
    console.error('Error al obtener datos del archivo JSON:', error.message);
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

// Iniciar el programa para que el usuario digite el dia
IngresarDia();
