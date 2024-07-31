const express = require('express');
const router = express.Router();
const Empleado = require('../models/Empleado');
const Animal = require('../models/Animal');

router.post('/create-employee', async (req, res) => {
  try {
    const { name, birthdate, email, password, zone, dateAdded } = req.body;
    const adminId = req.session.user.id;
    const nameZoo = req.session.user.zoo_name;

    // Generar un nuevo ID para el empleado
    const lastEmpleado = await Empleado.findOne().sort({ id: -1 });
    const newEmpleadoId = lastEmpleado ? lastEmpleado.id + 1 : 1;

    // Crear el nuevo empleado en la base de datos
    const newEmpleado = new Empleado({
      id: newEmpleadoId,
      admin_id: adminId,
      nombre: name,
      nombre_zoo: nameZoo,
      zona: zone,
      email: email,
      contraseña: password,
      fecha_nacimiento: birthdate,
      fecha_agregado: dateAdded
    });

    await newEmpleado.save();

    // Determina si se debe responder como JSON o redirigir
    if (req.headers['user-agent'].includes('Mobile')) {  // Ejemplo para detectar app móvil
      res.status(201).json({ message: 'Cuenta creada exitosamente', empleado: newEmpleado });
    } else {
      // Redirigir al cliente al home.html
      res.redirect('/home.html');
    }
  } catch (error) {
    console.error('Error al crear empleado:', error); // Imprime el error en la consola
    res.status(500).json({ message: 'Error al crear empleado', error });
  }
});


// Iniciar sesión de empleado
router.post('/login', async (req, res) => {
  try {
    const { email, password, isMobileApp } = req.body;

    // Buscar empleado por email y contraseña
    const empleado = await Empleado.findOne({ email: email, contraseña: password });

    if (empleado) {
      // Establecer la sesión del empleado
      req.session.employee = {
        id: empleado.id,
        name: empleado.nombre,
        email: empleado.email,
        nameZoo: empleado.nombre_zoo,
        zone: empleado.zona,
        birthdate: empleado.fecha_nacimiento,
        dateAdded: empleado.fecha_agregado,
        role: 'empleado'
      };

      // Enviar respuesta de éxito al cliente
      if (isMobileApp) {
        res.status(200).json({ message: 'Inicio de sesión exitoso', user: req.session.employee });
      } else {
        res.redirect('/HomeEmployee.html');
      }
    } else {
      // Enviar respuesta si las credenciales son incorrectas
      res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }
  } catch (error) {
    // Manejar errores internos del servidor
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
});

// Ruta para obtener los datos del empleado actual
router.get('/current-employee', (req, res) => {
  if (!req.session.employee) {
    res.status(401).json({ message: 'No autorizado' });
  } else {
    res.json(req.session.employee);
  }
});

// Ruta para obtener empleados por zona
router.get('/zone/:zona', async (req, res) => {
  try {
    const empleados = await Empleado.find({ zona: req.params.zona });
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener empleados', error });
  }
});

// Eliminar un empleado
router.delete('/delete-employee/:id', async (req, res) => {
  try {
    const empleadoId = req.params.id;
    
    // Eliminar empleado de la base de datos
    const result = await Empleado.deleteOne({ id: empleadoId });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Empleado eliminado exitosamente' });
    } else {
      res.status(404).json({ message: 'Empleado no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar empleado', error });
  }
});


//Ruta para que en el inicio de sesion le salgan sus animales
router.get('/animales-zona', async (req, res) => {
  if (!req.session.employee) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const zona = req.session.employee.zone;
    const animales = await Animal.find({ zona: zona });
    res.json(animales);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener animales', error });
  }
});

//API
// Obtener animales por zona (sin autenticación y sin verificación de zoológico)
router.get('/animaleszona-API', async (req, res) => {
  const { zona } = req.query;
  try {
    // Obtener los animales que pertenecen a la zona especificada
    const animals = await Animal.find({ zona: zona });
    res.json(animals);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener animales', error });
  }
});

module.exports = router;
