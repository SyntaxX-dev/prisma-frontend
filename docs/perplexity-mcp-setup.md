# Configuração do Perplexity MCP no Cursor

Este guia explica como configurar o servidor MCP do Perplexity no Cursor para habilitar busca na web e capacidades de pesquisa avançada.

## Pré-requisitos

1. Uma conta no [Perplexity API Platform](https://www.perplexity.ai/)
2. Uma chave de API do Perplexity

## Passo 1: Obter a Chave de API

1. Acesse o [Portal da API do Perplexity](https://www.perplexity.ai/settings/api)
2. Crie ou copie sua chave de API
3. Guarde esta chave em local seguro

## Passo 2: Configurar a Variável de Ambiente

### Windows (PowerShell)

```powershell
# Definir para a sessão atual
$env:PERPLEXITY_API_KEY = "sua_chave_aqui"

# Definir permanentemente (requer reiniciar o terminal)
[System.Environment]::SetEnvironmentVariable("PERPLEXITY_API_KEY", "sua_chave_aqui", "User")
```

### Windows (CMD)

```cmd
setx PERPLEXITY_API_KEY "sua_chave_aqui"
```

### Linux/macOS

```bash
# Adicionar ao ~/.bashrc ou ~/.zshrc
export PERPLEXITY_API_KEY="sua_chave_aqui"
```

## Passo 3: Configurar o Cursor

O arquivo `mcp.json` já foi criado na raiz do projeto. Você precisa:

1. **Editar o arquivo `mcp.json`** e substituir `"your_key_here"` pela sua chave de API:

```json
{
  "mcpServers": {
    "perplexity": {
      "command": "npx",
      "args": ["-y", "@perplexity-ai/mcp-server"],
      "env": {
        "PERPLEXITY_API_KEY": "sua_chave_real_aqui",
        "PERPLEXITY_TIMEOUT_MS": "600000"
      }
    }
  }
}
```

**OU** (recomendado para segurança) usar a variável de ambiente do sistema:

```json
{
  "mcpServers": {
    "perplexity": {
      "command": "npx",
      "args": ["-y", "@perplexity-ai/mcp-server"],
      "env": {
        "PERPLEXITY_API_KEY": "${PERPLEXITY_API_KEY}",
        "PERPLEXITY_TIMEOUT_MS": "600000"
      }
    }
  }
}
```

2. **Reiniciar o Cursor** para que as mudanças tenham efeito

## Passo 4: Verificar a Instalação

Após reiniciar o Cursor, você pode verificar se o servidor MCP está funcionando:

1. Abra o painel de comandos (Ctrl+Shift+P)
2. Procure por "MCP" ou "Model Context Protocol"
3. Você deve ver o servidor Perplexity listado

## Ferramentas Disponíveis

Uma vez configurado, você terá acesso às seguintes ferramentas:

### **perplexity_search**
Busca direta na web usando a API de busca do Perplexity. Retorna resultados ranqueados com metadados.

### **perplexity_ask**
IA conversacional com busca na web em tempo real usando o modelo `sonar-pro`. Ideal para perguntas rápidas.

### **perplexity_research**
Pesquisa profunda e abrangente usando o modelo `sonar-deep-research`. Ideal para análises detalhadas.

### **perplexity_reason**
Raciocínio avançado e resolução de problemas usando o modelo `sonar-reasoning-pro`. Perfeito para tarefas analíticas complexas.

## Configuração de Proxy (Opcional)

Se você estiver em uma rede corporativa com proxy, configure:

```json
{
  "mcpServers": {
    "perplexity": {
      "command": "npx",
      "args": ["-y", "@perplexity-ai/mcp-server"],
      "env": {
        "PERPLEXITY_API_KEY": "sua_chave_aqui",
        "PERPLEXITY_TIMEOUT_MS": "600000",
        "PERPLEXITY_PROXY": "https://seu-proxy:8080"
      }
    }
  }
}
```

## Solução de Problemas

### Erro: "API Key Issues"
- Verifique se a chave está correta no `mcp.json` ou na variável de ambiente
- Certifique-se de que reiniciou o Cursor após configurar

### Erro: "Connection Errors"
- Verifique sua conexão com a internet
- Valide se a chave de API está ativa no portal do Perplexity

### Erro: "Tool Not Found"
- Certifique-se de que o `npx` está instalado e acessível
- Verifique se o caminho do comando está correto no `mcp.json`

### Erro: "Timeout Errors"
- Aumente o valor de `PERPLEXITY_TIMEOUT_MS` (padrão: 600000ms = 10 minutos)

## Referências

- [Documentação Oficial do Perplexity MCP](https://github.com/perplexityai/modelcontextprotocol)
- [Guia do MCP Server](https://docs.perplexity.ai/guides/mcp-server)
- [Portal da API do Perplexity](https://www.perplexity.ai/settings/api)

