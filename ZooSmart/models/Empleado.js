const mongoose = require('mongoose');

const EmpleadoSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  admin_id: { type: Number, required: true, ref: 'Admin' },
  nombre: { type: String, required: true },
  nombre_zoo: { type: String, required: true },
  zona: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  fecha_nacimiento: { type: Date, required: true },
  fecha_agregado: { type: Date, required: true,default: Date.now },
}, {
  collection: 'Empleados' // Nombre de la colección en MongoDB
});
module.exports = mongoose.model('Empleados', EmpleadoSchema);
