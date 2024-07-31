const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Zoo = require('../models/Zoo');
const Animal = require('../models/Animal');
const Empleado = require('../models/Empleado');

// Crear cuenta de admin
router.post('/create-account', async (req, res) => {
  try {
    const { name, email, password, nameZoo, country, state, city, address, isMobileApp } = req.body;

    const lastAdmin = await Admin.findOne().sort({ id: -1 });
    const newAdminId = lastAdmin ? lastAdmin.id + 1 : 1;

    // Crear nuevo administrador
    const newAdmin = new Admin({
      id: newAdminId,
      nombre: name,
      email: email,
      contraseña: password,
      nombre_zoo: nameZoo,
    });

    await newAdmin.save();

    // Crear nuevo zoológico
    const newZoo = new Zoo({
      id: newAdminId,
      nombre: nameZoo,
      pais: country,
      estado: state,
      ciudad: city,
      direccion: address,
      admin_id: newAdminId,
    });

    await newZoo.save();

    req.session.user = {
      id: newAdminId,
      zoo_name: nameZoo,
      name: name,
      email: email,
      country: country,
      state: state,
      city: city,
      address: address
    };

    if (isMobileApp) {
      res.status(201).json({ message: 'Cuenta creada exitosamente', user: req.session.user });
    } else {
      res.redirect('/home.html');
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al crear admin', error });
  }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password, isMobileApp } = req.body;
    const admin = await Admin.findOne({ email: email, contraseña: password });

    if (admin) {
      const zoo = await Zoo.findOne({ admin_id: admin.id });

      req.session.user = {
        id: admin.id,
        zoo_name: zoo.nombre,
        name: admin.nombre,
        email: admin.email,
        country: zoo.pais,
        state: zoo.estado,
        city: zoo.ciudad,
        address: zoo.direccion
      };

      // Almacenar adminId en sessionStorage
      if (!isMobileApp) {
        res.cookie('adminId', admin.id, { httpOnly: true }); // Almacenar el ID en una cookie para acceder desde el front-end
      }

      if (isMobileApp) {
        res.status(200).json({ message: 'Inicio de sesión exitoso', user: req.session.user });
      } else {
        res.redirect('/home.html');
      }
    } else {
      res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
});


// Obtener información de admin por ID
router.get('/api/admin/:id', async (req, res) => {
  try {
    const adminId = req.params.id;
    const admin = await Admin.findOne({ id: adminId });
    const zoo = await Zoo.findOne({ admin_id: adminId });

    if (!admin) {
      return res.status(404).json({ message: 'Admin no encontrado' });
    }

    res.json({
      id: admin.id,
      name: admin.nombre,
      email: admin.email,
      zoo_name: admin.nombre_zoo,
      country: zoo.pais,
      state: zoo.estado,
      city: zoo.ciudad,
      address: zoo.direccion
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la información del admin', error });
  }
});


// Eliminar cuenta de admin, zoo, animales y empleados
router.delete('/:id', async (req, res) => {
  try {
    const adminId = req.params.id;

    // Eliminar zoo asociado
    const zooDeleted = await Zoo.findOneAndDelete({ admin_id: adminId });
    if (!zooDeleted) {
      return res.status(404).json({ message: 'Zoo no encontrado' });
    }

    // Eliminar animales asociados al zoo
    const animalsDeleted = await Animal.deleteMany({ zona: zooDeleted.nombre });
    if (animalsDeleted.deletedCount === 0) {
      return res.status(404).json({ message: 'Animales no encontrados' });
    }

    // Eliminar empleados asociados al zoo
    const employeesDeleted = await Empleado.deleteMany({ zoo_name: zooDeleted.nombre });
    if (employeesDeleted.deletedCount === 0) {
      return res.status(404).json({ message: 'Empleados no encontrados' });
    }

    // Eliminar admin
    const adminDeleted = await Admin.findByIdAndDelete(adminId);
    if (!adminDeleted) {
      return res.status(404).json({ message: 'Admin no encontrado' });
    }

    res.json({ message: 'Cuenta y datos asociados eliminados correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la cuenta', error });
  }
});


module.exports = router;
