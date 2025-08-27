   const express = require('express');
   const cors = require('cors');
   const helmet = require('helmet');
   const morgan = require('morgan');
   const path = require('path');
   require('dotenv').config();

   // Importar rotas
   const localidadesRoutes = require('./routes/localidadesRoutes');
   const agregadosRoutes = require('./routes/agregadosRoutes');
   const relatoriosRoutes = require('./routes/relatoriosRoutes');

   const app = express();
   const PORT = process.env.PORT || 5000;

   // Middleware
   app.use(cors());
   app.use(helmet());
   app.use(express.json());
   app.use(morgan('dev'));

   // Rotas API
   app.use('/api/localidades', localidadesRoutes);
   app.use('/api/agregados', agregadosRoutes);
   app.use('/api/relatorios', relatoriosRoutes);

   // Preparar para produção
   if (process.env.NODE_ENV === 'production') {
     app.use(express.static(path.join(__dirname, '../frontend/build')));
     app.get('*', (req, res) => {
       res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
     });
   }

   // Middleware de erro
   app.use((err, req, res, next) => {
     console.error(err.stack);
     res.status(500).json({ 
       error: 'Erro no servidor',
       message: process.env.NODE_ENV === 'production' ? 'Algo deu errado' : err.message 
     });
   });

   app.listen(PORT, () => {
     console.log(`Servidor rodando na porta ${PORT}`);
   });
