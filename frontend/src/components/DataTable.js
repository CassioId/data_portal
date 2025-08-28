import React, { useState } from 'react';
import { FaSearch, FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './DataTable.css';

/**
 * Componente de tabela de dados com funcionalidades de ordenação, pesquisa e paginação
 */
const DataTable = ({ 
  data = [], 
  columns = [], 
  loading = false,
  pagination = false,
  itemsPerPage = 10,
  searchable = true
}) => {
  // Estados para controle da tabela
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Filtra os dados com base no termo de pesquisa
  const filteredData = searchTerm && data.length > 0 
    ? data.filter(item => 
        Object.keys(item).some(key => 
          String(item[key]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  // Ordena os dados com base na configuração de ordenação
  const sortedData = sortConfig.key 
    ? [...filteredData].sort((a, b) => {
        const valueA = a[sortConfig.key];
        const valueB = b[sortConfig.key];
        
        if (valueA < valueB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      })
    : filteredData;

  // Calcula os dados a serem exibidos na página atual
  const currentData = pagination 
    ? sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : sortedData;

  // Calcula o número total de páginas
  const totalPages = pagination ? Math.ceil(sortedData.length / itemsPerPage) : 1;

  // Manipuladores de eventos
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Volta para a primeira página quando pesquisa
  };

  // Renderiza um estado de carregamento
  if (loading) {
    return (
      <div className="data-table-container">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Carregando dados...
        </div>
      </div>
    );
  }

  // Renderiza uma mensagem se não há dados
  if (!data || data.length === 0) {
    return (
      <div className="data-table-container">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Nenhum dado disponível
        </div>
      </div>
    );
  }

  // Renderiza o ícone de ordenação apropriado
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort style={{ marginLeft: '5px', opacity: 0.3 }} />;
    }
    return sortConfig.direction === 'ascending' 
      ? <FaSortUp style={{ marginLeft: '5px' }} />
      : <FaSortDown style={{ marginLeft: '5px' }} />;
  };

  // Função para renderizar o conteúdo da célula
  const renderCellContent = (row, column, rowIndex, data) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row, rowIndex, data);
    }
    
    const value = row[column.accessor];
    
    if (column.cell) {
      return column.cell(value, row, rowIndex);
    }
    
    return value;
  };

  return (
    <div className="data-table-container">
      {/* Barra de ferramentas com pesquisa */}
      {searchable && (
        <div className="table-toolbar">
          <div className="search-box">
            <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={handleSearch}
              style={{ 
                padding: '8px 8px 8px 35px', 
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '100%'
              }}
            />
          </div>
          <div>
            Mostrando {currentData.length} de {sortedData.length} registros
          </div>
        </div>
      )}
      
      {/* Tabela de dados */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index}
                  onClick={() => column.accessor && typeof column.accessor === 'string' ? handleSort(column.accessor) : null}
                  style={{ 
                    cursor: column.accessor && typeof column.accessor === 'string' ? 'pointer' : 'default',
                    minWidth: column.minWidth || 'auto'
                  }}
                >
                  {column.header}
                  {column.accessor && typeof column.accessor === 'string' && getSortIcon(column.accessor)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {renderCellContent(row, column, rowIndex, data)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Paginação */}
      {pagination && totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ 
              padding: '5px 10px',
              marginRight: '5px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            <FaChevronLeft />
          </button>
          
          <span style={{ margin: '0 10px' }}>
            Página {currentPage} de {totalPages}
          </span>
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ 
              padding: '5px 10px',
              marginLeft: '5px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;