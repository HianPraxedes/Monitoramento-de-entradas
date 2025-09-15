#!/bin/bash

echo "🔨 Construindo aplicação..."

# Instalar dependências
npm install

# Build do Next.js
echo "📦 Fazendo build do Next.js..."
npm run build

# Build do Electron
echo "⚡ Construindo aplicativo Electron..."
npm run dist

echo "✅ Build concluído! Verifique a pasta 'dist' para os instaladores."
