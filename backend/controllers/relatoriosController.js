/**
 * Controller para geração e manipulação de relatórios personalizados
 * Permite aos usuários criar relatórios dinâmicos combinando diferentes conjuntos de dados
 */
const axios = require('axios');
const { handleApiError } = require('../utils/errorHandler');
const { formatarDadosParaExportacao } = require('../utils/formatUtils');
const { gerarPDF, gerarExcel, gerarCSV } = require('../services/exportService');
const logger = require('../utils/logger');

// URL base da API do IBGE
const IBGE_API_BASE_URL = process.env.IBGE_API_BASE_URL || 'https://servicodados.ibge.gov.br/api/v1';

// Formatos de exportação suportados
const FORMATOS_SUPORTADOS = ['json', 'pdf', 'excel', 'xlsx', 'csv'];

/**
 * Coleta dados de múltiplas fontes da API do IBGE
 * @param {Array} indicadores - Lista de indicadores a serem consultados
 * @param {Array} localidades - Lista de códigos de localidades
 * @param {Array} periodos - Lista de períodos/anos
 * @returns {Array} Dados coletados das APIs
 */
async function coletarDadosRelatorio(indicadores, localidades, periodos) {
  try {
    // Mapeamento de indicadores para endpoints específicos da API
    const endpointPorIndicador = {
      'populacao': '/populacao/estimativa',
      'densidade': '/pesquisas/censo/indicadores',
      'pib': '/economia/pib/municipal',
      'alfabetizacao': '/educacao/indicadores',
      // Adicione mais mapeamentos conforme necessário
    };

    // Transformar arrays em strings para URL
    const localidadesStr = localidades.join('|');
    const periodosStr = periodos ? periodos.join('|') : '';

    const requests = indicadores.map(indicador => {
      const endpoint = endpointPorIndicador[indicador] || `/indicadores/${indicador}`;
      
      // Constrói a URL baseada no tipo de indicador
      let url = `${IBGE_API_BASE_URL}${endpoint}`;
      
      // Adiciona parâmetros conforme a API específica
      if (endpoint.includes('populacao')) {
        url = `${url}/${localidadesStr}`;
        if (periodosStr) url = `${url}?periodo=${periodosStr}`;
      } else {
        url = `${url}?localidades=${localidadesStr}`;
        if (periodosStr) url = `${url}&periodos=${periodosStr}`;
      }
      
      logger.info(`Consultando API IBGE: ${url}`);
      return axios.get(url);
    });

    const responses = await Promise.allSettled(requests);

    // Processar resultados, mesmo que alguns tenham falhado
    const dadosColetados = responses.map((response, index) => {
      if (response.status === 'fulfilled') {
        return {
          indicador: indicadores[index],
          dados: response.value.data
        };
      } else {
        logger.error(`Erro ao consultar indicador ${indicadores[index]}: ${response.reason}`);
        return {
          indicador: indicadores[index],
          erro: response.reason.message || 'Erro na consulta',
          dados: []
        };
      }
    });

    return dadosColetados;
  } catch (error) {
    logger.error('Erro ao coletar dados para relatório:', error);
    throw new Error(`Falha ao coletar dados: ${error.message}`);
  }
}

/**
 * Gera um relatório personalizado com base nos parâmetros fornecidos
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
const gerarRelatorioPersonalizado = async (req, res) => {
  try {
    const { indicadores, localidades, periodos, formato = 'json' } = req.body;
    
    // Validação de parâmetros
    if (!indicadores || !Array.isArray(indicadores) || indicadores.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Pelo menos um indicador deve ser fornecido'
      });
    }
    
    if (!localidades || !Array.isArray(localidades) || localidades.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Pelo menos uma localidade deve ser fornecida'
      });
    }
    
    if (!FORMATOS_SUPORTADOS.includes(formato.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Formato de exportação inválido. Formatos suportados: ${FORMATOS_SUPORTADOS.join(', ')}`
      });
    }
    
    logger.info(`Gerando relatório personalizado: ${indicadores.length} indicadores, ${localidades.length} localidades`);
    
    // Coleta dados de múltiplos endpoints
    const dadosRelatorio = await coletarDadosRelatorio(indicadores, localidades, periodos);
    
    // Verificação de dados retornados
    const dadosValidos = dadosRelatorio.filter(item => item.dados && item.dados.length > 0);
    
    if (dadosValidos.length === 0) {
      logger.warn('Não foram encontrados dados para os parâmetros informados');
      return res.status(404).json({
        success: false,
        message: 'Não foram encontrados dados para os parâmetros informados'
      });
    }
    
    // Se o formato solicitado for JSON, retorna diretamente
    if (formato.toLowerCase() === 'json') {
      return res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        parametros: {
          indicadores,
          localidades,
          periodos
        },
        data: dadosRelatorio
      });
    }
    
    // Para outros formatos, prepara exportação
    return await exportarRelatorio(res, dadosRelatorio, formato, `relatorio_personalizado_${new Date().toISOString().split('T')[0]}`);
    
  } catch (error) {
    logger.error('Erro ao gerar relatório personalizado:', error);
    return handleApiError(error, res);
  }
};

/**
 * Lista os relatórios pré-configurados disponíveis
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
const listarRelatoriosPredefinidos = async (req, res) => {
  try {
    // Simulando uma lista de relatórios pré-configurados
    // Em um ambiente de produção, isso poderia vir de um banco de dados
    const relatoriosPredefinidos = [
      {
        id: 'censo2022',
        titulo: 'Censo Demográfico 2022',
        descricao: 'Dados demográficos do Censo 2022 por município e estado',
        indicadores: ['populacao', 'densidade', 'domicilios'],
        atualizadoEm: '2023-07-10'
      },
      {
        id: 'pib-municipal',
        titulo: 'PIB Municipal',
        descricao: 'Produto Interno Bruto dos municípios brasileiros',
        indicadores: ['pib', 'pib-per-capita', 'valor-adicionado'],
        atualizadoEm: '2023-03-22'
      },
      {
        id: 'educacao',
        titulo: 'Indicadores de Educação',
        descricao: 'Dados sobre alfabetização, escolarização e instituições de ensino',
        indicadores: ['alfabetizacao', 'anos-estudo', 'escolas'],
        atualizadoEm: '2023-05-15'
      },
      {
        id: 'emprego-renda',
        titulo: 'Emprego e Renda',
        descricao: 'Estatísticas sobre trabalho, ocupação e rendimento',
        indicadores: ['ocupacao', 'desemprego', 'renda-per-capita'],
        atualizadoEm: '2023-06-30'
      }
    ];
    
    logger.info(`Listando ${relatoriosPredefinidos.length} relatórios predefinidos`);
    
    return res.status(200).json({
      success: true,
      count: relatoriosPredefinidos.length,
      data: relatoriosPredefinidos
    });
  } catch (error) {
    logger.error('Erro ao listar relatórios predefinidos:', error);
    return handleApiError(error, res);
  }
};

/**
 * Gera relatório a partir de um modelo pré-configurado
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
const gerarRelatorioPredefinido = async (req, res) => {
  try {
    const { id } = req.params;
    const { localidades, formato = 'json' } = req.body;
    
    // Validações
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do relatório predefinido é obrigatório'
      });
    }
    
    if (!localidades || !Array.isArray(localidades) || localidades.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Pelo menos uma localidade deve ser fornecida'
      });
    }
    
    if (!FORMATOS_SUPORTADOS.includes(formato.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Formato de exportação inválido. Formatos suportados: ${FORMATOS_SUPORTADOS.join(', ')}`
      });
    }
    
    // Simulando a busca de configurações de relatório por ID
    // Em um ambiente de produção, isso poderia vir de um banco de dados
    const configuracaoRelatorioPorId = {
      'censo2022': {
        indicadores: ['populacao', 'densidade', 'domicilios'],
        periodos: ['2022'],
        titulo: 'Censo Demográfico 2022'
      },
      'pib-municipal': {
        indicadores: ['pib', 'pib-per-capita', 'valor-adicionado'],
        periodos: ['2018', '2019', '2020'],
        titulo: 'PIB Municipal'
      },
      'educacao': {
        indicadores: ['alfabetizacao', 'anos-estudo', 'escolas'],
        periodos: ['2021', '2022'],
        titulo: 'Indicadores de Educação'
      },
      'emprego-renda': {
        indicadores: ['ocupacao', 'desemprego', 'renda-per-capita'],
        periodos: ['2021', '2022', '2023'],
        titulo: 'Emprego e Renda'
      }
    };
    
    const configuracaoRelatorio = configuracaoRelatorioPorId[id];
    
    if (!configuracaoRelatorio) {
      return res.status(404).json({
        success: false,
        error: `Relatório predefinido com ID "${id}" não encontrado`
      });
    }
    
    // Usa as configurações predefinidas junto com as localidades fornecidas
    const { indicadores, periodos, titulo } = configuracaoRelatorio;
    
    logger.info(`Gerando relatório predefinido '${titulo}' (ID: ${id})`);
    
    // Coleta dados para o relatório
    const dadosRelatorio = await coletarDadosRelatorio(indicadores, localidades, periodos);
    
    // Se não houver dados, retorna resposta vazia
    if (dadosRelatorio.length === 0) {
      logger.warn(`Nenhum dado encontrado para relatório predefinido '${id}'`);
      return res.status(404).json({
        success: false,
        message: 'Não foram encontrados dados para os parâmetros informados'
      });
    }
    
    // Se o formato solicitado for JSON, retorna diretamente
    if (formato.toLowerCase() === 'json') {
      return res.status(200).json({
        success: true,
        titulo,
        timestamp: new Date().toISOString(),
        parametros: {
          id,
          indicadores,
          localidades,
          periodos
        },
        data: dadosRelatorio
      });
    }
    
    // Para outros formatos, procede com exportação
    const nomeArquivo = `relatorio_${id}_${new Date().toISOString().split('T')[0]}`;
    return await exportarRelatorio(res, dadosRelatorio, formato, nomeArquivo, { titulo });
    
  } catch (error) {
    logger.error('Erro ao gerar relatório predefinido:', error);
    return handleApiError(error, res);
  }
};

/**
 * Exporta relatório nos diferentes formatos suportados
 * @param {Object} res - Objeto de resposta Express
 * @param {Array} dados - Dados a serem exportados
 * @param {String} formato - Formato de exportação
 * @param {String} nomeArquivo - Nome base para o arquivo
 * @param {Object} metadata - Metadados adicionais para o relatório
 */
async function exportarRelatorio(res, dados, formato, nomeArquivo, metadata = {}) {
  try {
    const dadosFormatados = formatarDadosParaExportacao(dados);
    const { titulo = 'Relatório de Dados IBGE' } = metadata;
    
    logger.info(`Exportando relatório no formato ${formato}: ${nomeArquivo}`);
    
    if (formato.toLowerCase() === 'pdf') {
      const pdfBuffer = await gerarPDF(dadosFormatados, {
        titulo,
        subtitulo: `Gerado em ${new Date().toLocaleString('pt-BR')}`
      });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${nomeArquivo}.pdf`);
      return res.send(pdfBuffer);
    } 
    else if (formato.toLowerCase() === 'excel' || formato.toLowerCase() === 'xlsx') {
      const excelBuffer = await gerarExcel(dadosFormatados, {
        titulo,
        subtitulo: `Gerado em ${new Date().toLocaleString('pt-BR')}`
      });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${nomeArquivo}.xlsx`);
      return res.send(excelBuffer);
    } 
    else if (formato.toLowerCase() === 'csv') {
      const csvString = await gerarCSV(dadosFormatados);
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=${nomeArquivo}.csv`);
      return res.send(csvString);
    } 
    else {
      throw new Error(`Formato de exportação não implementado: ${formato}`);
    }
  } catch (error) {
    logger.error(`Erro ao exportar relatório no formato ${formato}:`, error);
    throw error;
  }
}

/**
 * Fornece meta-informações sobre os relatórios disponíveis
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
const getInformacoesRelatorios = async (req, res) => {
  try {
    // Informações sobre os tipos de relatórios e parâmetros disponíveis
    const informacoes = {
      formatosExportacao: FORMATOS_SUPORTADOS,
      tiposRelatorios: [
        {
          id: 'demografico',
          nome: 'Demográfico',
          descricao: 'Dados sobre população, faixa etária e distribuição geográfica',
          indicadoresDisponiveis: ['populacao', 'densidade', 'faixa-etaria', 'sexo']
        },
        {
          id: 'economico',
          nome: 'Econômico',
          descricao: 'Dados econômicos como PIB, renda e produção',
          indicadoresDisponiveis: ['pib', 'pib-per-capita', 'valor-adicionado', 'renda']
        },
        {
          id: 'social',
          nome: 'Social',
          descricao: 'Indicadores sociais como educação, saúde e trabalho',
          indicadoresDisponiveis: ['alfabetizacao', 'idh', 'mortalidade', 'ocupacao']
        }
      ],
      indicadores: {
        'populacao': {
          nome: 'População',
          descricao: 'Estimativa populacional',
          unidade: 'pessoas',
          periodos: ['2018', '2019', '2020', '2021', '2022']
        },
        'pib': {
          nome: 'Produto Interno Bruto',
          descricao: 'Soma de todos os bens e serviços finais produzidos',
          unidade: 'R$',
          periodos: ['2017', '2018', '2019', '2020']
        },
        // Mais indicadores...
      }
    };
    
    logger.info('Requisição de metadados sobre relatórios');
    
    return res.status(200).json({
      success: true,
      data: informacoes
    });
  } catch (error) {
    logger.error('Erro ao obter informações de relatórios:', error);
    return handleApiError(error, res);
  }
};

module.exports = {
  gerarRelatorioPersonalizado,
  listarRelatoriosPredefinidos,
  gerarRelatorioPredefinido,
  getInformacoesRelatorios
};
