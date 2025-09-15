# Sistema de Monitoramento de Entrada

*Aplicativo Desktop para controle de entrada em locais*

[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/YZ7nMj3Irrx)

## Visão Geral

Sistema completo de monitoramento de entrada desenvolvido com Next.js e Electron. Permite registrar visitantes com foto via webcam, dados pessoais e gerar relatórios em PDF. Os dados são salvos localmente em arquivo JSON para garantir persistência.

## Funcionalidades

- ✅ **Registro de Entradas**: Nome, função, órgão, município, telefone
- 📸 **Captura de Foto**: Via webcam integrada
- 📊 **Estatísticas**: Total de entradas, entradas hoje, última entrada
- 🔍 **Filtros**: Por data e busca de registros
- 📄 **Relatórios PDF**: Geração automática de relatórios
- 💾 **Persistência Local**: Dados salvos em arquivo JSON
- 📤 **Exportar/Importar**: Backup e restauração de dados

## Tecnologias

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **Desktop**: Electron
- **Relatórios**: jsPDF
- **Formulários**: React Hook Form + Zod

## Instalação e Uso

### Desenvolvimento

\`\`\`bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run electron-dev
\`\`\`

### Build para Produção

\`\`\`bash
# Build completo (Windows, macOS, Linux)
npm run dist

# Apenas empacotamento (sem instalador)
npm run pack
\`\`\`

### Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento Next.js
- `npm run build` - Build do Next.js
- `npm run electron` - Executar Electron
- `npm run electron-dev` - Desenvolvimento com hot reload
- `npm run dist` - Gerar instaladores para todas as plataformas
- `npm run pack` - Empacotar sem gerar instalador

## Estrutura do Projeto

\`\`\`
├── app/                    # Páginas Next.js
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── entry-form.tsx    # Formulário de entrada
│   ├── entry-table.tsx   # Tabela de registros
│   └── stats-cards.tsx   # Cartões de estatísticas
├── electron/             # Configuração Electron
│   ├── main.js          # Processo principal
│   ├── preload.js       # Script de preload
│   └── icon.png         # Ícone do aplicativo
├── scripts/             # Scripts de build
└── types/               # Definições TypeScript
\`\`\`

## Armazenamento de Dados

Os dados são salvos automaticamente em:
- **Windows**: `%APPDATA%/sistema-monitoramento-entrada/entries.json`
- **macOS**: `~/Library/Application Support/sistema-monitoramento-entrada/entries.json`
- **Linux**: `~/.config/sistema-monitoramento-entrada/entries.json`

## Build e Distribuição

O aplicativo gera instaladores para:
- **Windows**: `.exe` (NSIS installer)
- **macOS**: `.dmg`
- **Linux**: `.AppImage`

Os arquivos são gerados na pasta `dist/` após executar `npm run dist`.

## Desenvolvimento

Continue desenvolvendo o app em:
**[https://v0.app/chat/projects/YZ7nMj3Irrx](https://v0.app/chat/projects/YZ7nMj3Irrx)**
