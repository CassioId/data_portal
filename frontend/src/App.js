   import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importação dos componentes
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// Importação das páginas
import Dashboard from './pages/Dashboard';

// Página temporária para rotas ainda não implementadas
const TemporaryPage = ({ title }) => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>{title}</h2>
    <p>Esta página está em desenvolvimento.</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="main-content">
          <Sidebar />
          <main className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/populacao" element={<TemporaryPage title="População" />} />
              <Route path="/economia" element={<TemporaryPage title="Economia" />} />
              <Route path="/educacao" element={<TemporaryPage title="Educação" />} />
              <Route path="/saude" element={<TemporaryPage title="Saúde" />} />
              <Route path="/sobre" element={<TemporaryPage title="Sobre o Portal" />} />
              <Route path="/faq" element={<TemporaryPage title="Perguntas Frequentes" />} />
              <Route path="/termos" element={<TemporaryPage title="Termos de Uso" />} />
              <Route path="/api-docs" element={<TemporaryPage title="Documentação da API" />} />
              <Route path="*" element={
                <div style={{ padding: '50px', textAlign: 'center' }}>
                  <h2>404 - Página não encontrada</h2>
                  <p>A página que você está procurando não existe.</p>
                </div>
              } />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;