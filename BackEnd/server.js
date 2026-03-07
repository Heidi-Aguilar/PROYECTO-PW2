const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors()); 
app.use(express.json()); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('¡Base de datos conectada exitosamente!');
  })
  .catch((error) => {
    console.error('Error al conectar con la base de datos:', error);
  });

app.get('/', (req, res) => {
  res.send('¡Bienvenido!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor abierto en el puerto ${PORT} `);
});