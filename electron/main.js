const { app, BrowserWindow, ipcMain, dialog } = require("electron")
const path = require("path")
const fs = require("fs")
const isDev = process.env.NODE_ENV === "development"

// Caminho para o arquivo de dados
const dataPath = path.join(app.getPath("userData"), "entries.json")

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "icon.png"),
    show: false,
  })

  // Carregar a aplicação
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000")
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, "../out/index.html"))
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show()
  })

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

// Funções para manipular dados
function loadData() {
  try {
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, "utf8")
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error("Erro ao carregar dados:", error)
    return []
  }
}

function saveData(data) {
  try {
    // Criar diretório se não existir
    const dir = path.dirname(dataPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error("Erro ao salvar dados:", error)
    return false
  }
}

// Eventos IPC
ipcMain.handle("load-entries", () => {
  return loadData()
})

ipcMain.handle("save-entries", (event, entries) => {
  return saveData(entries)
})

ipcMain.handle("export-data", async () => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: "Exportar Dados",
      defaultPath: "backup-entradas.json",
      filters: [{ name: "JSON Files", extensions: ["json"] }],
    })

    if (!result.canceled) {
      const data = loadData()
      fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2))
      return { success: true, path: result.filePath }
    }
    return { success: false }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle("import-data", async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Importar Dados",
      filters: [{ name: "JSON Files", extensions: ["json"] }],
      properties: ["openFile"],
    })

    if (!result.canceled && result.filePaths.length > 0) {
      const data = fs.readFileSync(result.filePaths[0], "utf8")
      const entries = JSON.parse(data)
      saveData(entries)
      return { success: true, data: entries }
    }
    return { success: false }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// Eventos da aplicação
app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
