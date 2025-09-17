"use client"

import { useState, useEffect } from "react"
import { EntryForm } from "@/components/entry-form"
import { EntryTable } from "@/components/entry-table"
import { StatsCards } from "@/components/stats-cards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export interface Entry {
  id: string
  nome: string
  funcao: string
  orgao: string
  municipio: string
  telefone: string
  dataHoraEntrada: string
  foto?: string
}

const isElectron = typeof window !== "undefined" && window.electronAPI

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const { toast } = useToast()
  
  // ==================== INÍCIO DA CORREÇÃO ====================
  // 1. Adicione um estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState("form")
  // ==================== FIM DA CORREÇÃO =======================

  useEffect(() => {
    const loadEntries = async () => {
      if (isElectron) {
        try {
          const savedEntries = await window.electronAPI.loadEntries()
          setEntries(savedEntries || [])
        } catch (error) {
          console.error("Erro ao carregar dados do Electron:", error)
          toast({ title: "Erro", description: "Erro ao carregar dados salvos", variant: "destructive" })
        }
      } else {
        const savedEntries = localStorage.getItem("entryMonitoring")
        if (savedEntries) setEntries(JSON.parse(savedEntries))
      }
      setIsLoaded(true)
    }
    loadEntries()
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    const saveEntries = async () => {
      if (isElectron) {
        try {
          await window.electronAPI.saveEntries(entries)
        } catch (error) {
          console.error("Erro ao salvar dados no Electron:", error)
          toast({ title: "Erro", description: "Erro ao salvar dados", variant: "destructive" })
        }
      } else {
        localStorage.setItem("entryMonitoring", JSON.stringify(entries))
      }
    }
    saveEntries()
  }, [entries, isLoaded])

  const addEntry = (entry: Omit<Entry, "id">) => {
    const newEntry: Entry = {
      ...entry,
      id: Date.now().toString(),
    }
    setEntries((prev) => [newEntry, ...prev])
    // Mudar para a aba de registros após adicionar uma nova entrada
    setActiveTab("table")
  }

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const handleExport = async () => {
    if (isElectron) {
      try {
        const result = await window.electronAPI.exportData()
        if (result.success) {
          toast({ title: "Sucesso", description: `Dados exportados para: ${result.path}` })
        }
      } catch (error) {
        toast({ title: "Erro", description: "Erro ao exportar dados", variant: "destructive" })
      }
    } else {
      const dataStr = JSON.stringify(entries, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = "backup-entradas.json"
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleImport = async () => {
    if (isElectron) {
      try {
        const result = await window.electronAPI.importData()
        if (result.success) {
          setEntries(result.data)
          toast({ title: "Sucesso", description: "Dados importados com sucesso" })
        }
      } catch (error) {
        toast({ title: "Erro", description: "Erro ao importar dados", variant: "destructive" })
      }
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Sistema de Monitoramento de Entrada</h1>
          <p className="text-muted-foreground">Controle e registre todas as entradas no local</p>
          {isElectron && (
            <div className="flex justify-center gap-2 mt-4">
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar Dados
              </Button>
              <Button onClick={handleImport} variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Importar Dados
              </Button>
            </div>
          )}
        </div>

        <StatsCards entries={entries} />

        {/* ==================== INÍCIO DA CORREÇÃO ==================== */}
        {/* 2. Passe o estado para o componente Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* ==================== FIM DA CORREÇÃO ======================= */}
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Nova Entrada</TabsTrigger>
            <TabsTrigger value="table">Registros ({entries.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="form" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Nova Entrada</CardTitle>
                <CardDescription>Preencha os dados da pessoa que está entrando no local</CardDescription>
              </CardHeader>
              <CardContent>
                <EntryForm onSubmit={addEntry} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="table" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registros de Entrada</CardTitle>
                <CardDescription>Visualize todos os registros de entrada</CardDescription>
              </CardHeader>
              <CardContent>
                <EntryTable entries={entries} onDelete={deleteEntry} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}