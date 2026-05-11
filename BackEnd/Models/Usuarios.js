const mongoose = require ('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: true
    },
    fechaNacimiento: {
        type: Date,
        required: true
    },
    pais: {
        type: String,
        required: true
    },
    correo: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    rol: { 
        type: String, 
        default: 'cliente'
    },
    adeudo: { 
        type: Number, 
        default: 0 
    },

    // 👉 ¡AQUÍ ESTÁ EL CAJÓN DE LA FOTO QUE FALTABA!
    fotoPerfil: { 
        type: String, 
        default: "" 
    },

    metodosPago: [{
        ultimos4: String,
        marca: String,
        expiracion: String,
        tarjetaEncriptada: String
    }],

    billetera: {
        saldo: { 
            type: Number, 
            default: 0 
        },
        tieneAdeudo: { 
            type: Boolean, 
            default: false 
        }
    }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);