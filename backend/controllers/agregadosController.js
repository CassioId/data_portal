/**
 * Controller para manipulação de dados agregados do IBGE
 * Fornece endpoints para consulta de estatísticas consolidadas
 */
const axios = require('axios');
const { handleApiError } = require('../utils/errorHandler');
const { cacheMiddleware } = require('../middlewares/cacheMiddleware');

// URL base da API do IBGE
const IBGE_API_BASE_URL = process.env.IBGE_API_BASE_URL || 'https://servicodados.ibge.gov.br/api/v1';

/**
 * Obtém indicadores agregados por período
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
const getIndicadoresPorPeriodo = async (req, res) => {
  try {
    const { indicador, periodo, localidade } = req.query;
    
    if (!indicador) {
      return res.status(400).json({ 
        error: 'Parâmetro "indicador" é obrigatório' 
      });
    }
    
    // Define URL para consulta específica
    let apiUrl = `${IBGE_API_BASE_URL}/agregados/${indicador}`;
    
    // Adiciona parâmetros opcionais se fornecidos
    if (periodo) apiUrl += `/periodos/${periodo}`;
    if (localidade) apiUrl += `/localidades/${localidade}`;
    
    const response = await axios.get(apiUrl);
    
    // Aplica transformações nos dados conforme necessário
    const dadosTransformados = transformarDadosAgregados(response.data);
    
    return res.status(200).json({
      success: true,
      data: dadosTransformados
    });
  } catch (error) {
    return handleApiError(error, res);
  }
};

/**
 * Obtém lista de agregados disponíveis
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
const getAgregadosDisponiveis = async (req, res) => {
  try {
    const response = await axios.get(`${IBGE_API_BASE_URL}/agregados`);
    
    // Formata a resposta para simplificar o consumo pelo frontend
    const agregadosFormatados = response.data.map(agregado => ({
      id: agregado.id,
      nome: agregado.nome,
      periodos: agregado.periodicidade?.length || 0,
      assunto: agregado.assunto?.nome || 'Não categorizado',
      ultimaAtualizacao: agregado.dataAtualizacao || null
    }));
    
    return res.status(200).json({
      success: true,
      count: agregadosFormatados.length,
      data: agregadosFormatados
    });
  } catch (error) {
    return handleApiError(error, res);
  }
};

/**
 * Obtém metadados de um agregado específico
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
const getMetadadosAgregado = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: 'ID do agregado é obrigatório'
      });
    }
    
    const response = await axios.get(`${IBGE_API_BASE_URL}/agregados/${id}/metadados`);
    
    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    return handleApiError(error, res);
  }
};

/**
 * Obtém variáveis de um agregado específico
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
const getVariaveisAgregado = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: 'ID do agregado é obrigatório'
      });
    }
    
    const response = await axios.get(`${IBGE_API_BASE_URL}/agregados/${id}/variaveis`);
    
    return res.status(200).json({
      success: true,
      count: response.data.length,
      data: response.data
    });
  } catch (error) {
    return handleApiError(error, res);
  }
};

/**
 * Busca agregados por tema ou palavras-chave
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
const buscarAgregados = async (req, res) => {
  try {
    const { termo, assunto, offset = 0, limit = 20 } = req.query;
    
    if (!termo && !assunto) {
      return res.status(400).json({
        error: 'É necessário fornecer um termo de busca ou assunto'
      });
    }
    
    let apiUrl = `${IBGE_API_BASE_URL}/agregados`;
    const params = {};
    
    // Adiciona filtros se fornecidos
    if (termo) {
      params.busca = termo;
    }
    
    if (assunto) {
      params.assunto = assunto;
    }
    
    const response = await axios.get(apiUrl, { params });
    
    // Aplicar paginação nos resultados
    const resultadosPaginados = response.data.slice(offset, offset + limit);
    
    return res.status(200).json({
      success: true,
      count: response.data.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: resultadosPaginados
    });
  } catch (error) {
    return handleApiError(error, res);
  }
};

/**
 * Função auxiliar para transformar dados agregados em um formato mais amigável para o front-end
 * @param {Array} dados - Dados brutos retornados pela API do IBGE
 * @returns {Array} - Dados transformados
 */
const transformarDadosAgregados = (dados) => {
  // Implemente a lógica de transformação conforme necessário
  if (!Array.isArray(dados)) return dados;
  
  return dados.map(item => {
    // Exemplo de transformação básica - adaptável conforme necessidade
    return {
      ...item,
      valorFormatado: typeof item.valor === 'number' ? 
        item.valor.toLocaleString('pt-BR') : 
        item.valor
    };
  });
};

module.exports = {
  getIndicadoresPorPeriodo,
  getAgregadosDisponiveis,
  getMetadadosAgregado,
  getVariaveisAgregado,
  buscarAgregados
};
