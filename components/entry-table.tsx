"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, Search, Eye, Phone, MapPin, Building, FileText, Calendar } from "lucide-react"
import type { Entry } from "@/app/page"

interface EntryTableProps {
  entries: Entry[]
  onDelete: (id: string) => void
}

export function EntryTable({ entries, onDelete }: EntryTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.funcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.orgao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.municipio.toLowerCase().includes(searchTerm.toLowerCase())

    if (!startDate && !endDate) return matchesSearch

    const entryDate = new Date(entry.dataHoraEntrada.split(" ")[0].split("/").reverse().join("-"))
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    let matchesDate = true
    if (start) matchesDate = matchesDate && entryDate >= start
    if (end) matchesDate = matchesDate && entryDate <= end

    return matchesSearch && matchesDate
  })

  const generatePDF = async () => {
    try {
      // Importação dinâmica do jsPDF
      const { jsPDF } = await import("jspdf")

      const doc = new jsPDF()

      // Título
      doc.setFontSize(16)
      doc.text("Relatório de Entradas", 20, 20)

      // Período (se filtrado)
      if (startDate || endDate) {
        doc.setFontSize(12)
        const periodo = `Período: ${startDate || "Início"} até ${endDate || "Hoje"}`
        doc.text(periodo, 20, 30)
      }

      // Cabeçalho da tabela
      doc.setFontSize(10)
      let y = startDate || endDate ? 45 : 35

      doc.text("Nome", 20, y)
      doc.text("Função", 70, y)
      doc.text("Órgão", 110, y)
      doc.text("Data/Hora", 150, y)

      // Linha separadora
      y += 5
      doc.line(20, y, 190, y)

      // Dados
      y += 10
      filteredEntries.forEach((entry, index) => {
        if (y > 270) {
          // Nova página se necessário
          doc.addPage()
          y = 20
        }

        doc.text(entry.nome.substring(0, 20), 20, y)
        doc.text(entry.funcao.substring(0, 15), 70, y)
        doc.text(entry.orgao.substring(0, 15), 110, y)
        doc.text(entry.dataHoraEntrada, 150, y)

        y += 8
      })

      // Rodapé
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(`Total de registros: ${filteredEntries.length}`, 20, 290)
        doc.text(`Página ${i} de ${totalPages}`, 150, 290)
        doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 20, 285)
      }

      // Download
      const fileName = `relatorio-entradas-${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(fileName)
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      alert("Erro ao gerar o relatório PDF. Tente novamente.")
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
      onDelete(id)
    }
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum registro de entrada encontrado.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Use a aba "Nova Entrada" para adicionar o primeiro registro.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, função, órgão ou município..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="start-date" className="text-sm">
            De:
          </Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-auto"
          />
          <Label htmlFor="end-date" className="text-sm">
            Até:
          </Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-auto"
          />
        </div>

        <Button onClick={generatePDF} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Gerar PDF
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Foto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Órgão</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  {entry.foto ? (
                    <img
                      src={entry.foto || "/placeholder.svg"}
                      alt={`Foto de ${entry.nome}`}
                      className="w-10 h-10 object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">{entry.nome.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{entry.nome}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{entry.funcao}</Badge>
                </TableCell>
                <TableCell>{entry.orgao}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{entry.dataHoraEntrada}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Dialog>
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
                                <Badge variant="secondary" className="mt-1">
                                  {selectedEntry.funcao}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span>{selectedEntry.orgao}</span>
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
