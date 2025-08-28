// backend/middlewares/authMiddleware.js

/**
 * Middleware de autenticação para proteger rotas sensíveis
 */
const authMiddleware = (req, res, next) => {
  // Obter token de autorização do header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token de autorização não fornecido'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Em um ambiente real, você validaria o token JWT ou outro mecanismo
  // Este é um exemplo simples usando uma chave API básica
  const apiKey = process.env.API_KEY || 'chave-secreta-de-desenvolvimento';
  
  if (token !== apiKey) {
    return res.status(403).json({
      success: false,
      error: 'Token de autorização inválido'
    });
  }
  
  // Se chegou aqui, está autenticado
  next();
};

module.exports = authMiddleware;
