@echo off
echo 🔨 Construindo aplicação...

REM Instalar dependências
npm install

REM Build do Next.js
echo 📦 Fazendo build do Next.js...
npm run build

REM Build do Electron
echo ⚡ Construindo aplicativo Electron...
npm run dist

echo ✅ Build concluído! Verifique a pasta 'dist' para os instaladores.
pause
