
@echo off
echo 🚀 Iniciando WhatsApp Multi-Cliente SaaS...

:: Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado. Instale Node.js primeiro.
    pause
    exit /b 1
)

:: Criar diretório de sessões
if not exist "whatsapp-sessions" mkdir whatsapp-sessions

:: Instalar dependências se necessário
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install express socket.io cors whatsapp-web.js qrcode swagger-ui-express nodemon
)

:: Parar processo anterior se existir
taskkill /f /im node.exe /fi "WINDOWTITLE eq*whatsapp-multitenancy-server*" >nul 2>&1

:: Iniciar servidor
echo 🔄 Iniciando servidor na porta 3010...
start "WhatsApp Multi-Cliente Server" node server/whatsapp-multitenancy-server.js

:: Aguardar inicialização
timeout /t 5 /nobreak >nul

echo ✅ Servidor iniciado!
echo 🌐 Painel Admin: http://localhost:3010
echo 📚 API Swagger: http://localhost:3010/api-docs
echo.
echo Pressione qualquer tecla para abrir o painel...
pause >nul
start http://localhost:3010
