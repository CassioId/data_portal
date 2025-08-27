/**
 * agregadosRoutes.js
 * Rotas para acessar dados agregados (estatísticos) das APIs do IBGE
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { IBGE_API } = require('../config/config');

/**
 * @route   GET /api/agregados/categorias
 * @desc    Retorna lista de categorias de agregados disponíveis
 * @access  Public
 */
router.get('/categorias', async (req, res, next) => {
  try {
    // Aqui podemos retornar categorias pré-definidas ou consultar a API do IBGE
    // Este exemplo retorna categorias comuns pré-definidas para facilitar a navegação do usuário
    const categorias = [
      { id: '1301', nome: 'População residente, por situação do domicílio', descricao: 'Dados demográficos básicos' },
      { id: '1378', nome: 'Produto Interno Bruto a preços correntes', descricao: 'Indicadores econômicos' },
      { id: '2579', nome: 'Matrículas nos ensinos Fundamental e Médio', descricao: 'Dados educacionais' },
      { id: '3175', nome: 'Esperança de vida ao nascer', descricao: 'Indicadores de saúde' },
      { id: '5938', nome: 'Domicílios por tipo', descricao: 'Habitação e infraestrutura' },
      { id: '6579', nome: 'Taxa de analfabetismo', descricao: 'Indicadores sociais' }
    ];
    
    res.json(categorias);
  } catch (error) {
    console.error('Erro ao buscar categorias de agregados:', error);
    next(error);
  }
});

/**
 * @route   GET /api/agregados/:codigo
 * @desc    Busca dados para um agregado específico
 * @access  Public
 * @param   codigo - Código do agregado no IBGE
 * @query   localidades - Códigos das localidades (Ex: BR, UF33, MU3304557)
 * @query   periodos - Períodos desejados (default: último)
 * @query   variaveis - Variáveis desejadas (opcional)
 */
router.get('/:codigo', async (req, res, next) => {
  try {
    const { codigo } = req.params;
    const { localidades = 'BR', periodos = 'ultimo', variaveis } = req.query;
    
    // Validar parâmetros
    if (!codigo) {
      return res.status(400).json({ error: 'Código do agregado é obrigatório' });
    }
    
    // Construir URL base
    let url = `${IBGE_API.AGREGADOS}/${codigo}`;
    
    // Adicionar periodos (último ou específicos)
    if (periodos === 'ultimo') {
      url += '/periodos/ultimo';
    } else {
      url += `/periodos/${periodos}`;
    }
    
    // Adicionar variáveis se especificadas
    if (variaveis) {
      url += `/variaveis/${variaveis}`;
    } else {
      url += '/variaveis';
    }
    
    // Adicionar localidades
    url += `?localidades=${localidades}`;
    
    // Fazer requisição à API do IBGE
    const response = await axios.get(url);
    
    // Processar resposta para melhor formato
    const dadosProcessados = processarDadosAgregados(response.data);
    
    res.json(dadosProcessados);
  } catch (error) {
    console.error('Erro ao buscar dados do agregado:', error);
    
    // Tratar erros específicos
    if (error.response) {
      if (error.response.status === 404) {
        return res.status(404).json({ 
          error: 'Agregado não encontrado',
          message: 'O código do agregado especificado não existe ou não está disponível' 
        });
      }
      
      return res.status(error.response.status).json({ 
        error: 'Erro na API do IBGE',
        message: error.response.data 
      });
    }
    
    next(error);
  }
});

/**
 * @route   GET /api/agregados/:codigo/metadados
 * @desc    Busca metadados de um agregado específico
 * @access  Public
 * @param   codigo - Código do agregado no IBGE
 */
router.get('/:codigo/metadados', async (req, res, next) => {
  try {
    const { codigo } = req.params;
    
    // Validar parâmetros
    if (!codigo) {
      return res.status(400).json({ error: 'Código do agregado é obrigatório' });
    }
    
    // Fazer requisição à API do IBGE
    const url = `${IBGE_API.AGREGADOS}/${codigo}/metadados`;
    const response = await axios.get(url);
    
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar metadados do agregado:', error);
    
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ 
        error: 'Agregado não encontrado',
        message: 'O código do agregado especificado não existe ou não está disponível' 
      });
    }
    
    next(error);
  }
});

/**
 * @route   GET /api/agregados/:codigo/periodos
 * @desc    Busca períodos disponíveis para um agregado
 * @access  Public
 * @param   codigo - Código do agregado no IBGE
 */
router.get('/:codigo/periodos', async (req, res, next) => {
  try {
    const { codigo } = req.params;
    
    // Validar parâmetros
    if (!codigo) {
      return res.status(400).json({ error: 'Código do agregado é obrigatório' });
    }
    
    // Fazer requisição à API do IBGE
    const url = `${IBGE_API.AGREGADOS}/${codigo}/periodos`;
    const response = await axios.get(url);
    
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar períodos do agregado:', error);
    
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ 
        error: 'Agregado não encontrado',
        message: 'O código do agregado especificado não existe ou não está disponível' 
      });
    }
    
    next(error);
  }
});

/**
 * @route   GET /api/agregados/:codigo/variaveis
 * @desc    Busca variáveis disponíveis para um agregado
 * @access  Public
 * @param   codigo - Código do agregado no IBGE
 */
router.get('/:codigo/variaveis', async (req, res, next) => {
  try {
    const { codigo } = req.params;
    
    // Validar parâmetros
    if (!codigo) {
      return res.status(400).json({ error: 'Código do agregado é obrigatório' });
    }
    
    // Fazer requisição à API do IBGE
    const url = `${IBGE_API.AGREGADOS}/${codigo}/variaveis`;
    const response = await axios.get(url);
    
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar variáveis do agregado:', error);
    
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ 
        error: 'Agregado não encontrado',
        message: 'O código do agregado especificado não existe ou não está disponível' 
      });
    }
    
    next(error);
  }
});

/**
 * @route   GET /api/agregados/busca
 * @desc    Busca agregados por termo de busca
 * @access  Public
 * @query   termo - Termo para buscar nos agregados
 */
router.get('/busca', async (req, res, next) => {
  try {
    const { termo } = req.query;
    
    if (!termo || termo.length < 3) {
      return res.status(400).json({ 
        error: 'Termo de busca inválido',
        message: 'O termo de busca deve ter pelo menos 3 caracteres' 
      });
    }
    
    // Na API real do IBGE, poderíamos buscar por agregados que correspondem ao termo
    // Como não há endpoint específico para isso, simulamos uma busca local

    // Primeiro, buscamos todos os agregados disponíveis
    const url = `${IBGE_API.AGREGADOS}`;
    const response = await axios.get(url);
    
    // Filtramos por nome ou descrição que contém o termo de busca
    const resultados = response.data.filter(agregado => 
      agregado.nome.toLowerCase().includes(termo.toLowerCase()) ||
      (agregado.descricao && agregado.descricao.toLowerCase().includes(termo.toLowerCase()))
    );
    
    res.json(resultados);
  } catch (error) {
    console.error('Erro ao buscar agregados:', error);
    next(error);
  }
});

/**
 * Função para processar e formatar os dados recebidos da API do IBGE
 * @param {Object} dados - Dados brutos da API
 * @returns {Array} - Dados processados em formato mais amigável
 */
function processarDadosAgregados(dados) {
  // Se não houver dados, retornar array vazio
  if (!dados || !dados.length) {
    return [];
  }
  
  try {
    // Dados do IBGE vêm em formato complexo. Vamos simplificar para uso na UI
    const dadosProcessados = [];
    
    // Iteramos sobre cada resultado
    dados.forEach(item => {
      // Extrair informações básicas
      const resultado = {
        id: item.id || '',
        variavel: item.variavel?.nome || '',
        unidade: item.unidade?.nome || '',
        localidade: item.localidade?.nome || 'Brasil',
        periodo: item.periodo || '',
      };
      
      // Adicionar valor (pode estar em diferentes formatos dependendo da API)
      if (item.valor !== undefined) {
        resultado.valor = item.valor;
      } else if (item.resultados && item.resultados.length > 0 && item.resultados[0].series) {
        // Para APIs mais complexas, o valor pode estar dentro de séries
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
    // Em caso de erro, retornamos os dados originais
    return dados;
  }
}

module.exports = router;
