
#!/bin/bash

echo "🔄 Parando WhatsApp Multi-Cliente SaaS..."

# Parar processo do servidor
pkill -f whatsapp-multitenancy-server.js

# Aguardar finalização
sleep 3

# Verificar se parou
if ! pgrep -f whatsapp-multitenancy-server.js > /dev/null; then
    echo "✅ Servidor parado com sucesso!"
else
    echo "⚠️  Forçando parada do servidor..."
    pkill -9 -f whatsapp-multitenancy-server.js
    echo "✅ Servidor forçado a parar!"
fi

# Mostrar últimas linhas do log
echo "📊 Últimas linhas do log:"
tail -10 whatsapp-multitenancy.log 2>/dev/null || echo "Nenhum log encontrado."
