const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require('fs');

// --- IMPORTACIONES DE MODELOS ---
const User = require("./Models/Usuarios.js"); 
const Vehiculo = require("./Models/Vehiculos.js"); 
const Renta = require("./Models/RentaVehiculo.js"); 
const Estacion = require("./Models/Estaciones.js");
const Incidente = require("./Models/Incidentes.js"); 
const Transaccion = require("./Models/Transacciones.js"); 

const app = express();
app.use(cors()); 
app.use(express.json());

// --- 1. FUNCIÓN DE LOGS ---
const registrarLog = (mensaje) => {
  const logMensaje = `[${new Date().toLocaleString()}] - ${mensaje}\n`;
  fs.appendFileSync('backend_critical.log', logMensaje);
};

// --- 2. FUNCIÓN PARA CREAR ADMIN AUTOMÁTICAMENTE ---
const crearAdminHardcoded = async () => {
  try {
    const adminEmail = "admin@vueltavaquera.com";
    const adminExiste = await User.findOne({ correo: adminEmail });

    if (!adminExiste) {
      const hashedPassword = await bcrypt.hash("Admin123!", 10);
      const nuevoAdmin = new User({
        nombre: "Fernanda",
        apellido: "Admin",
        fechaNacimiento: new Date(2000, 0, 1),
        pais: "México",
        correo: adminEmail,
        password: hashedPassword,
        rol: "admin" 
      });
      await nuevoAdmin.save();
      registrarLog("Sistema: Usuario Admin maestro creado exitosamente.");
      console.log("¡Usuario Admin hardcoded listo! (admin@vueltavaquera.com)");
    }
  } catch (error) {
    registrarLog(`Error creando admin: ${error.message}`);
  }
};

// --- 3. CONEXIÓN A LA BD ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    registrarLog('Conexión exitosa a MongoDB');
    console.log('¡Base de datos conectada exitosamente!');
    crearAdminHardcoded(); 
  })
  .catch((error) => {
    registrarLog(`Error de conexión a BD: ${error.message}`);
    console.error('Error al conectar con la base de datos:', error);
  });

app.get('/', (req, res) => {
  res.send('¡Bienvenido al servidor de Hey Vaquero!');
});

// --- 4. MIDDLEWARES DE SEGURIDAD ---
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
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

const verificarAdmin = (req, res, next) => {
  if (req.user && req.user.rol === 'admin') {
    next();
  } else {
    registrarLog(`Intento de acceso denegado a zona Admin por ID: ${req.user.id}`);
    return res.status(403).json({ message: "Acceso denegado: Se requieren permisos de administrador." });
  }
};

// ==========================================
//           ENDPOINTS DE USUARIOS
// ==========================================
app.post("/api/register", async (req, res) => {
  try {
    const { nombre, apellido, pais, fechaNacimiento, correo, password } = req.body;
    const existingUser = await User.findOne({ correo: correo });

    if (existingUser) return res.status(400).json({ message: "Este correo ya está registrado" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ nombre, apellido, fechaNacimiento, pais, correo, password: hashedPassword });
    
    await newUser.save();
    registrarLog(`Evento Crítico: Nuevo usuario registrado (${correo})`);
    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    registrarLog(`Excepción en Registro: ${error.message}`);
    res.status(500).json({ message: "Error del servidor" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { correo, password } = req.body;
    const user = await User.findOne({ correo });

    if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user._id, rol: user.rol }, process.env.JWT_SECRET || 'firma_secreta_proyectoweb2', { expiresIn: '2h' });
    registrarLog(`Evento Crítico: Login exitoso del usuario ${correo}`);

    res.status(200).json({
      message: "Login exitoso",
      token, 
      user: { id: user._id, nombre: user.nombre, correo: user.correo, rol: user.rol }
    });
  } catch (error) {
    registrarLog(`Excepción en Login: ${error.message}`);
    res.status(500).json({ message: "Error del servidor" });
  }
});

app.get("/api/usuarios", verificarToken, async (req, res) => {
  try {
    const usuarios = await User.find().select('-password'); 
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

app.put("/api/usuarios/:id", verificarToken, async (req, res) => {
  try {
    const actualizado = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/usuarios/:id", verificarToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Obtener perfil completo del usuario
app.get("/api/usuarios/:id", verificarToken, async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id).select("-password");

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(usuario);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});


// ==========================================
//           ENDPOINTS DE ESTACIONES
// ==========================================
app.get("/api/estaciones", verificarToken, async (req, res) => {
  try {
    const estaciones = await Estacion.find(); 
    res.json(estaciones); 
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las estaciones" });
  }
});

app.post("/api/estaciones", verificarToken, verificarAdmin, async (req, res) => {
  try {
    if (!req.body.capacidadMaxima || req.body.capacidadMaxima < 1) {
      return res.status(400).json({ message: "La capacidad máxima debe ser de al menos 1 vehículo" });
    }
    const nuevaEstacion = new Estacion(req.body);
    await nuevaEstacion.save();
    registrarLog(`Evento Crítico: Nueva estación creada - ${req.body.nombre}`);
    res.status(201).json(nuevaEstacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/estaciones/:id", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const actualizada = await Estacion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(actualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/estaciones/:id", verificarToken, verificarAdmin, async (req, res) => {
  try {
    await Estacion.findByIdAndDelete(req.params.id);
    res.json({ message: "Estación eliminada correctamente" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
//           ENDPOINTS DE VEHÍCULOS
// ==========================================
app.get("/api/vehiculos", verificarToken, async (req, res) => {
  try {
    const vehiculos = await Vehiculo.find().populate('estacionActual'); 
    res.json(vehiculos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los vehículos" });
  }
});

app.post("/api/vehiculos", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const nuevoVehiculo = new Vehiculo(req.body);
    if (req.body.bateria < 0 || req.body.bateria > 100) {
      return res.status(400).json({ message: "Nivel de batería inválido" });
    }
    await nuevoVehiculo.save();
    registrarLog(`Evento Crítico: Vehículo ${req.body.codigoVehiculo} creado`);
    res.status(201).json(nuevoVehiculo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/vehiculos/:id", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const actualizado = await Vehiculo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/vehiculos/:id", verificarToken, verificarAdmin, async (req, res) => {
  try {
    await Vehiculo.findByIdAndDelete(req.params.id);
    res.json({ message: "Vehículo borrado correctamente" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
//        ENDPOINTS DE RENTAS
// ==========================================
app.post("/api/rentas/iniciar", verificarToken, async (req, res) => {
  try {
    const { vehiculoId } = req.body;
    const usuarioId = req.user.id; 
    const vehiculo = await Vehiculo.findById(vehiculoId);
    
    if (!vehiculo || vehiculo.estado !== 'Disponible') {
      return res.status(400).json({ message: "El vehículo no está disponible" });
    }

    const nuevaRenta = new Renta({ usuario: usuarioId, vehiculo: vehiculoId, estado: 'Activo' });
    await nuevaRenta.save();
    await Vehiculo.findByIdAndUpdate(vehiculoId, { estado: 'En Uso' });

    registrarLog(`Evento Crítico: Renta iniciada - Vehículo: ${vehiculoId} por Usuario: ${usuarioId}`);
    res.status(201).json({ message: "Renta iniciada con éxito", renta: nuevaRenta });
  } catch (error) {
    res.status(500).json({ error: "Error al procesar la renta" });
  }
});

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
    res.json({ message: "Renta finalizada", tiempo: `${minutos} min`, total: costoTotal });
  } catch (error) {
    res.status(500).json({ error: "Error al finalizar la renta" });
  }
});

// ==========================================
//        ENDPOINTS DE INCIDENTES
// ==========================================
app.get("/api/incidentes", verificarToken, async (req, res) => {
  try {
    const incidentes = await Incidente.find().populate('vehiculo').populate('reportadoPor');
    res.json(incidentes);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener incidentes" });
  }
});

app.post("/api/incidentes", verificarToken, async (req, res) => {
  try {
    const { vehiculoId, descripcion } = req.body;
    const usuarioId = req.user.id; 

    if (!descripcion || descripcion.trim() === '') {
       return res.status(400).json({ message: "La descripción es obligatoria" });
    }

    const nuevoIncidente = new Incidente({ vehiculo: vehiculoId, reportadoPor: usuarioId, descripcion: descripcion });
    await nuevoIncidente.save();
    registrarLog(`Evento Crítico: Incidente reportado en vehículo ${vehiculoId}`);
    res.status(201).json(nuevoIncidente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/incidentes/:id", verificarToken, async (req, res) => {
  try {
    const actualizado = await Incidente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/incidentes/:id", verificarToken, verificarAdmin, async (req, res) => {
  try {
    await Incidente.findByIdAndDelete(req.params.id);
    res.json({ message: "Incidente eliminado correctamente" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
//       ENDPOINTS DE TRANSACCIONES
// ==========================================
app.get("/api/transacciones", verificarToken, async (req, res) => {
  try {
    const transacciones = await Transaccion.find().populate('usuarioID'); 
    res.json(transacciones);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener transacciones" });
  }
});

app.post("/api/transacciones", verificarToken, async (req, res) => {
  try {
    const { tipo, monto } = req.body;
    const usuarioId = req.user.id;

    if (monto < 0) return res.status(400).json({ message: "El monto no puede ser negativo" });
    
    const tiposValidos = ['Recarga', 'Cobro_Renta', 'Multa'];
    if (!tiposValidos.includes(tipo)) return res.status(400).json({ message: "Tipo de transacción inválido" });

    const nuevaTransaccion = new Transaccion({ usuarioID: usuarioId, tipo, monto });
    await nuevaTransaccion.save();
    registrarLog(`Evento Crítico: Transacción tipo ${tipo} por $${monto}`);
    res.status(201).json(nuevaTransaccion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/transacciones/:id", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const actualizada = await Transaccion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(actualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/transacciones/:id", verificarToken, verificarAdmin, async (req, res) => {
  try {
    await Transaccion.findByIdAndDelete(req.params.id);
    res.json({ message: "Transacción eliminada correctamente" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
//        REPORTES COMPLEJOS (RÚBRICA)
// ==========================================
app.get("/api/reportes/historial-rentas", verificarToken, async (req, res) => {
  try {
    const reporte = await Renta.find().populate('usuario', 'nombre correo').populate('vehiculo', 'codigoVehiculo tipo'); 
    res.json(reporte);
  } catch (error) { res.status(500).json({ message: "Error" }); }
});

app.get("/api/reportes/incidentes-pendientes", verificarToken, async (req, res) => {
  try {
    const incidentesPendientes = await Incidente.find({ estado: 'Pendiente' }).populate('vehiculo', 'codigoVehiculo tipo estado').populate('reportadoPor', 'nombre correo'); 
    res.json(incidentesPendientes);
  } catch (error) { res.status(500).json({ message: "Error" }); }
});

app.get("/api/reportes/ingresos-transacciones", verificarToken, async (req, res) => {
  try {
    const ingresos = await Transaccion.find().populate('usuarioID', 'nombre correo billetera');
    res.json(ingresos);
  } catch (error) { res.status(500).json({ message: "Error" }); }
});

app.get("/api/reportes/ocupacion-estaciones", verificarToken, async (req, res) => {
  try {
    const ocupacion = await Vehiculo.find({ estacionActual: { $ne: null } }).populate('estacionActual', 'nombre capacidadMaxima estado');
    res.json(ocupacion);
  } catch (error) { res.status(500).json({ message: "Error" }); }
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  registrarLog(`Inicio de proceso: Servidor abierto en puerto ${PORT}`);
  console.log(`Servidor abierto en el puerto ${PORT}`);
});