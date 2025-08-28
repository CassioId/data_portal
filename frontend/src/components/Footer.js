import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaGithub, 
  FaEnvelope, 
  FaExternalLinkAlt, 
  FaInfoCircle, 
  FaLock, 
  FaQuestionCircle,
  FaDatabase,
  FaChartBar,
  FaFileAlt
} from 'react-icons/fa';
import './Footer.css';

/**
 * Componente de rodapé para a aplicação
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        {/* Seção principal com colunas */}
        <div className="footer-content">
          {/* Coluna: Sobre */}
          <div className="footer-column">
            <h4 className="footer-heading">Sobre o Portal</h4>
            <ul className="footer-links">
              <li className="footer-link-item">
                <Link to="/sobre" className="footer-link">
                  <FaInfoCircle className="footer-icon" />
                  Sobre o projeto
                </Link>
              </li>
              <li className="footer-link-item">
                <Link to="/termos" className="footer-link">
                  <FaLock className="footer-icon" />
                  Termos de uso
                </Link>
              </li>
              <li className="footer-link-item">
                <Link to="/faq" className="footer-link">
                  <FaQuestionCircle className="footer-icon" />
                  Perguntas frequentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna: Recursos */}
          <div className="footer-column">
            <h4 className="footer-heading">Recursos</h4>
            <ul className="footer-links">
              <li className="footer-link-item">
                <Link to="/busca" className="footer-link">
                  <FaDatabase className="footer-icon" />
                  Busca Avançada
                </Link>
              </li>
              <li className="footer-link-item">
                <Link to="/relatorios" className="footer-link">
                  <FaChartBar className="footer-icon" />
                  Relatórios
                </Link>
              </li>
              <li className="footer-link-item">
                <Link to="/api-docs" className="footer-link">
                  <FaFileAlt className="footer-icon" />
                  Documentação da API
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna: Links IBGE */}
          <div className="footer-column">
            <h4 className="footer-heading">Links IBGE</h4>
            <ul className="footer-links">
              <li className="footer-link-item">
                <a 
                  href="https://www.ibge.gov.br/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  Site oficial do IBGE
                  <FaExternalLinkAlt className="external-icon" />
                </a>
              </li>
              <li className="footer-link-item">
                <a 
                  href="https://servicodados.ibge.gov.br/api/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  Documentação das APIs
                  <FaExternalLinkAlt className="external-icon" />
                </a>
              </li>
              <li className="footer-link-item">
                <a 
                  href="https://biblioteca.ibge.gov.br/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  Biblioteca IBGE
                  <FaExternalLinkAlt className="external-icon" />
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna: Contato */}
          <div className="footer-column">
            <h4 className="footer-heading">Contato</h4>
            <ul className="footer-links">
              <li className="footer-link-item">
                <a 
                  href="mailto:contato@portaldadosibge.com.br" 
                  className="footer-link"
                >
                  <FaEnvelope className="footer-icon" />
                  contato@portaldadosibge.com.br
                </a>
              </li>
              <li className="footer-link-item">
                <a 
                  href="https://github.com/seu-usuario/portal-dados-ibge" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  <FaGithub className="footer-icon" />
                  GitHub do projeto
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Seção de separação */}
        <div className="footer-divider"></div>
        
        {/* Seção inferior com créditos e logo */}
        <div className="footer-bottom">
          <div className="footer-logo">
            <img 
              src="/logo-ibge-small.png" 
              alt="IBGE Logo" 
              className="footer-logo-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://servicodados.ibge.gov.br/images/logo_ibge.png';
                e.target.style.maxWidth = '60px';
              }}
            />
          </div>
          
          <div className="footer-credits">
            <p className="footer-paragraph">
              Portal de Dados IBGE - Uma interface para consulta e visualização dos dados do IBGE
            </p>
            <p className="copyright">
              © {currentYear} Portal de Dados IBGE. Os dados disponíveis neste portal são de propriedade do 
              <a 
                href="https://www.ibge.gov.br/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="copyright-link"
              > Instituto Brasileiro de Geografia e Estatística</a>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
