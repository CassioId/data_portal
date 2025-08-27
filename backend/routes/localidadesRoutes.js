   const express = require('express');
   const router = express.Router();
   const localidadesController = require('../controllers/localidadesController');

   router.get('/estados', localidadesController.getEstados);
   router.get('/estados/:uf/municipios', localidadesController.getMunicipiosPorEstado);

   module.exports = router;
