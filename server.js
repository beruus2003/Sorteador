import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';

// Importar as funções da API
import loginHandler from './api/login.js';
import indexHandler from './api/index.js';
import playersHandler from './api/players/index.js';
import playersUserIdHandler from './api/players/[userId].js';
import playersUpdateHandler from './api/players/update/[id].js';

async function createServer() {
  const app = express();
  
  // Middlewares
  app.use(cors());
  app.use(express.json());

  // Rotas da API
  app.get('/api', indexHandler);
  app.post('/api/login', loginHandler);
  app.post('/api/players', playersHandler);
  app.get('/api/players/:userId', (req, res) => playersUserIdHandler(req, res));
  app.patch('/api/players/update/:id', (req, res) => playersUpdateHandler(req, res));
  app.delete('/api/players/update/:id', (req, res) => playersUpdateHandler(req, res));

  // Criar servidor Vite
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      host: '0.0.0.0',
      port: 5000
    },
    appType: 'spa',
  });

  // Usar o middleware do Vite
  app.use(vite.middlewares);

  const port = 5000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
    console.log(`✅ APIs disponíveis em http://localhost:${port}/api`);
  });
}

createServer().catch(err => {
  console.error('Erro ao iniciar servidor:', err);
  process.exit(1);
});
