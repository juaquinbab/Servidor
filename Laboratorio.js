const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const port = process.env.PORT;

app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Importar el archivo "consulta_db.js"
const consulta_db = require('./consultar_db')(app);

// Controlador de ruta que maneja la solicitud HTTP POST para la consulta de la base de datos
app.post('/consultar', function(req, res) {
  const documento = req.body.documento;

  // Llamar a la función "consulta_db" con el número de documento y una función de devolución de llamada (callback) como parámetros
  consulta_db(documento, function(error, results) {
    if (error) {
      console.error('Error al realizar la consulta: ' + error.stack);
      return res.status(500).send('Error al realizar la consulta');
    }

    res.send(results);
  });
});

// Ruta para mostrar el formulario de comentarios
app.get('/comentarios', function(req, res) {
  res.send(`
    <form action="/enviar-comentario" method="post">
      <textarea name="comentario" placeholder="Escribe tu comentario"></textarea>
      <button type="submit">Enviar comentario</button>
    </form>
  `);
});

// Ruta para enviar el comentario por correo electrónico
app.post('/enviar-comentario', function(req, res) {
  const comentario = req.body.comentario;

  // Configuración de Nodemailer para enviar el correo electrónico
  const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: 'resultadosmedsalud@hotmail.com',
      pass: 'W24h9rr8t4'
    }
  });

  const mailOptions = {
    from: 'resultadosmedsalud@hotmail.com',
    to: 'comunicaciones@info.medsaludips.com',
    subject: 'Nuevo comentario',
    text: comentario
  };

  // Envío del correo electrónico
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.error('Error al enviar el correo electrónico: ' + error.message);
      return res.status(500).send('Error al enviar el comentario');
    }

    console.log('Comentario enviado: ' + info.response);
    res.send('<h1 style="color: #ff0000;">Comentario enviado correctamente, espere su respuesta</h1>');

  });
});

app.listen(port, () => {
  console.log(`Servidor Express corriendo en http://localhost:${port}`);
});






