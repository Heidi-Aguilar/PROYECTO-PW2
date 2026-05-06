const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Requisito: Tokens de autorización
const fs = require('fs'); // Requisito: Registro en archivo de logs
const User = require("./Models/Usuarios.js"); 
const Vehiculo = require("./Models/Vehiculos.js"); 
const Renta = require("./Models/RentaVehiculo.js"); 
const Estacion = require("./Models/Estaciones.js");
const Incidente = require("./Models/Incidentes.js"); 
const Transaccion = require("./Models/Transacciones.js"); 
const app = express();

app.use(cors()); 
app.use(express.json());

// --- 1. FUNCIÓN DE LOGS (Requisito Obligatorio) ---
const registrarLog = (mensaje) => {
  const logMensaje = `[${new Date().toLocaleString()}] - ${mensaje}\n`;
  fs.appendFileSync('backend_critical.log', logMensaje);
};

// --- 2. CONEXIÓN A LA BASE DE DATOS ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    registrarLog('Conexión exitosa a MongoDB');
    console.log('¡Base de datos conectada exitosamente!');
  })
  .catch((error) => {
    registrarLog(`Error de conexión a BD: ${error.message}`);
    console.error('Error al conectar con la base de datos:', error);
  });

app.get('/', (req, res) => {
  res.send('¡Bienvenido!');
});

// ---------- REGISTRO --------------------
app.post("/api/register", async (req, res) => {
  try {
    const { nombre, apellido, pais, fechaNacimiento, correo, password } = req.body;

    const existingUser = await User.findOne({ correo: correo });

    if (existingUser) {
      return res.status(400).json({ message: "Este correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      nombre,
      apellido,
      fechaNacimiento,
      pais,
      correo,
      password: hashedPassword
    });

    await newUser.save();
    registrarLog(`Evento Crítico: Nuevo usuario registrado (${correo})`);

    res.status(201).json({ message: "Usuario registrado correctamente" });

  } catch (error) {
    registrarLog(`Excepción en Registro: ${error.message}`);
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

//----------- LOGIN CON JWT ----------------------
app.post("/api/login", async (req, res) => {
  try {
    const { correo, password } = req.body;
    const user = await User.findOne({ correo });

    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // GENERACIÓN DE TOKEN
    const token = jwt.sign(
      { id: user._id, rol: user.rol }, 
      process.env.JWT_SECRET || 'firma_secreta_proyectoweb2', 
      { expiresIn: '2h' }
    );

    registrarLog(`Evento Crítico: Login exitoso del usuario ${correo}`);

    res.status(200).json({
      message: "Login exitoso",
      token, 
      user: {
        id: user._id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
      }
    });

  } catch (error) {
    registrarLog(`Excepción en Login: ${error.message}`);
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// --- MIDDLEWARE DE AUTORIZACIÓN ---
// LO MOVI AQUÍ AFUERA PARA QUE LAS RUTAS DE ABAJO LO PUEDAN USAR
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  if (!token) {
    registrarLog('Intento de acceso sin token');
    return res.status(403).json({ message: "Token de acceso requerido" });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'firma_secreta_proyectoweb2', (err, decoded) => {
    if (err) {
      registrarLog('Token inválido o expirado');
      return res.status(401).json({ message: "Token inválido" });
    }
    req.user = decoded;
    next();
  });
};

// --- ENDPOINTS DE VEHÍCULOS (CRUD) ---

// 1. OBTENER TODOS (GET) 
app.get("/api/vehiculos", async (req, res) => {
  try {
    const vehiculos = await Vehiculo.find().populate('estacionActual'); 
    res.json(vehiculos);
  } catch (error) {
    registrarLog(`Error GET Vehículos: ${error.message}`);
    res.status(500).json({ message: "Error al obtener los vehículos" });
  }
});

// 2. CREAR VEHÍCULO (POST)
app.post("/api/vehiculos", verificarToken, async (req, res) => {
  try {
    const nuevoVehiculo = new Vehiculo(req.body);
    
    // Validación BackEnd: Batería no puede ser negativa
    if (req.body.bateria < 0 || req.body.bateria > 100) {
      return res.status(400).json({ message: "Nivel de batería inválido" });
    }

    await nuevoVehiculo.save();
    registrarLog(`Evento Crítico: Vehículo ${req.body.codigoVehiculo} creado`);
    res.status(201).json(nuevoVehiculo);
  } catch (error) {
    registrarLog(`Error POST Vehículo: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// 3. ACTUALIZAR VEHÍCULO (PUT) 
app.put("/api/vehiculos/:id", verificarToken, async (req, res) => {
  try {
    const actualizado = await Vehiculo.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    registrarLog(`Evento Crítico: Vehículo ID ${req.params.id} actualizado`);
    res.json(actualizado);
  } catch (error) {
    registrarLog(`Error PUT Vehículo: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// 4. ELIMINAR VEHÍCULO (DELETE)
app.delete("/api/vehiculos/:id", verificarToken, async (req, res) => {
  try {
    await Vehiculo.findByIdAndDelete(req.params.id);
    registrarLog(`Evento Crítico: Vehículo ID ${req.params.id} eliminado`);
    res.json({ message: "Vehículo borrado correctamente" });
  } catch (error) {
    registrarLog(`Error DELETE Vehículo: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// --- ENDPOINTS DE RENTA DE VEHÍCULOS ---

// 1. INICIAR RENTA (POST)
app.post("/api/rentas/iniciar", verificarToken, async (req, res) => {
  try {
    const { vehiculoId } = req.body;
    const usuarioId = req.user.id; 

    const vehiculo = await Vehiculo.findById(vehiculoId);
    if (!vehiculo || vehiculo.estado !== 'Disponible') {
      return res.status(400).json({ message: "El vehículo no está disponible" });
    }

    const nuevaRenta = new Renta({
      usuario: usuarioId,
      vehiculo: vehiculoId,
      estado: 'Activo'
    });

    await nuevaRenta.save();
    await Vehiculo.findByIdAndUpdate(vehiculoId, { estado: 'En Uso' });

    registrarLog(`Evento Crítico: Renta iniciada - Vehículo: ${vehiculoId} por Usuario: ${usuarioId}`);
    
    res.status(201).json({
      message: "Renta iniciada con éxito",
      renta: nuevaRenta
    });

  } catch (error) {
    registrarLog(`Excepción en Inicio de Renta: ${error.message}`);
    res.status(500).json({ error: "Error al procesar la renta" });
  }
});

// 2. FINALIZAR RENTA (PUT)
app.put("/api/rentas/finalizar/:id", verificarToken, async (req, res) => {
  try {
    const rentaId = req.params.id;
    const renta = await Renta.findById(rentaId).populate('vehiculo');

    if (!renta || renta.estado === 'Finalizado') {
      return res.status(400).json({ message: "Renta no encontrada o ya finalizada" });
    }

    const horaFin = new Date();
    const diferenciaMs = horaFin - renta.horaInicio;
    const minutos = Math.ceil(diferenciaMs / (1000 * 60)); 
    
    const costoTotal = minutos * renta.vehiculo.precioPorMinuto;

    renta.horaFin = horaFin;
    renta.costoTotal = costoTotal;
    renta.estado = 'Finalizado';
    await renta.save();

    await Vehiculo.findByIdAndUpdate(renta.vehiculo._id, { estado: 'Disponible' });

    registrarLog(`Evento Crítico: Renta finalizada ID: ${rentaId} - Total: $${costoTotal}`);

    res.json({
      message: "Renta finalizada",
      tiempo: `${minutos} min`,
      total: costoTotal
    });

  } catch (error) {
    registrarLog(`Excepción en Fin de Renta: ${error.message}`);
    res.status(500).json({ error: "Error al finalizar la renta" });
  }
});

// 3. SECCIÓN DE REPORTES (GET)
app.get("/api/reportes/historial-rentas", verificarToken, async (req, res) => {
  try {
    const reporte = await Renta.find()
      .populate('usuario', 'nombre correo') 
      .populate('vehiculo', 'codigoVehiculo tipo'); 
    
    res.json(reporte);
  } catch (error) {
    res.status(500).json({ message: "Error al generar reporte" });
  }
});

// --- SECCIÓN DE REPORTES (Requisito de 4 consultas complejas) ---

// REPORTE 2: Incidentes pendientes de revisión (Cruza Incidentes, Vehículos y Usuarios)[cite: 2, 12]
// Indicador útil para saber qué vehículos necesitan mantenimiento urgente
app.get("/api/reportes/incidentes-pendientes", verificarToken, async (req, res) => {
  try {
    const incidentesPendientes = await Incidente.find({ estado: 'Pendiente' })
      .populate('vehiculo', 'codigoVehiculo tipo estado') 
      .populate('reportadoPor', 'nombre correo'); 
    
    res.json(incidentesPendientes);
  } catch (error) {
    res.status(500).json({ message: "Error al generar reporte de incidentes" });
  }
});

// REPORTE 3: Historial de Ingresos y Cobros (Cruza Transacciones y Usuarios)[cite: 2, 13]
// Indicador financiero para ver quién y cuánto ha pagado
app.get("/api/reportes/ingresos-transacciones", verificarToken, async (req, res) => {
  try {
    const ingresos = await Transaccion.find()
      .populate('usuarioID', 'nombre correo billetera');
    
    res.json(ingresos);
  } catch (error) {
    res.status(500).json({ message: "Error al generar reporte de transacciones" });
  }
});

// REPORTE 4: Ocupación actual de Estaciones (Cruza Vehículos y Estaciones)[cite: 2, 6, 7]
// Indicador logístico para saber dónde están los vehículos en este momento
app.get("/api/reportes/ocupacion-estaciones", verificarToken, async (req, res) => {
  try {
    const ocupacion = await Vehiculo.find({ estacionActual: { $ne: null } })
      .populate('estacionActual', 'nombre capacidadMaxima estado');
    
    res.json(ocupacion);
  } catch (error) {
    res.status(500).json({ message: "Error al generar reporte de ocupación" });
  }
});

// --- ENDPOINTS DE ESTACIONES (CRUD) ---

// 1. OBTENER TODAS (GET)
app.get("/api/estaciones", verificarToken, async (req, res) => {
  try {
    const estaciones = await Estacion.find(); // Uso de ORM (Requisito)
    res.json(estaciones); // Retorno en JSON (Requisito)
  } catch (error) {
    registrarLog(`Error GET Estaciones: ${error.message}`);
    res.status(500).json({ message: "Error al obtener las estaciones" });
  }
});

// 2. CREAR ESTACIÓN (POST)
app.post("/api/estaciones", verificarToken, async (req, res) => {
  try {
    // Validación independiente
    if (!req.body.capacidadMaxima || req.body.capacidadMaxima < 1) {
      return res.status(400).json({ message: "La capacidad máxima debe ser de al menos 1 vehículo" });
    }

    const nuevaEstacion = new Estacion(req.body);
    await nuevaEstacion.save();
    
    registrarLog(`Evento Crítico: Nueva estación creada - ${req.body.nombre}`);
    res.status(201).json(nuevaEstacion);
  } catch (error) {
    registrarLog(`Excepción POST Estaciones: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// 3. ACTUALIZAR ESTACIÓN (PUT)
app.put("/api/estaciones/:id", verificarToken, async (req, res) => {
  try {
    const actualizada = await Estacion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    registrarLog(`Evento Crítico: Estación ID ${req.params.id} actualizada`);
    res.json(actualizada);
  } catch (error) {
    registrarLog(`Excepción PUT Estaciones: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// 4. ELIMINAR ESTACIÓN (DELETE)
app.delete("/api/estaciones/:id", verificarToken, async (req, res) => {
  try {
    await Estacion.findByIdAndDelete(req.params.id);
    registrarLog(`Evento Crítico: Estación ID ${req.params.id} eliminada`);
    res.json({ message: "Estación eliminada correctamente" });
  } catch (error) {
    registrarLog(`Excepción DELETE Estaciones: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});
// --- ENDPOINTS DE INCIDENTES (CRUD) ---

// 1. OBTENER TODOS (GET) - Para ver el historial de problemas
app.get("/api/incidentes", verificarToken, async (req, res) => {
  try {
    const incidentes = await Incidente.find()
      .populate('vehiculo') // Para ver qué vehículo falló
      .populate('reportadoPor'); // Para ver quién lo reporto
    res.json(incidentes);
  } catch (error) {
    registrarLog(`Error GET Incidentes: ${error.message}`);
    res.status(500).json({ message: "Error al obtener incidentes" });
  }
});

// 2. CREAR INCIDENTE (POST) - Cuando un usuario reporta un problema
app.post("/api/incidentes", verificarToken, async (req, res) => {
  try {
    const { vehiculoId, descripcion } = req.body;
    const usuarioId = req.user.id; // Obtenemos el ID del usuario

    // Validar que la descripción no esté vacía
    if (!descripcion || descripcion.trim() === '') {
       return res.status(400).json({ message: "La descripción es obligatoria" });
    }

    const nuevoIncidente = new Incidente({
      vehiculo: vehiculoId,
      reportadoPor: usuarioId,
      descripcion: descripcion
      // El estado 'Pendiente' y la fecha se ponen por defecto
    });

    await nuevoIncidente.save();
    registrarLog(`Evento Crítico: Incidente reportado en vehículo ${vehiculoId} por usuario ${usuarioId}`);
    res.status(201).json(nuevoIncidente);

  } catch (error) {
    registrarLog(`Error POST Incidente: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// 3. ACTUALIZAR INCIDENTE (PUT) - Para cambiar el estado (ej: a 'En Reparación' o 'Resuelto')
app.put("/api/incidentes/:id", verificarToken, async (req, res) => {
  try {
    const actualizado = await Incidente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    registrarLog(`Evento Crítico: Estado del incidente ID ${req.params.id} actualizado`);
    res.json(actualizado);
  } catch (error) {
    registrarLog(`Error PUT Incidente: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// 4. ELIMINAR INCIDENTE (DELETE)
app.delete("/api/incidentes/:id", verificarToken, async (req, res) => {
  try {
    await Incidente.findByIdAndDelete(req.params.id);
    registrarLog(`Evento Crítico: Incidente ID ${req.params.id} eliminado`);
    res.json({ message: "Incidente eliminado correctamente" });
  } catch (error) {
    registrarLog(`Error DELETE Incidente: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});
// --- ENDPOINTS DE TRANSACCIONES (CRUD) ---

// 1. OBTENER TODAS (GET)
app.get("/api/transacciones", verificarToken, async (req, res) => {
  try {
    const transacciones = await Transaccion.find().populate('usuarioID'); // Para ver de qué usuario es[cite: 13]
    res.json(transacciones);
  } catch (error) {
    registrarLog(`Error GET Transacciones: ${error.message}`);
    res.status(500).json({ message: "Error al obtener transacciones" });
  }
});

// 2. CREAR TRANSACCIÓN (POST) - Ej: Cuando se cobra una renta o se hace recarga[cite: 13]
app.post("/api/transacciones", verificarToken, async (req, res) => {
  try {
    const { tipo, monto } = req.body;
    const usuarioId = req.user.id;

    // Validación BackEnd: El monto no puede ser negativo[cite: 13]
    if (monto < 0) {
      return res.status(400).json({ message: "El monto no puede ser negativo" });
    }

    // Validación BackEnd: Asegurar que el tipo sea válido[cite: 13]
    const tiposValidos = ['Recarga', 'Cobro_Renta', 'Multa'];
    if (!tiposValidos.includes(tipo)) {
         return res.status(400).json({ message: "Tipo de transacción inválido" });
    }

    const nuevaTransaccion = new Transaccion({
      usuarioID: usuarioId,
      tipo: tipo,
      monto: monto
    });

    await nuevaTransaccion.save();
    registrarLog(`Evento Crítico: Transacción tipo ${tipo} por $${monto} para el usuario ${usuarioId}`);
    res.status(201).json(nuevaTransaccion);

  } catch (error) {
    registrarLog(`Error POST Transaccion: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// 3. ACTUALIZAR TRANSACCIÓN (PUT)
app.put("/api/transacciones/:id", verificarToken, async (req, res) => {
  try {
    const actualizada = await Transaccion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    registrarLog(`Evento Crítico: Transacción ID ${req.params.id} actualizada`);
    res.json(actualizada);
  } catch (error) {
    registrarLog(`Error PUT Transaccion: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// 4. ELIMINAR TRANSACCIÓN (DELETE)
app.delete("/api/transacciones/:id", verificarToken, async (req, res) => {
  try {
    await Transaccion.findByIdAndDelete(req.params.id);
    registrarLog(`Evento Crítico: Transacción ID ${req.params.id} eliminada`);
    res.json({ message: "Transacción eliminada correctamente" });
  } catch (error) {
    registrarLog(`Error DELETE Transaccion: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  registrarLog(`Inicio de proceso: Servidor abierto en puerto ${PORT}`);
  console.log(`Servidor abierto en el puerto ${PORT} `);
});