   const axios = require('axios');
   const { IBGE_API } = require('../config/config');

   // Buscar todos os estados
   exports.getEstados = async (req, res, next) => {
     try {
       const response = await axios.get(`${IBGE_API.LOCALIDADES}/estados`);
       res.json(response.data);
     } catch (error) {
       next(error);
     }
   };

   // Buscar municípios por estado
   exports.getMunicipiosPorEstado = async (req, res, next) => {
     try {
       const { uf } = req.params;
       const response = await axios.get(`${IBGE_API.LOCALIDADES}/estados/${uf}/municipios`);
       res.json(response.data);
     } catch (error) {
       next(error);
     }
   };
