// backend/routes/localidadesRoutes.js

const express = require('express');
const router = express.Router();
const localidadesController = require('../controllers/localidadesController');
const { cacheMiddleware } = require('../middlewares/cacheMiddleware');

// Aplica cache de 1 hora (3600 segundos) para rotas que raramente mudam
const CACHE_DURATION_LONG = 3600;

// Certifique-se de que todos os controllers exportados são funções
// e estão sendo importados corretamente
router.get('/estados', cacheMiddleware(CACHE_DURATION_LONG), localidadesController.getEstados);
router.get('/estados/:uf', cacheMiddleware(CACHE_DURATION_LONG), localidadesController.getEstadoPorUF);
router.get('/estados/:uf/municipios', cacheMiddleware(CACHE_DURATION_LONG), localidadesController.getMunicipiosPorUF);
router.get('/municipios', cacheMiddleware(CACHE_DURATION_LONG), localidadesController.getMunicipios);
router.get('/municipios/:id', cacheMiddleware(CACHE_DURATION_LONG), localidadesController.getMunicipioPorId);
router.get('/regioes', cacheMiddleware(CACHE_DURATION_LONG), localidadesController.getRegioes);
router.get('/regioes/:id', cacheMiddleware(CACHE_DURATION_LONG), localidadesController.getRegiaoPorId);

// Rota para estatísticas de cache
router.get('/cache/stats', (req, res) => {
  const { getCacheStats } = require('../middlewares/cacheMiddleware');
  res.json(getCacheStats());
});

// Rota para limpar cache (protegida por autenticação em ambiente de produção)
router.post('/cache/clear', (req, res) => {
  const { clearCache } = require('../middlewares/cacheMiddleware');
  const { key } = req.body;
  
  clearCache(key);
  res.json({ success: true, message: key ? `Cache para ${key} limpo` : 'Cache completamente limpo' });
});

module.exports = router;
