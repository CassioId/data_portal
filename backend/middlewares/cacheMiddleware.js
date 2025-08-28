// backend/middlewares/cacheMiddleware.js

/**
 * Middleware para cache de respostas HTTP
 * Armazena respostas em memória por um período configurável
 */

// Cache em memória simples
const cache = new Map();

/**
 * Configura cache para uma rota específica
 * @param {number} duration - Duração do cache em segundos
 * @returns {Function} Middleware Express
 */
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Não usar cache para métodos diferentes de GET
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    // Se temos uma resposta em cache válida
    if (cachedResponse && cachedResponse.expiry > Date.now()) {
      console.log(`[Cache] Hit para ${key}`);
      
      // Restaura os cabeçalhos do cache
      Object.entries(cachedResponse.headers).forEach(([name, value]) => {
        res.setHeader(name, value);
      });
      
      // Define header adicional para indicar que é uma resposta de cache
      res.setHeader('X-Cache', 'HIT');
      
      // Retorna dados em cache
      return res.status(cachedResponse.status).send(cachedResponse.data);
    }

    // Cache miss - intercepta o método original de envio
    console.log(`[Cache] Miss para ${key}`);
    res.setHeader('X-Cache', 'MISS');
    
    // Captura a resposta para armazenar em cache
    const originalSend = res.send;
    res.send = function (body) {
      // Não armazena em cache respostas de erro
      if (res.statusCode >= 400) {
        return originalSend.call(this, body);
      }

      // Armazena a resposta no cache
      const responseToCache = {
        data: body,
        status: res.statusCode,
        headers: res.getHeaders(),
        expiry: Date.now() + (duration * 1000)
      };
      
      cache.set(key, responseToCache);
      
      // Envia a resposta normalmente
      return originalSend.call(this, body);
    };

    next();
  };
};

/**
 * Limpa todo o cache ou uma chave específica
 * @param {string} [key] - Chave específica para limpar (opcional)
 */
const clearCache = (key) => {
  if (key) {
    console.log(`[Cache] Limpando cache para ${key}`);
    cache.delete(key);
  } else {
    console.log('[Cache] Limpando todo o cache');
    cache.clear();
  }
};

/**
 * Retorna estatísticas do cache atual
 * @returns {Object} Estatísticas do cache
 */
const getCacheStats = () => {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;
  
  cache.forEach(entry => {
    if (entry.expiry > now) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  });
  
  return {
    totalEntries: cache.size,
    validEntries,
    expiredEntries,
    memoryUsageEstimate: JSON.stringify(Array.from(cache.entries())).length
  };
};

module.exports = {
  cacheMiddleware,
  clearCache,
  getCacheStats
};
