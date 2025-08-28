// backend/utils/errorHandler.js

/**
 * Utilitário para tratar erros de API de forma padronizada
 */

/**
 * Trata erros de API e retorna resposta apropriada
 * @param {Error} error - Objeto de erro
 * @param {Object} res - Resposta Express
 */
const handleApiError = (error, res) => {
  console.error('API Error:', error.message || error);
  
  // Erros provenientes do Axios (chamadas API)
  if (error.response) {
    // O servidor respondeu com um status de erro
    const statusCode = error.response.status;
    const errorMessage = error.response.data.message || error.response.data.error || 'Erro na API externa';
    
    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      source: 'external-api'
    });
  } 
  
  // Erro de timeout ou de conexão
  if (error.request) {
    console.error('Error request:', error.request);
    return res.status(504).json({
      success: false,
      error: 'Não foi possível se comunicar com o servidor externo. Verifique sua conexão ou tente novamente mais tarde.',
      source: 'network'
    });
  }
  
  // Erro genérico
  return res.status(500).json({
    success: false,
    error: 'Ocorreu um erro ao processar sua solicitação.',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    source: 'internal'
  });
};

/**
 * Middleware para tratamento global de erros
 */
const errorHandlerMiddleware = (err, req, res, next) => {
  console.error('Global Error Handler:', err);
  
  // Erro de validação do Express-validator
  if (err.array) {
    const validationErrors = err.array();
    return res.status(400).json({
      success: false,
      error: 'Erro de validação',
      details: validationErrors
    });
  }
  
  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'JSON inválido',
      details: err.message
    });
  }
  
  // Outros erros
  return res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Erro interno do servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = {
  handleApiError,
  errorHandlerMiddleware
};
