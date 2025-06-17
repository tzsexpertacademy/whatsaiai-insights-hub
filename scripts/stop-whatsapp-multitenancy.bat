
@echo off
echo 🔄 Parando WhatsApp Multi-Cliente SaaS...

:: Parar todos os processos Node.js relacionados
taskkill /f /im node.exe /fi "WINDOWTITLE eq*whatsapp-multitenancy-server*" >nul 2>&1

echo ✅ Servidor parado!
pause
