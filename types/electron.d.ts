export interface ElectronAPI {
  loadEntries: () => Promise<any[]>
  saveEntries: (entries: any[]) => Promise<boolean>
  exportData: () => Promise<{ success: boolean; path?: string; error?: string }>
  importData: () => Promise<{ success: boolean; data?: any[]; error?: string }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
