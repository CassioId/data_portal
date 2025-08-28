import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaCity, FaChartLine, FaMapMarkedAlt } from 'react-icons/fa';
import ChartView from '../components/ChartView';
import DataTable from '../components/DataTable';

// Importação do CSS
import '../styles/Dashboard.css';

/**
 * Dashboard principal com resumo dos dados e visualizações
 */
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [populationData, setPopulationData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [error, setError] = useState(null);

  // Efeito para buscar dados ao carregar o componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Exemplo de busca de dados da API
        // Em produção, substituir por chamadas reais à API
        const populationResponse = await axios.get('/api/populacao/resumo');
        const cityResponse = await axios.get('/api/municipios/resumo');
        
        setPopulationData(populationResponse.data);
        setCityData(cityResponse.data);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Não foi possível carregar os dados. Por favor, tente novamente mais tarde.');
        
        // Dados fictícios para desenvolvimento
        setPopulationData([
          { ano: 2010, populacao: 190755799 },
          { ano: 2011, populacao: 192379287 },
          { ano: 2012, populacao: 193976530 },
          { ano: 2013, populacao: 201032714 },
          { ano: 2014, populacao: 202768562 },
          { ano: 2015, populacao: 204482459 },
          { ano: 2016, populacao: 206114067 },
          { ano: 2017, populacao: 207660929 },
          { ano: 2018, populacao: 208494900 },
          { ano: 2019, populacao: 210147125 },
          { ano: 2020, populacao: 211755692 },
          { ano: 2021, populacao: 213317639 }
        ]);
        
        setCityData([
          { regiao: 'Norte', qtd: 450 },
          { regiao: 'Nordeste', qtd: 1794 },
          { regiao: 'Sudeste', qtd: 1668 },
          { regiao: 'Sul', qtd: 1191 },
          { regiao: 'Centro-Oeste', qtd: 467 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cálculo de estatísticas básicas
  const getLatestPopulation = () => {
    if (populationData.length === 0) return 0;
    return populationData[populationData.length - 1].populacao.toLocaleString('pt-BR');
  };

  const getTotalCities = () => {
    if (cityData.length === 0) return 0;
    return cityData.reduce((acc, curr) => acc + curr.qtd, 0).toLocaleString('pt-BR');
  };

  const getPopulationGrowth = () => {
    if (populationData.length < 2) return '0%';
    const latest = populationData[populationData.length - 1].populacao;
    const previous = populationData[populationData.length - 2].populacao;
    const growth = ((latest - previous) / previous) * 100;
    return growth.toFixed(2) + '%';
  };

  // Preparação dos dados para o gráfico de população
  const populationChartData = populationData.map(item => ({
    name: item.ano.toString(),
    value: item.populacao
  }));

  // Preparação dos dados para o gráfico de municípios por região
  const citiesChartData = cityData.map(item => ({
    name: item.regiao,
    value: item.qtd
  }));

  // Colunas para a tabela de dados
  const populationColumns = [
    { header: 'Ano', accessor: 'ano' },
    { 
      header: 'População', 
      accessor: 'populacao',
      cell: (value) => value.toLocaleString('pt-BR')
    },
    { 
      header: 'Variação',
      accessor: (row, rowIndex, data) => {
        if (rowIndex === 0) return '-';
        const current = row.populacao;
        const previous = data[rowIndex - 1].populacao;
        const variation = ((current - previous) / previous) * 100;
        const isPositive = variation > 0;
        
        return (
          <span style={{ color: isPositive ? 'green' : 'red' }}>
            {isPositive ? '+' : ''}{variation.toFixed(2)}%
          </span>
        );
      }
    }
  ];

  return (
    <div className="dashboard-container">
      {error && <div className="error-message">{error}</div>}
      
      <section className="dashboard-summary">
        <h1>Panorama Nacional</h1>
        <p>Visão geral dos principais indicadores demográficos do Brasil</p>
        
        <div className="grid grid-4">
          {/* Card 1 - População Total */}
          <div className="data-card">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaUsers size={24} color="#0066b3" style={{ marginRight: '10px' }} />
              <h3>População Total</h3>
            </div>
            <h2>{loading ? '...' : getLatestPopulation()}</h2>
            <p>Habitantes</p>
          </div>
          
          {/* Card 2 - Total de Municípios */}
          <div className="data-card">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaCity size={24} color="#0066b3" style={{ marginRight: '10px' }} />
              <h3>Municípios</h3>
            </div>
            <h2>{loading ? '...' : getTotalCities()}</h2>
            <p>Cidades</p>
          </div>
          
          {/* Card 3 - Crescimento Populacional */}
          <div className="data-card">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaChartLine size={24} color="#0066b3" style={{ marginRight: '10px' }} />
              <h3>Crescimento</h3>
            </div>
            <h2>{loading ? '...' : getPopulationGrowth()}</h2>
            <p>Último ano</p>
          </div>
          
          {/* Card 4 - Densidade Demográfica */}
          <div className="data-card">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaMapMarkedAlt size={24} color="#0066b3" style={{ marginRight: '10px' }} />
              <h3>Densidade</h3>
            </div>
            <h2>{loading ? '...' : '24,88'}</h2>
            <p>Hab/km²</p>
          </div>
        </div>
      </section>
      
      <div className="grid grid-2">
        {/* Gráfico de População */}
        <ChartView 
          title="Evolução da População Brasileira"
          description="População estimada por ano"
          type="line"
          data={populationChartData}
          loading={loading}
          xAxisLabel="Ano"
          yAxisLabel="Habitantes"
        />
        
        {/* Gráfico de Distribuição de Municípios */}
        <ChartView 
          title="Municípios por Região"
          description="Distribuição dos municípios brasileiros por região"
          type="bar"
          data={citiesChartData}
          loading={loading}
          xAxisLabel="Região"
          yAxisLabel="Quantidade"
        />
      </div>
      
      {/* Tabela de Dados */}
      <section className="section-container">
        <h2 className="section-title">Dados Populacionais por Ano</h2>
        <DataTable 
          data={populationData}
          columns={populationColumns}
          loading={loading}
          pagination
          itemsPerPage={10}
        />
      </section>
    </div>
  );
};

export default Dashboard;