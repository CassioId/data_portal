   import React, { useState, useEffect } from 'react';
   import { getAgregados } from '../services/api';
   import DataTable from '../components/DataTable';
   import ChartView from '../components/ChartView';
   import '../styles/Dashboard.css';

   const Dashboard = () => {
     const [dadosDemograficos, setDadosDemograficos] = useState([]);
     const [dadosEconomicos, setDadosEconomicos] = useState([]);
     const [carregando, setCarregando] = useState(true);

     useEffect(() => {
       const carregarDados = async () => {
         try {
           // Carregar dados demográficos básicos (exemplo)
           const resDemografico = await getAgregados('1301', 'BR');
           setDadosDemograficos(resDemografico);
           
           // Carregar dados econômicos básicos (exemplo)
           const resEconomico = await getAgregados('4099', 'BR');
           setDadosEconomicos(resEconomico);
         } catch (error) {
           console.error('Erro ao carregar dados do dashboard:', error);
         } finally {
           setCarregando(false);
         }
       };
       
       carregarDados();
     }, []);

     if (carregando) {
       return <div className="loading">Carregando dados...</div>;
     }

     return (
       <div className="dashboard">
         <h1>Painel de Dados IBGE</h1>
         
         <div className="dashboard-cards">
           <div className="card">
             <h2>Dados Demográficos</h2>
             <ChartView data={dadosDemograficos} type="pie" />
             <DataTable data={dadosDemograficos.slice(0, 5)} />
           </div>
           
           <div className="card">
             <h2>Indicadores Econômicos</h2>
             <ChartView data={dadosEconomicos} type="bar" />
             <DataTable data={dadosEconomicos.slice(0, 5)} />
           </div>
         </div>
         
         <div className="dashboard-info">
           <h3>Sobre os Dados</h3>
           <p>
             Este painel apresenta informações estatísticas do IBGE para todo o Brasil.
             Use a seção de busca avançada para filtrar por região, estado ou município.
           </p>
         </div>
       </div>
     );
   };

   export default Dashboard;
