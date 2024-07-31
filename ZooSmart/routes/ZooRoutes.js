const express = require('express');
const router = express.Router();
const Zoo = require('../models/Zoo');
const Admin = require('../models/Admin');

router.post('/api/create-zoo', async (req, res) => {
    try {
        const { name, country, state, city, address, adminId } = req.body;
        const newZoo = new Zoo({ nombre: name, ciudad: city, pais: country, direccion: address, especies: [] });
        await newZoo.save();

        await Admin.findByIdAndUpdate(adminId, { nombre_zoo: name });

        res.status(201).json({ message: 'Zoo creado exitosamente', zooId: newZoo._id });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear zoo', error });
    }
});

module.exports = router;
