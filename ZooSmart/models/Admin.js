const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  nombre_zoo: { type: String, required: true },
}, {
  collection: 'Admins' // Nombre de la colección en MongoDB
});

module.exports = mongoose.model('Admins', AdminSchema);

