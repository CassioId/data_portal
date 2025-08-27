/**
 * relatoriosRoutes.js
 * Rotas para gerar e baixar relatórios baseados nos dados do IBGE
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { IBGE_API } = require('../config/config');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

// Utilitários para exportação
const { 
  convertToCSV, 
  convertToXLSX,
  generatePDF,
  formatJSON
} = require('../utils/formatters');

/**
 * @route   GET /api/relatorios/:tipo
 * @desc    Gera e retorna um relatório para download
 * @access  Public
 * @param   tipo - Tipo de relatório (demografico, economico, etc)
 * @query   formato - Formato do relatório (csv, xlsx, pdf, json)
 * @query   parametros - Parâmetros específicos para o relatório
 */
router.get('/:tipo', async (req, res, next) => {
  try {
    const { tipo } = req.params;
    const { formato = 'csv', ...parametros } = req.query;
    
    // Verificar o tipo de relatório solicitado
    if (!tiposRelatorioValidos.includes(tipo)) {
      return res.status(400).json({ 
        error: 'Tipo de relatório inválido',
        message: `Os tipos válidos são: ${tiposRelatorioValidos.join(', ')}`
      });
    }
    
    // Buscar dados conforme o tipo de relatório
    const dados = await buscarDadosRelatorio(tipo, parametros);
    
    if (!dados || dados.length === 0) {
      return res.status(404).json({
        error: 'Dados não encontrados',
        message: 'Não foram encontrados dados para os parâmetros especificados'
      });
    }
    
    // Gerar nome do relatório
    const dataAtual = new Date().toISOString().split('T')[0];
    const nomeArquivo = `relatorio_${tipo}_${dataAtual}`;
    
    // Formatar e retornar o relatório no formato solicitado
    switch (formato.toLowerCase()) {
      case 'csv':
        const csv = convertToCSV(dados);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${nomeArquivo}.csv`);
        return res.send(csv);
        
      case 'xlsx':
        // Se tiver a função de XLSX implementada:
        const xlsxBuffer = await convertToXLSX(dados);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${nomeArquivo}.xlsx`);
        return res.send(xlsxBuffer);
        
      case 'pdf':
        // Se tiver a função de PDF implementada:
        const pdfBuffer = await generatePDF(dados, tipo);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${nomeArquivo}.pdf`);
        return res.send(pdfBuffer);
        
      case 'json':
        const jsonData = formatJSON(dados);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${nomeArquivo}.json`);
        return res.json(jsonData);
        
      default:
        return res.status(400).json({ 
          error: 'Formato inválido',
          message: 'Formatos suportados: csv, xlsx, pdf, json'
        });
    }
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    
    // Erros específicos com mensagens personalizadas
    if (error.message === 'DADOS_NAO_DISPONIVEIS') {
      return res.status(404).json({
        error: 'Dados não disponíveis',
        message: 'Os dados solicitados não estão disponíveis no momento'
      });
    }
    
    next(error);
  }
});

/**
 * @route   GET /api/relatorios/modelos
 * @desc    Lista os modelos de relatórios disponíveis
 * @access  Public
 */
router.get('/modelos', (req, res) => {
  const modelos = [
    {
      id: 'demografico',
      nome: 'Dados Demográficos',
      descricao: 'População, densidade demográfica e distribuição etária',
      parametrosDisponiveis: [
        { nome: 'localidade', tipo: 'string', obrigatorio: false, descricao: 'Código da localidade (BR, UF33, etc)' },
        { nome: 'ano', tipo: 'number', obrigatorio: false, descricao: 'Ano de referência' }
      ]
    },
    {
      id: 'economico',
      nome: 'Indicadores Econômicos',
      descricao: 'PIB, renda per capita e indicadores econômicos',
      parametrosDisponiveis: [
        { nome: 'localidade', tipo: 'string', obrigatorio: false, descricao: 'Código da localidade (BR, UF33, etc)' },
        { nome: 'indicador', tipo: 'string', obrigatorio: false, descricao: 'Tipo de indicador (pib, renda, etc)' },
        { nome: 'periodo', tipo: 'string', obrigatorio: false, descricao: 'Período desejado (ultimo, 5anos, etc)' }
      ]
    },
    {
      id: 'educacao',
      nome: 'Educação',
      descricao: 'Taxa de alfabetização, matrículas e outros indicadores educacionais',
      parametrosDisponiveis: [
        { nome: 'localidade', tipo: 'string', obrigatorio: false, descricao: 'Código da localidade (BR, UF33, etc)' },
        { nome: 'nivel', tipo: 'string', obrigatorio: false, descricao: 'Nível de ensino (fundamental, medio, superior)' }
      ]
    },
    {
      id: 'saude',
      nome: 'Saúde',
      descricao: 'Expectativa de vida, mortalidade e indicadores de saúde',
      parametrosDisponiveis: [
        { nome: 'localidade', tipo: 'string', obrigatorio: false, descricao: 'Código da localidade (BR, UF33, etc)' },
        { nome: 'indicador', tipo: 'string', obrigatorio: false, descricao: 'Tipo de indicador (expectativa_vida, mortalidade, etc)' }
      ]
    },
    {
      id: 'personalizado',
      nome: 'Relatório Personalizado',
      descricao: 'Crie um relatório com base em agregados selecionados',
      parametrosDisponiveis: [
        { nome: 'agregados', tipo: 'string', obrigatorio: true, descricao: 'Lista de códigos de agregados separados por vírgula' },
        { nome: 'localidades', tipo: 'string', obrigatorio: true, descricao: 'Códigos de localidades separados por vírgula' },
        { nome: 'periodos', tipo: 'string', obrigatorio: false, descricao: 'Períodos desejados, separados por vírgula' }
      ]
    }
  ];
  
  res.json(modelos);
});

/**
 * @route   POST /api/relatorios/personalizado
 * @desc    Gera um relatório personalizado com múltiplos agregados
 * @access  Public
 * @body    agregados - Array de códigos de agregados
 * @body    localidades - Array de códigos de localidades
 * @body    periodos - Array de períodos (opcional)
 * @body    formato - Formato do relatório (csv, xlsx, pdf, json)
 */
router.post('/personalizado', async (req, res, next) => {
  try {
    const { agregados, localidades, periodos = ['ultimo'], formato = 'csv' } = req.body;
    
    // Validar parâmetros obrigatórios
    if (!agregados || !agregados.length) {
      return res.status(400).json({ error: 'Agregados são obrigatórios' });
    }
    
    if (!localidades || !localidades.length) {
      return res.status(400).json({ error: 'Localidades são obrigatórias' });
    }
    
    // Buscar dados para cada combinação de agregado, localidade e período
    const dadosCompletos = [];
    
    for (const agregado of agregados) {
      for (const localidade of localidades) {
        for (const periodo of periodos) {
          try {
            // Construir URL da API
            let url = `${IBGE_API.AGREGADOS}/${agregado}`;
            
            if (periodo === 'ultimo') {
              url += '/periodos/ultimo/variaveis';
            } else {
              url += `/periodos/${periodo}/variaveis`;
            }
            
            url += `?localidades=${localidade}`;
            
            const response = await axios.get(url);
            
            // Processar e adicionar dados
            const dadosProcessados = processarDadosAgregados(response.data);
            dadosCompletos.push(...dadosProcessados);
          } catch (error) {
            console.error(`Erro ao buscar dados para agregado ${agregado}, localidade ${localidade}, período ${periodo}:`, error);
            // Continuamos mesmo com erro em um item específico
          }
        }
      }
    }
    
    if (dadosCompletos.length === 0) {
      return res.status(404).json({
        error: 'Dados não encontrados',
        message: 'Não foram encontrados dados para os parâmetros especificados'
      });
    }
    
    // Gerar arquivo temporário único para o relatório
    const tempDir = os.tmpdir();
    const uuid = uuidv4();
    const dataAtual = new Date().toISOString().split('T')[0];
    const nomeArquivoBase = `relatorio_personalizado_${dataAtual}_${uuid}`;
    
    // Formatar e retornar o relatório no formato solicitado
    switch (formato.toLowerCase()) {
      case 'csv':
        const csv = convertToCSV(dadosCompletos);
        const csvFilePath = path.join(tempDir, `${nomeArquivoBase}.csv`);
        await fs.writeFile(csvFilePath, csv, 'utf8');
        
        res.download(csvFilePath, `relatorio_personalizado_${dataAtual}.csv`, (err) => {
          if (err) {
            console.error('Erro ao enviar arquivo CSV:', err);
            next(err);
          }
          // Limpar arquivo temporário após envio
          fs.unlink(csvFilePath).catch(e => console.error('Erro ao remover arquivo temporário:', e));
        });
        break;
        
      // Implementações similares para os outros formatos
      case 'xlsx':
        const xlsxBuffer = await convertToXLSX(dadosCompletos);
        const xlsxFilePath = path.join(tempDir, `${nomeArquivoBase}.xlsx`);
        await fs.writeFile(xlsxFilePath, xlsxBuffer);
        
        res.download(xlsxFilePath, `relatorio_personalizado_${dataAtual}.xlsx`, (err) => {
          if (err) next(err);
          fs.unlink(xlsxFilePath).catch(e => console.error('Erro ao remover arquivo temporário:', e));
        });
        break;
        
      case 'pdf':
        const pdfBuffer = await generatePDF(dadosCompletos, 'personalizado');
        const pdfFilePath = path.join(tempDir, `${nomeArquivoBase}.pdf`);
        await fs.writeFile(pdfFilePath, pdfBuffer);
        
        res.download(pdfFilePath, `relatorio_personalizado_${dataAtual}.pdf`, (err) => {
          if (err) next(err);
          fs.unlink(pdfFilePath).catch(e => console.error('Erro ao remover arquivo temporário:', e));
        });
        break;
        
      case 'json':
        const jsonData = formatJSON(dadosCompletos);
        const jsonFilePath = path.join(tempDir, `${nomeArquivoBase}.json`);
        await fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
        
        res.download(jsonFilePath, `relatorio_personalizado_${dataAtual}.json`, (err) => {
          if (err) next(err);
          fs.unlink(jsonFilePath).catch(e => console.error('Erro ao remover arquivo temporário:', e));
        });
        break;
        
      default:
        return res.status(400).json({ 
          error: 'Formato inválido',
          message: 'Formatos suportados: csv, xlsx, pdf, json'
        });
    }
  } catch (error) {
    console.error('Erro ao gerar relatório personalizado:', error);
    next(error);
  }
});

// Lista de tipos de relatório válidos
const tiposRelatorioValidos = ['demografico', 'economico', 'educacao', 'saude', 'habitacao', 'personalizado'];

/**
 * Busca dados para um tipo específico de relatório
 * @param {string} tipo - Tipo de relatório
 * @param {Object} parametros - Parâmetros adicionais
 * @returns {Array} - Dados para o relatório
 */
async function buscarDadosRelatorio(tipo, parametros) {
  // Valores padrão
  const localidade = parametros.localidade || 'BR';
  
  switch (tipo) {
    case 'demografico':
      // Definir códigos de agregados para dados demográficos
      const codigoAgregado = '1301'; // População residente
      const ano = parametros.ano || 'ultimo';
      
      const url = `${IBGE_API.AGREGADOS}/${codigoAgregado}/periodos/${ano}/variaveis?localidades=${localidade}`;
      const response = await axios.get(url);
      
      // Processar dados específicos para este relatório
      return processarDadosDemograficos(response.data);
    
    case 'economico':
      // Indicador específico ou todos
      const indicador = parametros.indicador || 'pib';
      const periodo = parametros.periodo || 'ultimo';
      
      // Mapear indicador para código de agregado
      let codigoIndicador;
      switch (indicador) {
        case 'pib':
          codigoIndicador = '1378'; // PIB
          break;
        case 'renda':
          codigoIndicador = '4115'; // Renda per capita
          break;
        case 'desemprego':
          codigoIndicador = '6381'; // Taxa de desemprego
          break;
        default:
          codigoIndicador = '1378'; // Default: PIB
      }
      
      const urlEconomico = `${IBGE_API.AGREGADOS}/${codigoIndicador}/periodos/${periodo}/variaveis?localidades=${localidade}`;
      const responseEconomico = await axios.get(urlEconomico);
      
      return processarDadosEconomicos(responseEconomico.data, indicador);
    
    case 'educacao':
      const nivel = parametros.nivel || 'todos';
      
      // Mapear nível de ensino para código de agregado
      let codigoEducacao;
      switch (nivel) {
        case 'fundamental':
          codigoEducacao = '2579'; // Matrículas ensino fundamental
          break;
        case 'medio':
          codigoEducacao = '2580'; // Matrículas ensino médio
          break;
        case 'superior':
          codigoEducacao = '2581'; // Matrículas ensino superior
          break;
        case 'todos':
        default:
          // Buscar dados de todos os níveis e combinar
          const respostasFundamental = await axios.get(`${IBGE_API.AGREGADOS}/2579/periodos/ultimo/variaveis?localidades=${localidade}`);
          const respostasMedio = await axios.get(`${IBGE_API.AGREGADOS}/2580/periodos/ultimo/variaveis?localidades=${localidade}`);
          
          const dadosFundamental = processarDadosEducacao(respostasFundamental.data, 'fundamental');
          const dadosMedio = processarDadosEducacao(respostasMedio.data, 'medio');
          
          return [...dadosFundamental, ...dadosMedio];
      }
      
      if (nivel !== 'todos') {
        const urlEducacao = `${IBGE_API.AGREGADOS}/${codigoEducacao}/periodos/ultimo/variaveis?localidades=${localidade}`;
        const responseEducacao = await axios.get(urlEducacao);
        
        return processarDadosEducacao(responseEducacao.data, nivel);
      }
    
    case 'saude':
      const indicadorSaude = parametros.indicador || 'expectativa_vida';
      
      // Mapear indicador para código de agregado
      let codigoSaude;
      switch (indicadorSaude) {
        case 'expectativa_vida':
          codigoSaude = '3175'; // Esperança de vida ao nascer
          break;
        case 'mortalidade':
          codigoSaude = '3320'; // Taxa de mortalidade infantil
          break;
        default:
          codigoSaude = '3175'; // Default: Esperança de vida
      }
      
      const urlSaude = `${IBGE_API.AGREGADOS}/${codigoSaude}/periodos/ultimo/variaveis?localidades=${localidade}`;
      const responseSaude = await axios.get(urlSaude);
      
      return processarDadosSaude(responseSaude.data, indicadorSaude);
    
    case 'personalizado':
      // Para relatórios personalizados, o usuário deve especificar os códigos dos agregados
      if (!parametros.agregados) {
        throw new Error('PARAMETROS_INVALIDOS');
      }
      
      const agregadosLista = parametros.agregados.split(',');
      const dadosPersonalizados = [];
      
      for (const agregado of agregadosLista) {
        const urlPersonalizado = `${IBGE_API.AGREGADOS}/${agregado.trim()}/periodos/ultimo/variaveis?localidades=${localidade}`;
        const responsePersonalizado = await axios.get(urlPersonalizado);
        
        dadosPersonalizados.push(...processarDadosAgregados(responsePersonalizado.data));
      }
      
      return dadosPersonalizados;
    
    default:
      throw new Error('TIPO_RELATORIO_INVALIDO');
  }
}

/**
 * Processa os dados brutos da API do IBGE para formato padronizado
 */
function processarDadosAgregados(dados) {
  // Similar à implementação no agregadosRoutes.js
  if (!dados || !dados.length) {
    return [];
  }
  
  try {
    const dadosProcessados = [];
    
    dados.forEach(item => {
      const resultado = {
        id: item.id || '',
        variavel: item.variavel?.nome || '',
        unidade: item.unidade?.nome || '',
        localidade: item.localidade?.nome || 'Brasil',
        periodo: item.periodo || '',
      };
      
      if (item.valor !== undefined) {
        resultado.valor = item.valor;
      } else if (item.resultados && item.resultados.length > 0 && item.resultados[0].series) {
        const series = item.resultados[0].series;
        for (const key in series) {
          if (series[key].localidade && series[key].localidade.nivel) {
            resultado.valor = series[key].serie[Object.keys(series[key].serie)[0]];
            break;
          }
        }
      }
      
      dadosProcessados.push(resultado);
    });
    
    return dadosProcessados;
  } catch (error) {
    console.error('Erro ao processar dados do IBGE:', error);
    return dados;
  }
}

/**
 * Processadores específicos para cada tipo de relatório
 * Estas funções podem realizar processamentos adicionais para 
 * formatar os dados conforme o contexto do relatório
 */
function processarDadosDemograficos(dados) {
  const dadosBase = processarDadosAgregados(dados);
  
  // Adicionar colunas ou cálculos específicos para dados demográficos
  return dadosBase.map(item => ({
    ...item,
    tipo_relatorio: 'Demográfico',
    // Cálculos adicionais específicos para demografia
  }));
}

function processarDadosEconomicos(dados, indicador) {
  const dadosBase = processarDadosAgregados(dados);
  
  // Adicionar colunas ou cálculos específicos para dados econômicos
  return dadosBase.map(item => ({
    ...item,
    tipo_relatorio: 'Econômico',
    indicador: indicador,
    // Cálculos adicionais específicos para economia
  }));
}

function processarDadosEducacao(dados, nivel) {
  const dadosBase = processarDadosAgregados(dados);
  
  // Adicionar colunas ou cálculos específicos para dados de educação
  return dadosBase.map(item => ({
    ...item,
    tipo_relatorio: 'Educação',
    nivel_ensino: nivel,
    // Cálculos adicionais específicos para educação
  }));
}

function processarDadosSaude(dados, indicador) {
  const dadosBase = processarDadosAgregados(dados);
  
  // Adicionar colunas ou cálculos específicos para dados de saúde
  return dadosBase.map(item => ({
    ...item,
    tipo_relatorio: 'Saúde',
    indicador: indicador,
    // Cálculos adicionais específicos para saúde
  }));
}

module.exports = router;
