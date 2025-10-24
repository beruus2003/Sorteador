# 🚀 Deploy no Vercel - Sorteador de Times

## Passo a Passo para Deploy

### 1. Preparação do Repositório GitHub

```bash
# Inicialize o git (se ainda não estiver inicializado)
git init

# Adicione todos os arquivos
git add .

# Faça o commit
git commit -m "Initial commit - Sorteador de Times com autenticação"

# Conecte ao repositório GitHub
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# Envie para o GitHub
git push -u origin main
```

### 2. Configuração no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Selecione seu repositório GitHub
4. Configure as variáveis de ambiente:

#### Environment Variables (Importantes!)

Adicione a seguinte variável em **Settings → Environment Variables**:

```
DATABASE_URL = postgresql://seu-usuario:sua-senha@seu-host.neon.tech/seu-banco?sslmode=require
```

> ⚠️ **IMPORTANTE**: Use seu connection string real do Neon PostgreSQL que você já tem configurado!

### 3. Configurações do Deploy

O Vercel detectará automaticamente as configurações pelo `vercel.json`:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Deploy

Clique em **"Deploy"** e aguarde!

O Vercel vai:
1. Instalar as dependências
2. Construir o frontend (Vite)
3. Configurar as serverless functions (API routes)
4. Disponibilizar sua aplicação

### 5. Teste sua Aplicação

Após o deploy, teste:

1. ✅ Acesse a URL fornecida pelo Vercel
2. ✅ Acesse `/api` para verificar se a API está respondendo
3. ✅ Clique no botão "Login" no canto superior direito
4. ✅ Faça login com: `rodriguesjair000@gmail.com`
5. ✅ Teste adicionar, marcar ausente (X) e deletar (🗑️) jogadores
6. ✅ Teste sortear times e copiar resultado (sem estrelas)

### 6. URL Personalizada (Opcional)

No dashboard do Vercel:
1. Vá em **Settings → Domains**
2. Adicione seu domínio personalizado

## 📋 Estrutura do Projeto

```
/
├── api/                    # Serverless Functions (Backend)
│   ├── db.js              # Conexão com PostgreSQL
│   ├── index.js           # Rota teste
│   ├── login.js           # Autenticação
│   ├── players/
│   │   ├── [userId].js    # GET jogadores do usuário
│   │   ├── index.js       # POST criar jogador
│   │   └── update/
│   │       └── [id].js    # PATCH/DELETE jogador
│   └── _debug/
│       └── db.js          # Debug do banco (remover em produção)
│
├── src/                    # Frontend React
│   ├── App.jsx
│   ├── SorteadorDeTimes.jsx
│   └── SorteadorDeTimes.css
│
├── vercel.json            # Configuração do Vercel
└── package.json

```

## 🔐 Segurança

- ✅ A `DATABASE_URL` está em variáveis de ambiente (não no código)
- ✅ Senhas são verificadas com bcrypt
- ✅ SSL habilitado na conexão com o banco

## 🐛 Troubleshooting

### Erro de conexão com banco

Verifique se:
1. A `DATABASE_URL` está configurada corretamente no Vercel
2. O banco Neon está ativo e acessível
3. As tabelas `users` e `players` existem no banco

### API não funciona

1. Acesse `/api` na sua URL para testar se a API está respondendo
2. Verifique os logs no dashboard do Vercel
3. Confirme que a DATABASE_URL e SESSION_SECRET estão configuradas

### Frontend não carrega jogadores

1. Verifique se você está logado
2. Abra o Console do navegador (F12) para ver erros
3. Verifique se a `DATABASE_URL` está configurada

## 📞 Suporte

Em caso de problemas, verifique:
- Logs no Dashboard do Vercel
- Console do navegador (F12)
- Connection string do Neon está correto

---

✨ **Pronto! Seu sorteador está no ar!** ✨
