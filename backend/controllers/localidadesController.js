// backend/controllers/localidadesController.js

const axios = require('axios');
const { handleApiError } = require('../utils/errorHandler');
const { cacheMiddleware } = require('../middlewares/cacheMiddleware');

// URL base da API do IBGE para localidades
const IBGE_API_BASE_URL = process.env.IBGE_API_BASE_URL || 'https://servicodados.ibge.gov.br/api/v1';

/**
 * Obtém a lista de todos os estados brasileiros
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
const getEstados = async (req, res) => {
  try {
    const response = await axios.get(`${IBGE_API_BASE_URL}/localidades/estados`);
    const estados = response.data.map(estado => ({
      id: estado.id,
      sigla: estado.sigla,
      nome: estado.nome,
      regiao: {
        id: estado.regiao.id,
        sigla: estado.regiao.sigla,
        nome: estado.regiao.nome
      }
    }));

    res.status(200).json(estados);
  } catch (error) {
    handleApiError(error, res);
  }
};

/**
 * Obtém informações detalhadas sobre um estado específico por UF
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
const getEstadoPorUF = async (req, res) => {
  try {
    const { uf } = req.params;
    
    if (!uf) {
      return res.status(400).json({ message: 'UF do estado é obrigatória' });
    }
    
    const response = await axios.get(`${IBGE_API_BASE_URL}/localidades/estados/${uf}`);
    res.status(200).json(response.data);
  } catch (error) {
    handleApiError(error, res);
  }
};

/**
 * Obtém todos os municípios de um estado específico
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
const getMunicipiosPorUF = async (req, res) => {
  try {
    const { uf } = req.params;
    
    if (!uf) {
      return res.status(400).json({ message: 'UF do estado é obrigatória' });
    }
    
    const response = await axios.get(`${IBGE_API_BASE_URL}/localidades/estados/${uf}/municipios`);
    res.status(200).json(response.data);
  } catch (error) {
    handleApiError(error, res);
  }
};

/**
 * Obtém a lista de todos os municípios brasileiros
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
const getMunicipios = async (req, res) => {
  try {
    const response = await axios.get(`${IBGE_API_BASE_URL}/localidades/municipios`);
    res.status(200).json(response.data);
  } catch (error) {
    handleApiError(error, res);
  }
};

/**
 * Obtém detalhes de um município específico por ID
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
const getMunicipioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'ID do município é obrigatório' });
    }
    
    const response = await axios.get(`${IBGE_API_BASE_URL}/localidades/municipios/${id}`);
    res.status(200).json(response.data);
  } catch (error) {
    handleApiError(error, res);
  }
};

/**
 * Obtém todas as regiões do Brasil
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
const getRegioes = async (req, res) => {
  try {
    const response = await axios.get(`${IBGE_API_BASE_URL}/localidades/regioes`);
    res.status(200).json(response.data);
  } catch (error) {
    handleApiError(error, res);
  }
};

/**
 * Obtém detalhes de uma região específica por ID
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
const getRegiaoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'ID da região é obrigatório' });
    }
    
    const response = await axios.get(`${IBGE_API_BASE_URL}/localidades/regioes/${id}`);
    res.status(200).json(response.data);
  } catch (error) {
    handleApiError(error, res);
  }
};

module.exports = {
  getEstados,
  getEstadoPorUF,
  getMunicipiosPorUF,
  getMunicipios,
  getMunicipioPorId,
  getRegioes,
  getRegiaoPorId
};
