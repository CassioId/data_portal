import React from 'react';
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ChartView.css';

/**
 * Componente para renderizar diferentes tipos de gráficos
 */
const ChartView = ({ 
  title, 
  description, 
  type = 'line', 
  data = [], 
  loading = false,
  xAxisLabel = '',
  yAxisLabel = ''
}) => {
  // Renderiza um estado de carregamento
  if (loading) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">{title}</h3>
        <div className="empty-chart">
          <p>Carregando dados...</p>
        </div>
        {description && <p className="chart-description">{description}</p>}
      </div>
    );
  }

  // Renderiza uma mensagem se não há dados
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">{title}</h3>
        <div className="empty-chart">
          <p>Nenhum dado disponível</p>
        </div>
        {description && <p className="chart-description">{description}</p>}
      </div>
    );
  }

  // Renderiza o gráfico apropriado com base no tipo
  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        {type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#0066b3" 
              name="Valor" 
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        ) : type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#0066b3" name="Valor" />
          </BarChart>
        ) : (
          <div className="chart-error">Tipo de gráfico não suportado</div>
        )}
      </ResponsiveContainer>
      
      {description && <p className="chart-description">{description}</p>}
    </div>
  );
};

export default ChartView;