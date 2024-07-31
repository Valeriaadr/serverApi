const mongoose = require('mongoose');

const ZooSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  nombre: { type: String, required: true },
  ciudad: { type: String, required: true },
  pais: { type: String, required: true },
  direccion: { type: String, required: true },
  admin_id: { type: Number, required: true, ref: 'Admins' },
}, {
  collection: 'Zoos' // Nombre de la colección en MongoDB
});
module.exports = mongoose.model('Zoos', ZooSchema);
