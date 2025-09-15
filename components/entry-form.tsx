"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, Upload, X, Video } from "lucide-react"
import type { Entry } from "@/app/page"

interface EntryFormProps {
  onSubmit: (entry: Omit<Entry, "id">) => void
}

export function EntryForm({ onSubmit }: EntryFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    funcao: "",
    orgao: "",
    municipio: "",
    telefone: "",
    foto: "",
  })

  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setFormData((prev) => ({ ...prev, foto: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      })
      setStream(mediaStream)
      setShowCamera(true)

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      }, 100)
    } catch (error) {
      console.error("Erro ao acessar a câmera:", error)
      alert("Erro ao acessar a câmera. Verifique as permissões.")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const photoData = canvas.toDataURL("image/jpeg", 0.8)
        setFormData((prev) => ({ ...prev, foto: photoData }))
        stopCamera()
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, foto: "" }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.funcao || !formData.orgao) {
      alert("Por favor, preencha pelo menos o nome, função e órgão.")
      return
    }

    const now = new Date()
    const dataHoraEntrada = now.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    onSubmit({
      ...formData,
      dataHoraEntrada,
    })

    // Limpar formulário
    setFormData({
      nome: "",
      funcao: "",
      orgao: "",
      municipio: "",
      telefone: "",
      foto: "",
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="funcao">Função/Cargo *</Label>
            <Input
              id="funcao"
              value={formData.funcao}
              onChange={(e) => handleInputChange("funcao", e.target.value)}
              placeholder="Ex: Diretor, Técnico, Visitante"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgao">Órgão *</Label>
            <Input
              id="orgao"
              value={formData.orgao}
              onChange={(e) => handleInputChange("orgao", e.target.value)}
              placeholder="Nome da instituição/empresa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="municipio">Município</Label>
            <Input
              id="municipio"
              value={formData.municipio}
              onChange={(e) => handleInputChange("municipio", e.target.value)}
              placeholder="Cidade"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange("telefone", e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Foto</Label>
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" onClick={startCamera} className="flex-1 bg-transparent">
              <Video className="h-4 w-4 mr-2" />
              Tirar Foto
            </Button>

            <div className="flex-1">
              <Label htmlFor="photo-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 p-3 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
                  <Upload className="h-5 w-5" />
                  <span>Ou fazer upload</span>
                </div>
                <Input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </Label>
            </div>
          </div>

          {formData.foto && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <img
                    src={formData.foto || "/placeholder.svg"}
                    alt="Foto selecionada"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Foto adicionada</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={removePhoto}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Button type="submit" className="w-full">
          <Camera className="h-4 w-4 mr-2" />
          Registrar Entrada
        </Button>
      </form>

      <Dialog open={showCamera} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Capturar Foto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-80 object-cover"
                onLoadedMetadata={() => {
                  // Garantir que o video está carregado
                  if (videoRef.current) {
                    videoRef.current.play()
                  }
                }}
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700">
                <Camera className="h-4 w-4 mr-2" />
                Capturar
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
