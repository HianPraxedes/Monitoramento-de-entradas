"use client"

import { useState } from "react"
import jsPDF from "jspdf"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2, Search, Eye, Phone, MapPin, Building, User, FileText, Calendar } from "lucide-react"
import type { Entry } from "@/app/page"

interface EntryTableProps {
  entries: Entry[]
  onDelete: (id: string) => void
}

// CORRIGIDO: Função de data mais robusta para lidar com os dois formatos
const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null

  // Tenta o formato 'dd/mm/yyyy...' (vindo dos registros)
  const partsBR = dateString.split(',')[0].trim().split('/');
  if (partsBR.length === 3) {
    const [day, month, year] = partsBR.map(Number);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        // Mês em JS é 0-indexado (0 = Janeiro)
        return new Date(year, month - 1, day);
    }
  }

  // Tenta o formato 'yyyy-mm-dd' (vindo do input de data)
  const partsISO = dateString.split('-');
  if (partsISO.length === 3) {
    const [year, month, day] = partsISO.map(Number);
     if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month - 1, day);
    }
  }
  return null;
}

export function EntryTable({ entries, onDelete }: EntryTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este registro?")) {
      onDelete(id)
    }
  }

  const filteredEntries = entries.filter((entry) => {
    // CORRIGIDO: Busca por CPF adicionada
    const matchesSearch =
      (entry.nome?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (entry.cpf?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || // <-- ADICIONADO AQUI
      (entry.funcao?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (entry.orgao?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (entry.municipio?.toLowerCase() || "").includes(searchTerm.toLowerCase())

    // CORRIGIDO: Lógica de filtro de data
    let matchesDate = true
    const entryDate = parseDate(entry.dataHoraEntrada)
    
    if (startDate || endDate) {
      const start = parseDate(startDate)
      const end = parseDate(endDate)

      if (entryDate) {
        // Garante que o dia final seja incluído na busca
        if (end) end.setHours(23, 59, 59, 999) 

        if (start && end) {
          matchesDate = entryDate >= start && entryDate <= end
        } else if (start) {
          matchesDate = entryDate >= start
        } else if (end) {
          matchesDate = entryDate <= end
        }
      } else {
        matchesDate = false // Se a data do registro for inválida, não deve corresponder ao filtro
      }
    }
    
    return matchesSearch && matchesDate
  })

  // Função para gerar PDF com a coluna "Função" inclusa
  const generatePDF = async () => {
    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF({ orientation: "landscape" })

      doc.setFontSize(16)
      doc.text("Relatório de Entradas", 20, 20)

      if (startDate || endDate) {
        doc.setFontSize(12)
        const startFormatted = startDate ? new Date(startDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : "Início"
        const endFormatted = endDate ? new Date(endDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : "Hoje"
        const periodo = `Período: ${startFormatted} até ${endFormatted}`
        doc.text(periodo, 20, 30)
      }

      doc.setFontSize(10)
      let y = startDate || endDate ? 45 : 35
      const startX = 14

      // Cabeçalho ajustado
      doc.text("Nome", startX, y)
      doc.text("CPF", startX + 55, y)
      doc.text("Função", startX + 85, y)
      doc.text("Telefone", startX + 125, y)
      doc.text("Órgão", startX + 155, y)
      doc.text("Data/Hora", startX + 210, y)

      y += 5
      doc.line(startX, y, 280, y)

      y += 7
      filteredEntries.forEach((entry) => {
        if (y > 190) {
          doc.addPage()
          y = 20
        }

        // Dados ajustados
        doc.text(entry.nome.substring(0, 28), startX, y)
        doc.text(entry.cpf || "N/A", startX + 55, y)
        doc.text(entry.funcao.substring(0, 18) || "N/A", startX + 85, y)
        doc.text(entry.telefone || "N/A", startX + 125, y)
        doc.text(entry.orgao.substring(0, 25), startX + 155, y)
        doc.text(entry.dataHoraEntrada, startX + 210, y)

        y += 7
      })

      // Rodapé
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(`Total de registros: ${filteredEntries.length}`, startX, 200)
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 40, 200)
        doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, startX, 205)
      }

      const fileName = `relatorio-entradas-${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(fileName)
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      alert("Erro ao gerar o relatório PDF. Tente novamente.")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Pesquisar</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Pesquisar por nome, CPF, órgão..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex items-end gap-2">
            <div>
                <Label htmlFor="start-date">De:</Label>
                <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-auto"
                />
            </div>
            <div>
                <Label htmlFor="end-date">Até:</Label>
                <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-auto"
                />
            </div>
        </div>
        <div className="flex items-end">
            <Button onClick={generatePDF} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Gerar PDF
            </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Foto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Órgão</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <img
                    src={entry.foto || "/placeholder.svg"}
                    alt={`Foto de ${entry.nome}`}
                    className="w-10 h-10 object-cover rounded-full"
                  />
                </TableCell>
                <TableCell className="font-medium">{entry.nome}</TableCell>
                <TableCell>{entry.cpf}</TableCell>
                <TableCell>{entry.orgao}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{entry.dataHoraEntrada}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Dialog onOpenChange={(open) => !open && setSelectedEntry(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedEntry(entry)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Detalhes da Entrada</DialogTitle>
                        </DialogHeader>
                        {selectedEntry && (
                            <div className="space-y-4">
                                {selectedEntry.foto && (
                                <div className="flex justify-center">
                                    <img
                                    src={selectedEntry.foto || "/placeholder.svg"}
                                    alt={`Foto de ${selectedEntry.nome}`}
                                    className="w-24 h-24 object-cover rounded-full"
                                    />
                                </div>
                                )}
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="font-semibold text-lg">{selectedEntry.nome}</h3>
                                        <div className="flex items-center gap-2 text-sm mt-1">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <Badge variant="secondary">{selectedEntry.cpf}</Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span>{selectedEntry.funcao} em {selectedEntry.orgao}</span>
                                    </div>
                                    {selectedEntry.municipio && (
                                        <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{selectedEntry.municipio}</span>
                                        </div>
                                    )}
                                    {selectedEntry.telefone && (
                                        <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{selectedEntry.telefone}</span>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t">
                                        <p className="text-sm text-muted-foreground">Entrada registrada em:</p>
                                        <p className="font-medium">{selectedEntry.dataHoraEntrada}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredEntries.length === 0 && (searchTerm || startDate || endDate) && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">Nenhum registro encontrado para os filtros aplicados.</p>
        </div>
      )}
    </div>
  )
}