
# 🚀 WhatsApp Multi-Cliente SaaS

Sistema completo de gerenciamento multi-instância para WhatsApp, permitindo que múltiplos clientes tenham suas próprias sessões isoladas de WhatsApp.

## 📋 Visão Geral

Este sistema permite criar e gerenciar múltiplas instâncias WhatsApp de forma completamente isolada, onde cada cliente possui:
- ✅ Sessão WhatsApp exclusiva e isolada
- ✅ QR Code único para conexão
- ✅ Interface web personalizada
- ✅ API REST completa
- ✅ Documentação Swagger integrada
- ✅ Monitoramento em tempo real

## 🏗️ Arquitetura

```
Projeto Principal (porta atual)
├── WhatsApp Multi-Cliente (porta 3010)
│   ├── API REST
│   ├── Swagger Docs
│   ├── WebSocket para tempo real
│   └── Sessões isoladas por cliente
├── Sistema de Cotação (portas originais - INTOCADO)
└── Frontend React (integração via componente)
```

## 🔧 Configuração e Instalação

### 1. Instalar Dependências

```bash
# Instalar dependências do sistema multi-cliente
npm install express socket.io cors whatsapp-web.js qrcode swagger-ui-express nodemon
```

### 2. Iniciar o Sistema

**Linux/macOS:**
```bash
# Dar permissão aos scripts
chmod +x scripts/*.sh

# Iniciar servidor
./scripts/start-whatsapp-multitenancy.sh
```

**Windows:**
```cmd
# Executar script
scripts\start-whatsapp-multitenancy.bat
```

**Manual:**
```bash
# Criar diretório de sessões
mkdir -p whatsapp-sessions

# Iniciar servidor
node server/whatsapp-multitenancy-server.js
```

### 3. Verificar Funcionamento

- **Painel Admin:** http://localhost:3010
- **API Swagger:** http://localhost:3010/api-docs
- **Logs:** `tail -f whatsapp-multitenancy.log`

## 📚 Documentação da API

### Endpoints Principais

#### 1. Listar Clientes
```http
GET /api/clients
```

#### 2. Criar Cliente
```http
POST /api/clients
Content-Type: application/json

{
  "name": "Nome do Cliente",
  "company": "Empresa (opcional)"
}
```

#### 3. Gerar QR Code
```http
GET /api/clients/{clientId}/qr
```

#### 4. Verificar Status
```http
GET /api/clients/{clientId}/status
```

#### 5. Enviar Mensagem
```http
POST /api/clients/{clientId}/send
Content-Type: application/json

{
  "to": "5511999999999",
  "message": "Olá! Mensagem de teste."
}
```

#### 6. Desconectar Cliente
```http
POST /api/clients/{clientId}/disconnect
```

### Documentação Completa
Acesse `http://localhost:3010/api-docs` para ver a documentação interativa completa.

## 🎯 Como Usar

### 1. Painel Administrativo
1. Acesse http://localhost:3010
2. Crie novos clientes
3. Monitore conexões em tempo real
4. Gerencie todas as instâncias

### 2. Interface do Cliente
1. Cada cliente recebe um link único: `/client/{clientId}`
2. Cliente acessa seu link exclusivo
3. Gera QR Code e conecta WhatsApp
4. Envia/recebe mensagens isoladamente

### 3. Integração React
```tsx
import { WhatsAppMultiClientAdmin } from '@/components/whatsapp/WhatsAppMultiClientAdmin';

// No seu componente
<WhatsAppMultiClientAdmin />
```

## 🔄 Scripts de Gerenciamento

### Iniciar Sistema
```bash
# Linux/macOS
./scripts/start-whatsapp-multitenancy.sh

# Windows
scripts\start-whatsapp-multitenancy.bat
```

### Parar Sistema
```bash
# Linux/macOS
./scripts/stop-whatsapp-multitenancy.sh

# Windows
scripts\stop-whatsapp-multitenancy.bat
```

### Reiniciar Sistema
```bash
# Linux/macOS
./scripts/restart-whatsapp-multitenancy.sh

# Windows
scripts\stop-whatsapp-multitenancy.bat
scripts\start-whatsapp-multitenancy.bat
```

### Monitorar Logs
```bash
# Ver logs em tempo real
tail -f whatsapp-multitenancy.log

# Ver últimas 50 linhas
tail -50 whatsapp-multitenancy.log
```

## 📊 Monitoramento

### Verificar Status do Servidor
```bash
# Verificar se está rodando
curl http://localhost:3010

# Verificar porta
lsof -i :3010

# Verificar processo
ps aux | grep whatsapp-multitenancy
```

### Logs do Sistema
- **Arquivo:** `whatsapp-multitenancy.log`
- **Localização:** Raiz do projeto
- **Conteúdo:** Logs de conexão, erros, mensagens

### Sessões WhatsApp
- **Diretório:** `whatsapp-sessions/`
- **Estrutura:** Uma pasta por cliente
- **Backup:** Copie esta pasta para backup das sessões

## 🚀 Recursos Avançados

### 1. WebSocket para Tempo Real
- Conexão automática de cada cliente
- Eventos em tempo real (QR, conexão, mensagens)
- Atualização automática de status

### 2. Isolamento Completo
- Cada cliente tem sessão WhatsApp separada
- Dados não se misturam entre clientes
- Sessões salvas localmente por cliente

### 3. API RESTful Completa
- CRUD completo de clientes
- Controle de conexões WhatsApp
- Envio de mensagens programático
- Documentação Swagger integrada

### 4. Interface Web Responsiva
- Painel administrativo completo
- Interface individual por cliente
- Componente React para integração

## 🔧 Configurações Avançadas

### Portas Utilizadas
- **3010:** Servidor WhatsApp Multi-Cliente
- **Outras:** Mantidas como estavam (sem conflito)

### Estrutura de Dados
```javascript
// Cliente
{
  id: "client_1703123456789_abc123",
  name: "Nome do Cliente",
  company: "Empresa",
  status: "connected|disconnected|waiting-qr|initializing",
  createdAt: "2023-12-21T10:30:00.000Z",
  lastConnection: "2023-12-21T10:35:00.000Z"
}
```

### Variáveis de Ambiente (Opcionais)
```bash
PORT=3010                    # Porta do servidor
SESSIONS_DIR=./whatsapp-sessions  # Diretório das sessões
```

## 🐛 Solução de Problemas

### Problema: Porta já em uso
```bash
# Verificar o que está usando a porta
lsof -i :3010

# Parar processo anterior
pkill -f whatsapp-multitenancy-server.js

# Ou usar outro PID específico
kill -9 [PID]
```

### Problema: Dependências não instaladas
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install express socket.io cors whatsapp-web.js qrcode swagger-ui-express nodemon
```

### Problema: Sessões WhatsApp corrompidas
```bash
# Limpar sessões (CUIDADO: Vai desconectar todos)
rm -rf whatsapp-sessions/*

# Ou limpar sessão específica
rm -rf whatsapp-sessions/session-[CLIENT_ID]
```

### Problema: Não consegue conectar WhatsApp
1. Verificar se o cliente está na lista: `/api/clients`
2. Gerar novo QR Code: `/api/clients/{id}/qr`
3. Verificar logs: `tail -f whatsapp-multitenancy.log`
4. Tentar desconectar e reconectar

## 📋 Checklist de Validação

### ✅ Instalação
- [ ] Node.js instalado
- [ ] Dependências instaladas
- [ ] Diretório `whatsapp-sessions` criado
- [ ] Scripts com permissão de execução

### ✅ Funcionamento
- [ ] Servidor rodando na porta 3010
- [ ] Painel admin acessível
- [ ] Swagger docs funcionando
- [ ] Consegue criar clientes
- [ ] QR Code é gerado
- [ ] WhatsApp conecta com sucesso
- [ ] Mensagens são enviadas/recebidas

### ✅ Integração
- [ ] Componente React funciona
- [ ] API responde corretamente
- [ ] WebSocket conecta
- [ ] Logs estão sendo gerados
- [ ] Sessões são salvas

## 🔒 Segurança

### Isolamento de Dados
- Cada cliente tem sessão WhatsApp completamente isolada
- Dados não vazam entre clientes
- Sessões salvas localmente com identificação única

### Acesso
- Cada cliente recebe link único
- Não há interferência entre instâncias
- Logs individualizados por cliente

## 🚀 Próximos Passos

### Melhorias Planejadas
1. **Dashboard Analytics:** Métricas de uso por cliente
2. **Webhooks:** Notificações automáticas para eventos
3. **Backup Automático:** Backup das sessões WhatsApp
4. **Multi-Server:** Distribuição entre múltiplos servidores
5. **Database:** Persistência em banco de dados
6. **Autenticação:** Sistema de login para clientes

### Expansões Possíveis
1. **White Label:** Personalização por cliente
2. **API Keys:** Controle de acesso via chaves
3. **Rate Limiting:** Controle de uso da API
4. **Billing:** Sistema de cobrança integrado
5. **Monitoring:** Dashboards de monitoramento avançado

## 📞 Suporte

### Contatos
- **Projeto:** TZS Expert Academy WhatsApp Insights Hub
- **Versão:** 1.0.0
- **Licença:** MIT

### Logs e Diagnósticos
```bash
# Ver status completo
curl http://localhost:3010/api/clients

# Ver logs do servidor
tail -f whatsapp-multitenancy.log

# Verificar sessões ativas
ls -la whatsapp-sessions/
```

---

## 🎯 Resumo Executivo

**O que foi implementado:**
- ✅ Sistema completo multi-cliente WhatsApp
- ✅ API REST com documentação Swagger
- ✅ Painel administrativo web
- ✅ Isolamento total entre clientes
- ✅ Interface individual por cliente
- ✅ Scripts de automação
- ✅ Componente React para integração

**Portas utilizadas:**
- ✅ 3010: WhatsApp Multi-Cliente (NOVA)
- ✅ Outras portas: Mantidas intocadas

**Como testar:**
1. Execute `./scripts/start-whatsapp-multitenancy.sh`
2. Acesse http://localhost:3010
3. Crie um cliente de teste
4. Gere QR Code e conecte WhatsApp
5. Teste envio de mensagens

**Resultado:** Sistema SaaS completo e funcional para WhatsApp multi-cliente! 🚀
