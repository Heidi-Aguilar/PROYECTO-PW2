const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require("bcrypt");
const User = require("./Models/Usuarios.js");

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

// ----------REGISTRO--------------------
app.post("/api/register", async (req, res) => {
  try {
    const { nombre, apellido, pais, fechaNacimiento, email, password } = req.body;

    // revisar si ya existe
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Este correo ya está registrado"
      });
    }

    // encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // crear usuario nuevo
    const newUser = new User({
      nombre,
      apellido,
      fechaNacimiento,
      pais,
      correo: email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      message: "Usuario registrado correctamente"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error del servidor"
    });
  }
});

//-----------LOGIN----------------------
app.post("/api/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    console.log(req.body);

    // buscar usuario
    const user = await User.findOne({ correo });
    console.log(user);

    if (!user) {
      return res.status(400).json({
        message: "Usuario no encontrado"
      });
    }

    // comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Contraseña incorrecta"
      });
    }

    res.status(200).json({
      message: "Login exitoso",
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error del servidor"
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor abierto en el puerto ${PORT} `);
});