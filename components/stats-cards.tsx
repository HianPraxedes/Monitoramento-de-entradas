"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Clock } from "lucide-react"
import type { Entry } from "@/app/page"

interface StatsCardsProps {
  entries: Entry[]
}

export function StatsCards({ entries }: StatsCardsProps) {
  // Total de entradas
  const totalEntries = entries.length

  const today = new Date()
  const todayString = today.toLocaleDateString("pt-BR")

  const todayEntries = entries.filter((entry) => {
    const entryDateString = entry.dataHoraEntrada.split(",")[0].trim()
    return entryDateString === todayString
  }).length

  // Última entrada
  const lastEntry = entries.length > 0 ? entries[0] : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEntries}</div>
          <p className="text-xs text-muted-foreground">Registros no sistema</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Entradas Hoje</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayEntries}</div>
          <p className="text-xs text-muted-foreground">{todayString}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Última Entrada</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lastEntry ? lastEntry.nome.split(" ")[0] : "Nenhuma"}</div>
          <p className="text-xs text-muted-foreground">{lastEntry ? lastEntry.dataHoraEntrada : "Sem registros"}</p>
        </CardContent>
      </Card>
    </div>
  )
}
