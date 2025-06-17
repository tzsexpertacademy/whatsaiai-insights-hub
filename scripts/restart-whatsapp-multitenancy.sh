
#!/bin/bash

echo "🔄 Reiniciando WhatsApp Multi-Cliente SaaS..."

# Parar servidor
./scripts/stop-whatsapp-multitenancy.sh

# Aguardar
sleep 2

# Iniciar servidor
./scripts/start-whatsapp-multitenancy.sh
