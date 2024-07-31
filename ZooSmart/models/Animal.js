const mongoose = require('mongoose');

const AnimalSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  info_adicional: { type: String, required: true },
  fecha_nacimiento: { type: Date, required: true },
  edad: {
    años: { type: Number, required: true },
    meses: { type: Number, required: true },
    dias: { type: Number, required: true }
  },
  dieta: { type: String, required: true },
  fecha_arrivo: { type: Date, required: true },
  zoo_name: { type: String, required: true }, // Cambiado a String
  zona: { type: String, required: true },
}, {
  collection: 'Animals' // Nombre de la colección en MongoDB
});

module.exports = mongoose.model('Animals', AnimalSchema);
