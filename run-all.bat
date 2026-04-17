@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Instalando dependências...
  npm install
)
echo Iniciando NexosPay backend...
start "NexosPay Backend" cmd /k "npm start"
echo Iniciando NexosPay bot...
start "NexosPay Bot" cmd /k "npm run bot"
