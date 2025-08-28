// backend/routes/sincronizacaoRoutes.js

const express = require('express');
const router = express.Router();
const sincronizacaoController = require('../controllers/sincronizacaoController');
const authMiddleware = require('../middlewares/authMiddleware'); // Se você tiver autenticação

// Rota para iniciar sincronização de localidades (estados, municípios)
router.post('/localidades', authMiddleware, sincronizacaoController.sincronizarLocalidades);

// Rota para sincronizar indicadores específicos
router.post('/indicadores', authMiddleware, sincronizacaoController.sincronizarIndicadores);

// Rota para verificar o status da sincronização
router.get('/status', sincronizacaoController.getStatusSincronizacao);

module.exports = router;
