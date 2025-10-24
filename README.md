# ⚽ Sorteador Inteligente de Pelada

Sistema de gerenciamento e sorteio balanceado de times de futebol com autenticação e persistência de dados.

## 🚀 Funcionalidades

- ✅ Sistema de login seguro com JWT
- ✅ Cadastro e gerenciamento de jogadores
- ✅ Sistema de níveis (1-5 estrelas) para balanceamento
- ✅ Sorteio inteligente usando o Algoritmo da Serpente
- ✅ Marcar jogadores como ausentes
- ✅ Deletar jogadores permanentemente
- ✅ Copiar resultado do sorteio (sem estrelas no texto)
- ✅ Modo offline (localStorage) para usuários não autenticados
- ✅ Sincronização com banco PostgreSQL (Neon)

## 🛠️ Tecnologias

**Frontend:**
- React + Vite
- CSS puro com gradientes
- Fetch API

**Backend:**
- Vercel Serverless Functions
- PostgreSQL (Neon)
- JWT para autenticação
- bcryptjs para senhas

## 📦 Instalação Local

```bash
# Clone o repositório
git clone [seu-repositorio]

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🔐 Variáveis de Ambiente

```env
DATABASE_URL=postgresql://...  # Neon PostgreSQL
SESSION_SECRET=...             # String aleatória para JWT
VITE_API_URL=/api              # URL da API (opcional)
```

## 📊 Estrutura do Banco de Dados

### Tabela `users`
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);
```

### Tabela `players`
```sql
CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  level INTEGER DEFAULT 3,
  present BOOLEAN DEFAULT true
);
```

## 🚢 Deploy no Vercel

Veja [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) para instruções detalhadas de deploy.

### Resumo rápido:

1. Conecte seu repositório GitHub ao Vercel
2. Configure a variável `DATABASE_URL` no Vercel
3. Configure a variável `SESSION_SECRET` no Vercel
4. Deploy automático!

## 📖 Como Usar

### Modo Offline (Sem Login)
- Adicione jogadores normalmente
- Sorteie times
- Dados salvos no localStorage do navegador

### Modo Online (Com Login)
1. Clique em "Login" no canto superior direito
2. Faça login com seu email/senha
3. Jogadores são carregados do banco de dados
4. Adicione, marque ausentes ou delete jogadores
5. Dados sincronizados com o PostgreSQL

### Sorteio de Times
1. Defina quantos jogadores por time
2. Nomeie os times (opcional)
3. Clique em "Sortear Times"
4. Copie o resultado com o botão 📋

## 🔒 Segurança

- ✅ Autenticação JWT com tokens de 7 dias
- ✅ Senhas criptografadas com bcrypt
- ✅ Verificação de ownership em todas as operações
- ✅ Proteção contra escalação de privilégios
- ✅ Logout automático em caso de token expirado
- ✅ Conexão SSL com banco de dados

## 🎨 Visual

O design mantém o visual original do projeto com:
- Gradientes roxos modernos
- Sistema de estrelas para níveis
- Animações suaves
- Responsivo para mobile

## 📝 API Routes

- `GET /api` - Health check
- `POST /api/login` - Autenticação (retorna JWT)
- `GET /api/players/:userId` - Listar jogadores (requer autenticação)
- `POST /api/players` - Criar jogador (requer autenticação)
- `PATCH /api/players/update/:id` - Marcar ausente (requer autenticação)
- `DELETE /api/players/update/:id` - Deletar jogador (requer autenticação)

## 🤝 Contribuindo

Este é um projeto pessoal, mas sugestões são bem-vindas!

## 📄 Licença

ISC

---

Desenvolvido com ⚽ para organizar peladas de forma justa e eficiente!
