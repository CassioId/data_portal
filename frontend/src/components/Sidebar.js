import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronDown, FaChevronUp, FaUsers, FaCity, FaChartPie, FaGraduationCap, FaMedkit, FaDatabase, FaHome } from 'react-icons/fa';
import './Sidebar.css';

/**
 * Componente de barra lateral para navegação
 */
const Sidebar = ({ onFilterChange }) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState({
    populacao: false,
    economia: false,
    educacao: false,
    saude: false
  });

  // Verificar se existem filtros ativos
  const [filters, setFilters] = useState({
    regiao: '',
    estado: '',
    tema: ''
  });

  // Verifica se a rota atual corresponde ao link ou está no grupo
  const isActive = (path) => {
    return location.pathname === path;
  };

  const isGroupActive = (group) => {
    return location.pathname.startsWith(`/${group}`);
  };

  // Alterna a expansão de um grupo de menu
  const toggleExpand = (section) => {
    setExpanded({
      ...expanded,
      [section]: !expanded[section]
    });
  };

  // Manipular mudanças nos filtros
  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    
    setFilters(newFilters);
    
    // Passar os filtros para o componente pai, se a prop estiver definida
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Resetar todos os filtros
  const resetFilters = () => {
    const resetValues = {
      regiao: '',
      estado: '',
      tema: ''
    };
    
    setFilters(resetValues);
    
    if (onFilterChange) {
      onFilterChange(resetValues);
    }
  };

  // Verificar se há algum filtro ativo
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Opções para os filtros
  const regioes = [
    { value: '', label: 'Todas as Regiões' },
    { value: 'norte', label: 'Norte' },
    { value: 'nordeste', label: 'Nordeste' },
    { value: 'centro-oeste', label: 'Centro-Oeste' },
    { value: 'sudeste', label: 'Sudeste' },
    { value: 'sul', label: 'Sul' }
  ];

  const estados = [
    { value: '', label: 'Todos os Estados' },
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
  ];

  return (
    <aside className="sidebar">
      {/* Link para a página inicial */}
      <div className="sidebar-header">
        <Link to="/" className={`sidebar-link ${isActive('/') ? 'active' : ''}`}>
          <FaHome style={{ marginRight: '10px' }} />
          <span>Página Inicial</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {/* Seção de População */}
          <li className="sidebar-item">
            <div 
              className={`sidebar-link ${isGroupActive('populacao') ? 'active' : ''}`}
              onClick={() => toggleExpand('populacao')}
            >
              <FaUsers style={{ marginRight: '10px' }} />
              <span>População</span>
              <span style={{ marginLeft: 'auto' }}>
                {expanded.populacao ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </div>
            {expanded.populacao && (
              <ul className="sidebar-submenu">
                <li>
                  <Link 
                    to="/populacao/censo" 
                    className={`sidebar-sublink ${isActive('/populacao/censo') ? 'active' : ''}`}
                  >
                    Censo Demográfico
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/populacao/estimativas" 
                    className={`sidebar-sublink ${isActive('/populacao/estimativas') ? 'active' : ''}`}
                  >
                    Estimativas
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/populacao/projecoes" 
                    className={`sidebar-sublink ${isActive('/populacao/projecoes') ? 'active' : ''}`}
                  >
                    Projeções
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Seção de Economia */}
          <li className="sidebar-item">
            <div 
              className={`sidebar-link ${isGroupActive('economia') ? 'active' : ''}`}
              onClick={() => toggleExpand('economia')}
            >
              <FaChartPie style={{ marginRight: '10px' }} />
              <span>Economia</span>
              <span style={{ marginLeft: 'auto' }}>
                {expanded.economia ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </div>
            {expanded.economia && (
              <ul className="sidebar-submenu">
                <li>
                  <Link 
                    to="/economia/pib" 
                    className={`sidebar-sublink ${isActive('/economia/pib') ? 'active' : ''}`}
                  >
                    PIB
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/economia/inflacao" 
                    className={`sidebar-sublink ${isActive('/economia/inflacao') ? 'active' : ''}`}
                  >
                    Inflação
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/economia/emprego" 
                    className={`sidebar-sublink ${isActive('/economia/emprego') ? 'active' : ''}`}
                  >
                    Emprego e Renda
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Seção de Educação */}
          <li className="sidebar-item">
            <div 
              className={`sidebar-link ${isGroupActive('educacao') ? 'active' : ''}`}
              onClick={() => toggleExpand('educacao')}
            >
              <FaGraduationCap style={{ marginRight: '10px' }} />
              <span>Educação</span>
              <span style={{ marginLeft: 'auto' }}>
                {expanded.educacao ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </div>
            {expanded.educacao && (
              <ul className="sidebar-submenu">
                <li>
                  <Link 
                    to="/educacao/basica" 
                    className={`sidebar-sublink ${isActive('/educacao/basica') ? 'active' : ''}`}
                  >
                    Educação Básica
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/educacao/superior" 
                    className={`sidebar-sublink ${isActive('/educacao/superior') ? 'active' : ''}`}
                  >
                    Educação Superior
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/educacao/indicadores" 
                    className={`sidebar-sublink ${isActive('/educacao/indicadores') ? 'active' : ''}`}
                  >
                    Indicadores
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Seção de Saúde */}
          <li className="sidebar-item">
            <div 
              className={`sidebar-link ${isGroupActive('saude') ? 'active' : ''}`}
              onClick={() => toggleExpand('saude')}
            >
              <FaMedkit style={{ marginRight: '10px' }} />
              <span>Saúde</span>
              <span style={{ marginLeft: 'auto' }}>
                {expanded.saude ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </div>
            {expanded.saude && (
              <ul className="sidebar-submenu">
                <li>
                  <Link 
                    to="/saude/estatisticas" 
                    className={`sidebar-sublink ${isActive('/saude/estatisticas') ? 'active' : ''}`}
                  >
                    Estatísticas Vitais
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/saude/atencao" 
                    className={`sidebar-sublink ${isActive('/saude/atencao') ? 'active' : ''}`}
                  >
                    Atenção à Saúde
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/saude/indicadores" 
                    className={`sidebar-sublink ${isActive('/saude/indicadores') ? 'active' : ''}`}
                  >
                    Indicadores
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Seção de Dados */}
          <li className="sidebar-item">
            <Link 
              to="/dados" 
              className={`sidebar-link ${isActive('/dados') ? 'active' : ''}`}
            >
              <FaDatabase style={{ marginRight: '10px' }} />
              <span>Banco de Dados</span>
            </Link>
          </li>

          {/* Seção de Cidades */}
          <li className="sidebar-item">
            <Link 
              to="/cidades" 
              className={`sidebar-link ${isActive('/cidades') ? 'active' : ''}`}
            >
              <FaCity style={{ marginRight: '10px' }} />
              <span>Perfil de Cidades</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Seção de filtros */}
      <div className="sidebar-filters">
        <div className="filters-header">
          <h3>Filtros</h3>
          {hasActiveFilters && (
            <button className="reset-filters" onClick={resetFilters}>
              Resetar
            </button>
          )}
        </div>
        
        <div className="filter-group">
          <label htmlFor="regiao-filter">Região</label>
          <select
            id="regiao-filter"
            value={filters.regiao}
            onChange={(e) => handleFilterChange('regiao', e.target.value)}
            className="filter-select"
          >
            {regioes.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="estado-filter">Estado</label>
          <select
            id="estado-filter"
            value={filters.estado}
            onChange={(e) => handleFilterChange('estado', e.target.value)}
            className="filter-select"
          >
            {estados.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="tema-filter">Tema</label>
          <select
            id="tema-filter"
            value={filters.tema}
            onChange={(e) => handleFilterChange('tema', e.target.value)}
            className="filter-select"
          >
            <option value="">Todos os temas</option>
            <option value="populacao">População</option>
            <option value="educacao">Educação</option>
            <option value="economia">Economia</option>
            <option value="saude">Saúde</option>
            <option value="trabalho">Trabalho</option>
          </select>
        </div>
      </div>

      {/* Rodapé da sidebar */}
      <div className="sidebar-footer">
        <p>Dados fornecidos pelo IBGE</p>
        <small>© {new Date().getFullYear()} Portal de Dados</small>
      </div>
    </aside>
  );
};

export default Sidebar;
