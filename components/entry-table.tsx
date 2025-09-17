"use client"

import { useState } from "react"
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
// NOVO: Adicionado o ícone FileText que estava faltando na importação
import { Trash2, Search, Eye, Phone, MapPin, Building, User, FileText } from "lucide-react"
import type { Entry } from "@/app/page"

interface EntryTableProps {
  entries: Entry[]
  onDelete: (id: string) => void
}

// Função auxiliar para converter strings de data em objetos Date
const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null
  
  const partsBR = dateString.split('/')
  if (partsBR.length === 3) {
    const [day, month, year] = partsBR.map(Number)
    return new Date(year, month - 1, day)
  }

  const partsISO = dateString.split('-')
  if (partsISO.length === 3) {
    const [year, month, day] = partsISO.map(Number)
    return new Date(year, month - 1, day)
  }

  return null
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
    const matchesSearch =
      (entry.nome && entry.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.cpf && entry.cpf.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.funcao && entry.funcao.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.orgao && entry.orgao.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.municipio && entry.municipio.toLowerCase().includes(searchTerm.toLowerCase()))

    let matchesDate = true
    
    const entryDateStr = entry.dataHoraEntrada.split(",")[0].trim()
    const entryDate = parseDate(entryDateStr)

    if (entryDate) {
      const start = parseDate(startDate)
      const end = parseDate(endDate)

      if (end) {
        end.setHours(23, 59, 59, 999)
      }
      
      if (start && end) {
        matchesDate = entryDate >= start && entryDate <= end
      } else if (start) {
        matchesDate = entryDate >= start
      } else if (end) {
        matchesDate = entryDate <= end
      }
    }

    return matchesSearch && matchesDate
  })

  return (
    <div className="space-y-4">
      {/* Seção de Filtros */}
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
            <Label htmlFor="start-date">Data de Início</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="end-date">Data Final</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabela de Registros */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Foto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Órgão</TableHead>
              <TableHead>Data e Hora de Entrada</TableHead>
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
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{entry.nome}</TableCell>
                <TableCell>{entry.cpf}</TableCell>
                <TableCell>{entry.orgao}</TableCell>
                <TableCell>{entry.dataHoraEntrada}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Dialog onOpenChange={(open) => !open && setSelectedEntry(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedEntry(entry)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Detalhes do Registro</DialogTitle>
                        </DialogHeader>
                        {selectedEntry && (
                          <div className="flex flex-col sm:flex-row gap-6 py-4">
                            <img
                              src={selectedEntry.foto || "/placeholder.svg"}
                              alt={`Foto de ${selectedEntry.nome}`}
                              className="h-32 w-32 rounded-lg object-cover mx-auto sm:mx-0"
                            />
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{selectedEntry.nome}</span>
                              </div>
                              
                              {/* ALTERAÇÃO AQUI: Adicionado o campo de CPF */}
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="secondary">{selectedEntry.cpf}</Badge>
                              </div>

                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {selectedEntry.funcao} em{" "}
                                  <span className="font-medium">{selectedEntry.orgao}</span>
                                </span>
                              </div>
                              {selectedEntry.municipio && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>{selectedEntry.municipio}</span>
                                </div>
                              )}
                              {selectedEntry.telefone && (
                                <div className="flex items-center gap-2">
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