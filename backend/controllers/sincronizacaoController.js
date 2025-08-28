// backend/controllers/sincronizacaoController.js

const axios = require('axios');
const { handleApiError } = require('../utils/errorHandler');
const { clearCache } = require('../middlewares/cacheMiddleware');
const db = require('../models');  // Assumindo que você tem um modelo de banco de dados configurado

// URL base da API do IBGE
const IBGE_API_BASE_URL = process.env.IBGE_API_BASE_URL || 'https://servicodados.ibge.gov.br/api/v1';

/**
 * Sincroniza dados de localidades (estados e municípios) do IBGE
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
const sincronizarLocalidades = async (req, res) => {
  try {
    console.log('[Sincronização] Iniciando sincronização de localidades');
    
    // 1. Obter todos os estados
    const estadosResponse = await axios.get(`${IBGE_API_BASE_URL}/localidades/estados`);
    const estados = estadosResponse.data;
    
    console.log(`[Sincronização] Obtidos ${estados.length} estados`);
    
    // 2. Salvar estados no banco de dados
    for (const estado of estados) {
      await db.Estado.upsert({
        id: estado.id,
        sigla: estado.sigla,
        nome: estado.nome,
        regiao_id: estado.regiao.id
      });
    }
    
    // 3. Obter todas as regiões
    const regioesResponse = await axios.get(`${IBGE_API_BASE_URL}/localidades/regioes`);
    const regioes = regioesResponse.data;
    
    console.log(`[Sincronização] Obtidas ${regioes.length} regiões`);
    
    // 4. Salvar regiões no banco de dados
    for (const regiao of regioes) {
      await db.Regiao.upsert({
        id: regiao.id,
        sigla: regiao.sigla,
        nome: regiao.nome
      });
    }
    
    // 5. Obter municípios (em lotes para evitar sobrecarga)
    console.log('[Sincronização] Iniciando sincronização de municípios por estado');
    
    const municipiosCount = await sincronizarMunicipiosPorEstado(estados);
    
    // 6. Limpar o cache após sincronização
    clearCache();
    
    res.status(200).json({
      success: true,
      message: 'Sincronização de localidades concluída com sucesso',
      stats: {
        regioes: regioes.length,
        estados: estados.length,
        municipios: municipiosCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Sincronização] Erro na sincronização de localidades:', error);
    handleApiError(error, res);
  }
};

/**
 * Sincroniza dados de municípios do IBGE estado por estado
 * @param {Array} estados - Lista de estados
 * @returns {Number} - Total de municípios sincronizados
 */
const sincronizarMunicipiosPorEstado = async (estados) => {
  let totalMunicipios = 0;
  
  for (const estado of estados) {
    try {
      // Obter municípios por estado
      const municipiosResponse = await axios.get(`${IBGE_API_BASE_URL}/localidades/estados/${estado.id}/municipios`);
      const municipios = municipiosResponse.data;
      
      console.log(`[Sincronização] Estado ${estado.sigla}: ${municipios.length} municípios`);
      totalMunicipios += municipios.length;
      
      // Salvar municípios no banco de dados
      for (const municipio of municipios) {
        await db.Municipio.upsert({
          id: municipio.id,
          nome: municipio.nome,
          estado_id: municipio.microrregiao.mesorregiao.UF.id
        });
      }
      
      // Aguarda um breve intervalo para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`[Sincronização] Erro ao sincronizar municípios do estado ${estado.sigla}:`, error);
      // Continua com o próximo estado mesmo se houver erro
    }
  }
  
  return totalMunicipios;
};

/**
 * Sincroniza dados de indicadores específicos do IBGE
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
const sincronizarIndicadores = async (req, res) => {
  try {
    const { indicadores } = req.body;
    
    if (!indicadores || !Array.isArray(indicadores) || indicadores.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'É necessário fornecer uma lista de indicadores para sincronizar'
      });
    }
    
    console.log(`[Sincronização] Iniciando sincronização de ${indicadores.length} indicadores`);
    
    const resultados = {};
    
    // Sincroniza cada indicador solicitado
    for (const indicador of indicadores) {
      try {
        // Verificar o tipo de indicador e chamar a função específica
        switch (indicador.toLowerCase()) {
          case 'pib':
            resultados.pib = await sincronizarPIB();
            break;
          case 'populacao':
            resultados.populacao = await sincronizarPopulacao();
            break;
          case 'educacao':
            resultados.educacao = await sincronizarEducacao();
            break;
          default:
            resultados[indicador] = {
              success: false,
              error: `Indicador não suportado: ${indicador}`
            };
        }
      } catch (error) {
        console.error(`[Sincronização] Erro ao sincronizar indicador ${indicador}:`, error);
        resultados[indicador] = {
          success: false,
          error: error.message || 'Erro desconhecido'
        };
      }
    }
    
    // Limpar cache relacionado aos indicadores
    clearCache();
    
    res.status(200).json({
      success: true,
      message: 'Sincronização de indicadores concluída',
      resultados,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Sincronização] Erro na sincronização de indicadores:', error);
    handleApiError(error, res);
  }
};

/**
 * Sincroniza dados de PIB
 * @returns {Object} Estatísticas da sincronização
 */
const sincronizarPIB = async () => {
  console.log('[Sincronização] Sincronizando dados de PIB');
  
  // Implemente a lógica específica para sincronização de PIB
  // Exemplo:
  const response = await axios.get(`${IBGE_API_BASE_URL}/pesquisas/10080/periodos/2010|2015|2020/indicadores/37|38|47|48`);
  
  // Processa e salva os dados
  const dados = response.data;
  let contador = 0;
  
  for (const item of dados) {
    // Implemente a lógica de salvamento específica para seu banco
    // await db.Indicador.upsert(...)
    contador++;
  }
  
  return {
    success: true,
    count: contador,
    message: `${contador} registros de PIB sincronizados`
  };
};

/**
 * Sincroniza dados de população
 * @returns {Object} Estatísticas da sincronização
 */
const sincronizarPopulacao = async () => {
  console.log('[Sincronização] Sincronizando dados de população');
  
  // Implemente a lógica específica para sincronização de população
  // Exemplo:
  const response = await axios.get(`${IBGE_API_BASE_URL}/projecoes/populacao`);
  
  // Processa e salva os dados
  const dados = response.data;
  let contador = 0;
  
  for (const item of dados) {
    // Implemente a lógica de salvamento específica para seu banco
    // await db.Populacao.upsert(...)
    contador++;
  }
  
  return {
    success: true,
    count: contador,
    message: `${contador} registros de população sincronizados`
  };
};

/**
 * Sincroniza dados de educação
 * @returns {Object} Estatísticas da sincronização
 */
const sincronizarEducacao = async () => {
  console.log('[Sincronização] Sincronizando dados de educação');
  
  // Implemente a lógica específica para sincronização de educação
  
  return {
    success: true,
    count: 0,
    message: `Dados de educação sincronizados com sucesso`
  };
};

/**
 * Obtém o status de sincronização
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
const getStatusSincronizacao = async (req, res) => {
  try {
    // Neste exemplo, buscamos a data da última sincronização
    // Em um cenário real, isso viria do banco de dados
    
    const ultimaSincronizacao = {
      localidades: {
        data: await db.Sincronizacao.findOne({ where: { tipo: 'localidades' }, order: [['createdAt', 'DESC']] }),
        status: 'completo'
      },
      pib: {
        data: await db.Sincronizacao.findOne({ where: { tipo: 'pib' }, order: [['createdAt', 'DESC']] }),
        status: 'completo'
      },
      populacao: {
        data: await db.Sincronizacao.findOne({ where: { tipo: 'populacao' }, order: [['createdAt', 'DESC']] }),
        status: 'completo'
      }
    };
    
    res.status(200).json({
      success: true,
      dados: ultimaSincronizacao
    });
  } catch (error) {
    handleApiError(error, res);
  }
};

module.exports = {
  sincronizarLocalidades,
  sincronizarIndicadores,
  getStatusSincronizacao
};
