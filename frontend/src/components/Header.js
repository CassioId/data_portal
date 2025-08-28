import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSearch, FaBars, FaTimes, FaChartBar, FaDatabase, FaInfoCircle } from 'react-icons/fa';
import './Header.css';

/**
 * Componente de cabeçalho para a aplicação
 */
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Verifica se a rota atual corresponde ao link
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Alterna o menu móvel
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Logo e título */}
        <div className="logo-container">
          <Link to="/" className="logo-link">
            <FaDatabase size={24} style={{ marginRight: '10px' }} />
            <h1 style={{ fontSize: '20px', margin: 0 }}>Portal de Dados IBGE</h1>
          </Link>
        </div>

        {/* Menu de navegação principal */}
        <nav className="main-nav">
          <ul className="nav-menu">
            <li>
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                <FaChartBar style={{ marginRight: '5px' }} />
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/populacao" className={`nav-link ${isActive('/populacao') ? 'active' : ''}`}>
                População
              </Link>
            </li>
            <li>
              <Link to="/economia" className={`nav-link ${isActive('/economia') ? 'active' : ''}`}>
                Economia
              </Link>
            </li>
            <li>
              <Link to="/sobre" className={`nav-link ${isActive('/sobre') ? 'active' : ''}`}>
                <FaInfoCircle style={{ marginRight: '5px' }} />
                Sobre
              </Link>
            </li>
          </ul>
        </nav>

        {/* Barra de pesquisa */}
        <div className="search-container">
          <div className="search-box">
            <input type="text" placeholder="Buscar..." />
            <FaSearch className="search-icon" />
          </div>
        </div>

        {/* Botão do menu móvel */}
        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Menu móvel */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <nav>
          <ul>
            <li>
              <Link to="/" onClick={toggleMobileMenu}>Dashboard</Link>
            </li>
            <li>
              <Link to="/populacao" onClick={toggleMobileMenu}>População</Link>
            </li>
            <li>
              <Link to="/economia" onClick={toggleMobileMenu}>Economia</Link>
            </li>
            <li>
              <Link to="/sobre" onClick={toggleMobileMenu}>Sobre</Link>
            </li>
          </ul>
        </nav>

        <div className="mobile-search">
          <input type="text" placeholder="Buscar..." />
          <FaSearch className="search-icon" />
        </div>
      </div>
    </header>
  );
};

export default Header;