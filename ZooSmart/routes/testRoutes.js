const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'La API está funcionando correctamente!' });
});

module.exports = router;
