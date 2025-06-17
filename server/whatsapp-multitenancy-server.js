
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Configurações
const PORT = process.env.PORT || 3010;
const SESSIONS_DIR = path.join(__dirname, '..', 'whatsapp-sessions');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Garantir que o diretório de sessões existe
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// Armazenamento de clientes e instâncias
const clients = new Map(); // clientId -> { client, info, status }
const clientsInfo = new Map(); // clientId -> { name, createdAt, lastConnection }

// Swagger Documentation
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'WhatsApp Multi-Client API',
    version: '1.0.0',
    description: 'API para gerenciamento de múltiplas instâncias WhatsApp',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Servidor de Desenvolvimento'
    }
  ],
  paths: {
    '/api/clients': {
      get: {
        summary: 'Listar todos os clientes',
        responses: {
          200: {
            description: 'Lista de clientes',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      status: { type: 'string' },
                      createdAt: { type: 'string' },
                      lastConnection: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Criar novo cliente',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  company: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Cliente criado com sucesso'
          }
        }
      }
    },
    '/api/clients/{clientId}/qr': {
      get: {
        summary: 'Gerar QR Code para cliente',
        parameters: [
          {
            name: 'clientId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'QR Code gerado'
          }
        }
      }
    },
    '/api/clients/{clientId}/send': {
      post: {
        summary: 'Enviar mensagem',
        parameters: [
          {
            name: 'clientId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  to: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Função para criar cliente WhatsApp
async function createWhatsAppClient(clientId) {
  try {
    console.log(`🔄 Criando cliente WhatsApp para: ${clientId}`);
    
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: clientId,
        dataPath: SESSIONS_DIR
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    });

    // Event handlers
    client.on('qr', (qr) => {
      console.log(`📱 QR Code gerado para cliente: ${clientId}`);
      qrcode.toDataURL(qr, (err, url) => {
        if (!err) {
          io.emit(`qr-${clientId}`, { qr: url });
          if (clients.has(clientId)) {
            clients.get(clientId).status = 'waiting-qr';
          }
        }
      });
    });

    client.on('ready', () => {
      console.log(`✅ Cliente ${clientId} conectado ao WhatsApp!`);
      io.emit(`ready-${clientId}`, { message: 'Cliente conectado com sucesso!' });
      
      if (clients.has(clientId)) {
        const clientData = clients.get(clientId);
        clientData.status = 'connected';
        clientData.info.lastConnection = new Date().toISOString();
        clients.set(clientId, clientData);
      }
    });

    client.on('authenticated', () => {
      console.log(`🔐 Cliente ${clientId} autenticado`);
      if (clients.has(clientId)) {
        clients.get(clientId).status = 'authenticated';
      }
    });

    client.on('auth_failure', (msg) => {
      console.error(`❌ Falha na autenticação para ${clientId}:`, msg);
      io.emit(`auth_failure-${clientId}`, { error: msg });
      if (clients.has(clientId)) {
        clients.get(clientId).status = 'auth_failure';
      }
    });

    client.on('disconnected', (reason) => {
      console.log(`🔌 Cliente ${clientId} desconectado:`, reason);
      io.emit(`disconnected-${clientId}`, { reason });
      if (clients.has(clientId)) {
        clients.get(clientId).status = 'disconnected';
      }
    });

    client.on('message', async (message) => {
      console.log(`📨 Nova mensagem para ${clientId}:`, message.body);
      io.emit(`message-${clientId}`, {
        from: message.from,
        body: message.body,
        timestamp: message.timestamp,
        type: message.type
      });
    });

    await client.initialize();
    
    clients.set(clientId, {
      client,
      info: clientsInfo.get(clientId) || {},
      status: 'initializing'
    });

    return client;
  } catch (error) {
    console.error(`❌ Erro ao criar cliente ${clientId}:`, error);
    throw error;
  }
}

// Rotas da API

// Listar todos os clientes
app.get('/api/clients', (req, res) => {
  const clientsList = Array.from(clientsInfo.entries()).map(([id, info]) => {
    const clientData = clients.get(id);
    return {
      id,
      name: info.name,
      company: info.company,
      status: clientData ? clientData.status : 'offline',
      createdAt: info.createdAt,
      lastConnection: info.lastConnection
    };
  });
  
  res.json(clientsList);
});

// Criar novo cliente
app.post('/api/clients', (req, res) => {
  try {
    const { name, company } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Nome do cliente é obrigatório' });
    }

    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const clientInfo = {
      name,
      company: company || '',
      createdAt: new Date().toISOString(),
      lastConnection: null
    };
    
    clientsInfo.set(clientId, clientInfo);
    
    console.log(`➕ Novo cliente criado: ${clientId} - ${name}`);
    
    res.status(201).json({
      id: clientId,
      ...clientInfo,
      accessUrl: `/client/${clientId}`
    });
  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Gerar QR Code para cliente
app.get('/api/clients/:clientId/qr', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    if (!clientsInfo.has(clientId)) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    let client;
    if (clients.has(clientId)) {
      client = clients.get(clientId).client;
    } else {
      client = await createWhatsAppClient(clientId);
    }
    
    res.json({ 
      message: 'QR Code será enviado via WebSocket',
      clientId,
      status: clients.get(clientId)?.status || 'initializing'
    });
  } catch (error) {
    console.error(`❌ Erro ao gerar QR para ${req.params.clientId}:`, error);
    res.status(500).json({ error: 'Erro ao gerar QR Code' });
  }
});

// Verificar status do cliente
app.get('/api/clients/:clientId/status', (req, res) => {
  const { clientId } = req.params;
  
  if (!clientsInfo.has(clientId)) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  const clientData = clients.get(clientId);
  const clientInfo = clientsInfo.get(clientId);
  
  res.json({
    id: clientId,
    name: clientInfo.name,
    company: clientInfo.company,
    status: clientData ? clientData.status : 'offline',
    connected: clientData ? clientData.status === 'connected' : false,
    lastConnection: clientInfo.lastConnection
  });
});

// Enviar mensagem
app.post('/api/clients/:clientId/send', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { to, message } = req.body;
    
    if (!clients.has(clientId)) {
      return res.status(404).json({ error: 'Cliente não encontrado ou não conectado' });
    }

    const clientData = clients.get(clientId);
    if (clientData.status !== 'connected') {
      return res.status(400).json({ error: 'Cliente não está conectado' });
    }

    const chatId = to.includes('@') ? to : `${to}@c.us`;
    await clientData.client.sendMessage(chatId, message);
    
    console.log(`📤 Mensagem enviada por ${clientId} para ${to}: ${message}`);
    
    res.json({ 
      success: true, 
      message: 'Mensagem enviada com sucesso',
      to: chatId
    });
  } catch (error) {
    console.error(`❌ Erro ao enviar mensagem para ${req.params.clientId}:`, error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Desconectar cliente
app.post('/api/clients/:clientId/disconnect', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    if (!clients.has(clientId)) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const clientData = clients.get(clientId);
    await clientData.client.destroy();
    clients.delete(clientId);
    
    console.log(`🔌 Cliente ${clientId} desconectado manualmente`);
    
    res.json({ message: 'Cliente desconectado com sucesso' });
  } catch (error) {
    console.error(`❌ Erro ao desconectar ${req.params.clientId}:`, error);
    res.status(500).json({ error: 'Erro ao desconectar cliente' });
  }
});

// Rota para servir a interface do cliente
app.get('/client/:clientId', (req, res) => {
  const { clientId } = req.params;
  
  if (!clientsInfo.has(clientId)) {
    return res.status(404).send('<h1>Cliente não encontrado</h1>');
  }
  
  const clientInfo = clientsInfo.get(clientId);
  
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WhatsApp - ${clientInfo.name}</title>
      <script src="https://cdn.socket.io/4.0.0/socket.io.min.js"></script>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .connected { background-color: #d4edda; color: #155724; }
        .disconnected { background-color: #f8d7da; color: #721c24; }
        .waiting { background-color: #fff3cd; color: #856404; }
        button { padding: 10px 20px; margin: 5px; border: none; border-radius: 5px; cursor: pointer; }
        .btn-primary { background-color: #007bff; color: white; }
        .btn-success { background-color: #28a745; color: white; }
        .btn-danger { background-color: #dc3545; color: white; }
        #qrCode { text-align: center; margin: 20px 0; }
        #qrCode img { max-width: 300px; border: 2px solid #ddd; border-radius: 10px; }
        .message-form { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        input, textarea { width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 3px; }
      </style>
    </head>
    <body>
      <h1>WhatsApp Multi-Cliente</h1>
      <h2>Cliente: ${clientInfo.name}</h2>
      <p><strong>ID:</strong> ${clientId}</p>
      <p><strong>Empresa:</strong> ${clientInfo.company}</p>
      
      <div id="status" class="status disconnected">
        Status: Desconectado
      </div>
      
      <div>
        <button onclick="generateQR()" class="btn-primary">Gerar QR Code</button>
        <button onclick="checkStatus()" class="btn-success">Verificar Status</button>
        <button onclick="disconnect()" class="btn-danger">Desconectar</button>
      </div>
      
      <div id="qrCode"></div>
      
      <div class="message-form" id="messageForm" style="display: none;">
        <h3>Enviar Mensagem</h3>
        <input type="text" id="phoneNumber" placeholder="Número do telefone (ex: 5511999999999)" />
        <textarea id="messageText" placeholder="Digite sua mensagem..." rows="3"></textarea>
        <button onclick="sendMessage()" class="btn-success">Enviar Mensagem</button>
      </div>
      
      <div id="messages">
        <h3>Mensagens Recebidas</h3>
        <div id="messagesList"></div>
      </div>

      <script>
        const socket = io();
        const clientId = '${clientId}';
        
        // Listeners para eventos do WhatsApp
        socket.on('qr-' + clientId, (data) => {
          document.getElementById('qrCode').innerHTML = '<h3>Escaneie o QR Code:</h3><img src="' + data.qr + '" alt="QR Code" />';
          updateStatus('Aguardando QR Code', 'waiting');
        });
        
        socket.on('ready-' + clientId, (data) => {
          document.getElementById('qrCode').innerHTML = '<div class="connected"><h3>✅ Conectado com sucesso!</h3></div>';
          updateStatus('Conectado', 'connected');
          document.getElementById('messageForm').style.display = 'block';
        });
        
        socket.on('auth_failure-' + clientId, (data) => {
          updateStatus('Falha na autenticação', 'disconnected');
          alert('Falha na autenticação: ' + data.error);
        });
        
        socket.on('disconnected-' + clientId, (data) => {
          updateStatus('Desconectado', 'disconnected');
          document.getElementById('messageForm').style.display = 'none';
        });
        
        socket.on('message-' + clientId, (data) => {
          addMessage(data);
        });
        
        function updateStatus(text, type) {
          const statusDiv = document.getElementById('status');
          statusDiv.textContent = 'Status: ' + text;
          statusDiv.className = 'status ' + type;
        }
        
        function generateQR() {
          fetch('/api/clients/' + clientId + '/qr')
            .then(response => response.json())
            .then(data => {
              console.log('QR Code solicitado:', data);
            })
            .catch(error => {
              console.error('Erro ao gerar QR:', error);
              alert('Erro ao gerar QR Code');
            });
        }
        
        function checkStatus() {
          fetch('/api/clients/' + clientId + '/status')
            .then(response => response.json())
            .then(data => {
              updateStatus(data.connected ? 'Conectado' : 'Desconectado', data.connected ? 'connected' : 'disconnected');
              if (data.connected) {
                document.getElementById('messageForm').style.display = 'block';
              }
            })
            .catch(error => {
              console.error('Erro ao verificar status:', error);
            });
        }
        
        function disconnect() {
          if (confirm('Tem certeza que deseja desconectar?')) {
            fetch('/api/clients/' + clientId + '/disconnect', { method: 'POST' })
              .then(response => response.json())
              .then(data => {
                alert('Desconectado com sucesso');
                updateStatus('Desconectado', 'disconnected');
                document.getElementById('messageForm').style.display = 'none';
              })
              .catch(error => {
                console.error('Erro ao desconectar:', error);
              });
          }
        }
        
        function sendMessage() {
          const phone = document.getElementById('phoneNumber').value;
          const message = document.getElementById('messageText').value;
          
          if (!phone || !message) {
            alert('Preencha o telefone e a mensagem');
            return;
          }
          
          fetch('/api/clients/' + clientId + '/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: phone, message: message })
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              alert('Mensagem enviada com sucesso!');
              document.getElementById('messageText').value = '';
            } else {
              alert('Erro ao enviar mensagem: ' + data.error);
            }
          })
          .catch(error => {
            console.error('Erro ao enviar mensagem:', error);
            alert('Erro ao enviar mensagem');
          });
        }
        
        function addMessage(data) {
          const messagesList = document.getElementById('messagesList');
          const messageDiv = document.createElement('div');
          messageDiv.style.cssText = 'border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 5px; background-color: #f8f9fa;';
          messageDiv.innerHTML = '<strong>De:</strong> ' + data.from + '<br><strong>Mensagem:</strong> ' + data.body + '<br><small>' + new Date(data.timestamp * 1000).toLocaleString() + '</small>';
          messagesList.appendChild(messageDiv);
        }
        
        // Verificar status inicial
        checkStatus();
      </script>
    </body>
    </html>
  `);
});

// Página inicial com lista de clientes
app.get('/', (req, res) => {
  const clientsList = Array.from(clientsInfo.entries()).map(([id, info]) => {
    const clientData = clients.get(id);
    const status = clientData ? clientData.status : 'offline';
    const statusColor = status === 'connected' ? 'green' : status === 'waiting-qr' ? 'orange' : 'red';
    
    return `
      <tr>
        <td>${info.name}</td>
        <td>${info.company}</td>
        <td><span style="color: ${statusColor}">●</span> ${status}</td>
        <td>${info.createdAt ? new Date(info.createdAt).toLocaleString() : '-'}</td>
        <td>
          <a href="/client/${id}" target="_blank" style="color: #007bff; text-decoration: none;">Acessar</a>
        </td>
      </tr>
    `;
  }).join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WhatsApp Multi-Cliente - Painel Admin</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        button { padding: 10px 20px; margin: 5px; border: none; border-radius: 5px; cursor: pointer; background-color: #007bff; color: white; }
        .form-group { margin: 10px 0; }
        input { padding: 8px; margin: 5px; border: 1px solid #ddd; border-radius: 3px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .api-link { color: #28a745; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚀 WhatsApp Multi-Cliente SaaS</h1>
        <div>
          <a href="/api-docs" target="_blank" class="api-link">📚 API Swagger</a>
        </div>
      </div>
      
      <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3>✅ Sistema Funcionando</h3>
        <p><strong>Servidor:</strong> http://localhost:${PORT}</p>
        <p><strong>API Swagger:</strong> <a href="/api-docs" target="_blank">http://localhost:${PORT}/api-docs</a></p>
        <p><strong>Total de Clientes:</strong> ${clientsInfo.size}</p>
      </div>
      
      <h2>Criar Novo Cliente</h2>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
        <div class="form-group">
          <input type="text" id="clientName" placeholder="Nome do Cliente" style="width: 200px;" />
          <input type="text" id="clientCompany" placeholder="Empresa (opcional)" style="width: 200px;" />
          <button onclick="createClient()">Criar Cliente</button>
        </div>
      </div>
      
      <h2>Clientes Cadastrados</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Empresa</th>
            <th>Status</th>
            <th>Criado em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${clientsList || '<tr><td colspan="5" style="text-align: center; color: #666;">Nenhum cliente cadastrado</td></tr>'}
        </tbody>
      </table>
      
      <script>
        function createClient() {
          const name = document.getElementById('clientName').value;
          const company = document.getElementById('clientCompany').value;
          
          if (!name) {
            alert('Nome do cliente é obrigatório');
            return;
          }
          
          fetch('/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, company })
          })
          .then(response => response.json())
          .then(data => {
            alert('Cliente criado com sucesso!\\nID: ' + data.id + '\\nAcesso: ' + window.location.origin + data.accessUrl);
            location.reload();
          })
          .catch(error => {
            console.error('Erro ao criar cliente:', error);
            alert('Erro ao criar cliente');
          });
        }
        
        // Auto-refresh a cada 30 segundos
        setInterval(() => {
          location.reload();
        }, 30000);
      </script>
    </body>
    </html>
  `);
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('📡 Nova conexão WebSocket:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('📡 Conexão WebSocket desconectada:', socket.id);
  });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 WhatsApp Multi-Cliente Server rodando na porta ${PORT}`);
  console.log(`📚 API Swagger: http://localhost:${PORT}/api-docs`);
  console.log(`🌐 Painel Admin: http://localhost:${PORT}`);
  console.log(`📁 Sessões salvas em: ${SESSIONS_DIR}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Encerrando servidor...');
  
  // Desconectar todos os clientes
  for (const [clientId, clientData] of clients.entries()) {
    try {
      await clientData.client.destroy();
      console.log(`🔌 Cliente ${clientId} desconectado`);
    } catch (error) {
      console.error(`❌ Erro ao desconectar ${clientId}:`, error);
    }
  }
  
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});
