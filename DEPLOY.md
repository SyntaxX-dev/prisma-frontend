# 🚀 Guia de Deploy na Vercel

## 📋 Pré-requisitos

1. **Conta na Vercel** - [vercel.com](https://vercel.com)
2. **Projeto no GitHub/GitLab/Bitbucket**
3. **CLI da Vercel** (opcional)

## 🔧 Configuração

### 1. Variáveis de Ambiente

Configure as seguintes variáveis no painel da Vercel:

```bash
# API Backend
NEXT_PUBLIC_API_URL=https://seu-backend.com

# Ambiente
NODE_ENV=production

# URL da aplicação
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

### 2. Configurações do Projeto

O arquivo `vercel.json` já está configurado com:

- ✅ Build command: `bun run build`
- ✅ Output directory: `.next`
- ✅ Framework: Next.js
- ✅ Região: São Paulo (gru1)
- ✅ Headers de segurança
- ✅ Rewrites para SPA

## 🚀 Deploy

### Opção 1: Deploy via GitHub (Recomendado)

1. **Conecte seu repositório** na Vercel
2. **Configure as variáveis de ambiente**
3. **Deploy automático** a cada push para `main`

### Opção 2: Deploy via CLI

```bash
# Instalar CLI da Vercel
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## 📁 Estrutura de Deploy

```
├── vercel.json          # Configuração da Vercel
├── .vercelignore        # Arquivos ignorados no deploy
├── package.json         # Dependências e scripts
├── next.config.ts       # Configuração do Next.js
└── src/                 # Código fonte
```

## 🔒 Segurança

O deploy inclui headers de segurança:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## 🌍 Regiões

- **Produção**: São Paulo (gru1) - Melhor latência para Brasil
- **Desenvolvimento**: Automático

## 📊 Monitoramento

Após o deploy, você terá acesso a:

- ✅ Analytics de performance
- ✅ Logs de erro
- ✅ Métricas de uptime
- ✅ Deploy previews

## 🐛 Troubleshooting

### Erro de Build

```bash
# Verificar logs
vercel logs

# Build local
bun run build
```

### Variáveis de Ambiente

- Verifique se `NEXT_PUBLIC_API_URL` está configurada
- Reinicie o deploy após alterar variáveis

### Performance

- Use `vercel analytics` para insights
- Configure CDN se necessário

## 📞 Suporte

- **Documentação**: [vercel.com/docs](https://vercel.com/docs)
- **Comunidade**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Status**: [vercel-status.com](https://vercel-status.com)
