
#!/bin/bash

echo "🚀 Iniciando WhatsApp Multi-Cliente SaaS..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js primeiro."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale npm primeiro."
    exit 1
fi

# Criar diretório de sessões se não existir
mkdir -p whatsapp-sessions

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install express socket.io cors whatsapp-web.js qrcode swagger-ui-express nodemon
fi

# Verificar se a porta 3010 está livre
if lsof -Pi :3010 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Porta 3010 já está em uso. Parando processo anterior..."
    pkill -f whatsapp-multitenancy-server.js
    sleep 3
fi

# Iniciar servidor
echo "🔄 Iniciando servidor na porta 3010..."
node server/whatsapp-multitenancy-server.js > whatsapp-multitenancy.log 2>&1 &

# Aguardar inicialização
sleep 5

# Verificar se o servidor está rodando
if curl -s http://localhost:3010 > /dev/null; then
    echo "✅ Servidor iniciado com sucesso!"
    echo "🌐 Painel Admin: http://localhost:3010"
    echo "📚 API Swagger: http://localhost:3010/api-docs"
    echo "📊 Para ver logs: tail -f whatsapp-multitenancy.log"
else
    echo "❌ Erro ao iniciar servidor. Verifique os logs:"
    tail -20 whatsapp-multitenancy.log
fi
