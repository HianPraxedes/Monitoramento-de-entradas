// app/layout.tsx

import type React from "react"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sistema de Monitoramento de Entrada",
  description: "Sistema para controle e registro de entradas no local",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // Adicionamos os links para o Google Fonts diretamente no <head>
    // e definimos uma classe na tag <html> para a fonte.
    <html lang="pt-BR" className="font-sans">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}