const mysql = require('mysql');

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'apolo.servidoranonimo.org',
  user: 'medsalud_Laboratorio',
  password: 'Medsalud2022*',
  database: 'medsalud_Laboratorio'
});

function handleDisconnect() {
  // Manejador de eventos 'error'
  connection.on('error', function(err) {
    console.error('Error en la conexión a la base de datos: ' + err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('Se perdió la conexión con la base de datos. Intentando reconectar...');
      connection.connect(function(err) {
        if (err) {
          console.error('Error en la reconexión a la base de datos: ' + err.stack);
          return;
        }
        console.log('Reconexión exitosa a la base de datos con el ID ' + connection.threadId);
      });
    } else {
      throw err;
    }
  });
}

// Conexión a la base de datos
connection.connect(function(err) {
  if (err) {
    console.error('Error en la conexión a la base de datos: ' + err.stack);
    return;
  }

  console.log('Conexión exitosa a la base de datos con el ID ' + connection.threadId);
});

// Manejar la reconexión en caso de pérdida de conexión
handleDisconnect();


module.exports = function(app) {
  app.post('/consultar', function(req, res) {
    // Obtención del número de documento ingresado por el usuario
    const documento = req.body.documento;

    // Creación de la consulta SQL para buscar los datos del paciente
    const sql = "SELECT file_url, DATE_FORMAT(insert_fecha_modificacion, '%Y-%m-%e') as fecha FROM wp_results WHERE patient_id = ?";

    // Ejecución de la consulta con el número de documento como parámetro
    connection.query(sql, [documento], function(error, results, fields) {
      if (error) {
        console.error('Error al realizar la consulta: ' + error.stack);
        return res.status(500).send('Error al realizar la consulta');
      }

      // Mostrar los resultados de la consulta en la consola
      console.log(results);

      // Renderizar los resultados en una página HTML
      let html = '<h2 style="color: blue; font-size: 24px;">¡Resultados de laboratorio disponibles!</h2>';
      html += '<p>Revise la fecha de publicación de sus resultados y haga clic en la URL correspondiente para verlos:</p>';
      if (results.length === 0) {
        html += '<p>No se encontraron resultados para el número de documento ingresado.</p>';
      } else {
        html += '<ul>';
        results.forEach(function(result) {
          html += '<li>Fecha de Subida de sus laboratorios: <span style="color: red; font-size: 20px;">' + result.fecha + '</span> - <a href="' + result.file_url + '" target="_blank"><strong>' + result.file_url + '</strong></a></li><br>';
        });
        html += '</ul>';
      }
      
      // Send the HTML response
      res.send(html);
    });
  });
};








// Cerrar la conexión a la base de datos cuando la aplicación se cierre
process.on('SIGINT', function() {
  console.log('Desconectando de la base de datos...');
  connection.end(function() {
    console.log('Desconectado de la base de datos.');
    process.exit();
  });
});
