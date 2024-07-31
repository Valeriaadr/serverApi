const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');
const Zoo = require('../models/Zoo');
const mongoose = require('mongoose');  // Importa mongoose para validar ObjectId

// Crear un nuevo animal
router.post('/create-animal', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const { nombre, descripcion, dieta, info_adicional, fecha_nacimiento, fecha_arrivo, zona } = req.body;
    const zoo_name = req.session.user.zoo_name;

    const zoo = await Zoo.findOne({ nombre: zoo_name });
    if (!zoo) {
      return res.status(400).json({ error: 'Zoo no encontrado' });
    }

    const edadDetallada = calcularEdadDetallada(new Date(fecha_nacimiento));

    const lastAnimal = await Animal.findOne().sort({ id: -1 });
    const newAnimalId = lastAnimal ? lastAnimal.id + 1 : 1;

    const newAnimal = new Animal({
      id: newAnimalId,
      nombre,
      descripcion,
      dieta,
      info_adicional,
      fecha_nacimiento: new Date(fecha_nacimiento),
      edad: edadDetallada,
      fecha_arrivo: new Date(fecha_arrivo),
      zoo_name: zoo.nombre,
      zona
    });

    await newAnimal.save();

    res.status(201).json({ url: `${zona}Zone.html`, animal: newAnimal });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener animales por zoológico
router.get('/byZoo', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('No autorizado');
  }

  const zooName = req.session.user.zoo_name;

  try {
    const animals = await Animal.find({ zoo_name: zooName });
    res.json(animals);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener animales', error });
  }
});

// Obtener un animal por ID
router.get('/:id', async (req, res) => {
  try {
    const animalId = req.params.id;

    // Verifica si el ID es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(animalId)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const animal = await Animal.findById(animalId);
    if (!animal) {
      return res.status(404).json({ message: 'Animal no encontrado' });
    }
    res.json(animal);
  } catch (error) {
    console.error('Error al obtener el animal:', error);
    res.status(500).json({ message: 'Error al obtener el animal', error });
  }
});

// Actualizar información del animal
router.put('/:id', async (req, res) => {
  try {
    const { dieta, info_adicional } = req.body;
    const animalId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(animalId)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const animal = await Animal.findById(animalId);
    if (!animal) {
      return res.status(404).json({ message: 'Animal no encontrado' });
    }

    const birthdate = new Date(animal.fecha_nacimiento);
    const today = new Date();
    const years = today.getFullYear() - birthdate.getFullYear() - (today.getMonth() < birthdate.getMonth() || (today.getMonth() === birthdate.getMonth() && today.getDate() < birthdate.getDate()) ? 1 : 0);
    const months = (today.getMonth() + 12 - birthdate.getMonth()) % 12;
    const days = Math.max(today.getDate() - birthdate.getDate(), 0);

    animal.dieta = dieta || animal.dieta;
    animal.info_adicional = info_adicional || animal.info_adicional;
    animal.edad = { años: years, meses: months, dias: days };

    await animal.save();

    res.json(animal);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la información del animal', error });
  }
});

// Eliminar animal
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    await Animal.findByIdAndDelete(id);
    res.status(200).send('Animal eliminado correctamente');
  } catch (error) {
    res.status(500).send('Error al eliminar el animal');
  }
});

// Función para calcular la edad detallada
const calcularEdadDetallada = (fechaNacimiento) => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);

  let años = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();
  let dias = hoy.getDate() - nacimiento.getDate();

  if (dias < 0) {
    meses--;
    dias += new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
  }

  if (meses < 0) {
    años--;
    meses += 12;
  }

  return { años, meses, dias };
};

//API funcionesssssss

// Obtener animales por zoológico y zona (no requiere autenticación)
router.get('/byZone/:zona', async (req, res) => {
  const zona = req.params.zona;

  try {
    const animals = await Animal.find({ zona: zona });
    res.json(animals);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener animales', error });
  }
});

// Nuevo endpoint para obtener un animal por ID numérico
router.get('/byId/:id', async (req, res) => {
  try {
    const animalId = parseInt(req.params.id, 10);

    if (isNaN(animalId)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const animal = await Animal.findOne({ id: animalId });
    if (!animal) {
      return res.status(404).json({ message: 'Animal no encontrado' });
    }
    res.json(animal);
  } catch (error) {
    console.error('Error al obtener el animal:', error);
    res.status(500).json({ message: 'Error al obtener el animal', error });
  }
});

// Convertir un ID numérico a ObjectId
const findObjectIdByNumericId = async (numericId) => {
  const animal = await Animal.findOne({ id: numericId });
  if (!animal) {
    throw new Error('Animal no encontrado');
  }
  return animal._id;
};

// Actualizar información del animal con ID numérico
router.put('/updateAnimalInfo/:id', async (req, res) => {
  try {
    const { dieta, info_adicional } = req.body;
    const numericId = req.params.id;

    console.log('Received ID:', numericId); // Debugging line
    console.log('Received body:', req.body); // Debugging line

    let objectId;
    try {
      objectId = await findObjectIdByNumericId(numericId);
    } catch (error) {
      return res.status(404).json({ message: 'Animal no encontrado' });
    }

    const animal = await Animal.findById(objectId);
    if (!animal) {
      console.error('Animal not found for ID:', objectId); // Debugging line
      return res.status(404).json({ message: 'Animal no encontrado' });
    }

    const birthdate = new Date(animal.fecha_nacimiento);
    const today = new Date();
    const years = today.getFullYear() - birthdate.getFullYear() - (today.getMonth() < birthdate.getMonth() || (today.getMonth() === birthdate.getMonth() && today.getDate() < birthdate.getDate()) ? 1 : 0);
    const months = (today.getMonth() + 12 - birthdate.getMonth()) % 12;
    const days = Math.max(today.getDate() - birthdate.getDate(), 0);

    animal.dieta = dieta || animal.dieta;
    animal.info_adicional = info_adicional || animal.info_adicional;
    animal.edad = { años: years, meses: months, dias: days };

    await animal.save();

    res.json(animal);
  } catch (error) {
    console.error('Error updating animal info:', error); // Debugging line
    res.status(500).json({ message: 'Error al actualizar la información del animal', error });
  }
});

module.exports = router;
