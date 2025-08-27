   import React from 'react';
   import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
   import Header from './components/Header';
   import Sidebar from './components/Sidebar';
   import Footer from './components/Footer';
   import Dashboard from './pages/Dashboard';
   import BuscaAvancada from './pages/BuscaAvancada';
   import Relatorios from './pages/Relatorios';
   import './styles/global.css';

   function App() {
     return (
       <Router>
         <div className="app-container">
           <Header />
           <div className="main-content">
             <Sidebar />
             <div className="page-content">
               <Routes>
                 <Route path="/" element={<Dashboard />} />
                 <Route path="/busca" element={<BuscaAvancada />} />
                 <Route path="/relatorios" element={<Relatorios />} />
               </Routes>
             </div>
           </div>
           <Footer />
         </div>
       </Router>
     );
   }

   export default App;
