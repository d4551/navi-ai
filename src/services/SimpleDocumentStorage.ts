/**
 * Simple document storage service
 * Falls back to localStorage with structured data
 */

interface DocumentStorageItem {
  id: string
  type: 'resume' | 'cover-letter'
  data: any
  createdAt: string
  updatedAt: string
}

interface VersionStorageItem {
  id: string
  documentId: string
  documentType: 'resume' | 'cover-letter'
  timestamp: number
  label: string
  jobHash?: number
  data: any
  changes?: {
    additions: number
    modifications: number
    deletions: number
    description: string
  }
}

class SimpleDocumentStorage {
  private static instance: SimpleDocumentStorage
  private documentsKey = 'navi-documents-v1'
  private versionsKey = 'navi-document-versions-v1'

  static getInstance(): SimpleDocumentStorage {
    if (!SimpleDocumentStorage.instance) {
      SimpleDocumentStorage.instance = new SimpleDocumentStorage()
    }
    return SimpleDocumentStorage.instance
  }

  async saveDocument(
    type: 'resume' | 'cover-letter',
    data: any
  ): Promise<void> {
    try {
      const documents = this.loadDocuments()
      const existingIndex = documents.findIndex(doc => doc.type === type)

      const documentItem: DocumentStorageItem = {
        id: data.id || this.generateId(),
        type,
        data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (existingIndex >= 0) {
        documents[existingIndex] = documentItem
      } else {
        documents.push(documentItem)
      }

      localStorage.setItem(this.documentsKey, JSON.stringify(documents))
    } catch (error) {
      console.error('Failed to save document:', error)
      throw error
    }
  }

  async getDocument(
    type: 'resume' | 'cover-letter',
    id?: string
  ): Promise<any> {
    try {
      const documents = this.loadDocuments()
      const document = documents.find(
        doc => doc.type === type && (id ? doc.id === id : true)
      )
      return document?.data || null
    } catch (error) {
      console.error('Failed to get document:', error)
      return null
    }
  }

  async saveVersion(version: VersionStorageItem): Promise<void> {
    try {
      const versions = this.loadVersions()
      versions.unshift(version)

      // Keep only the last 100 versions
      if (versions.length > 100) {
        versions.splice(100)
      }

      localStorage.setItem(this.versionsKey, JSON.stringify(versions))
    } catch (error) {
      console.error('Failed to save version:', error)
      throw error
    }
  }

  async getVersions(): Promise<VersionStorageItem[]> {
    try {
      return this.loadVersions()
    } catch (error) {
      console.error('Failed to get versions:', error)
      return []
    }
  }

  async deleteVersion(versionId: string): Promise<void> {
    try {
      const versions = this.loadVersions()
      const filteredVersions = versions.filter(v => v.id !== versionId)
      localStorage.setItem(this.versionsKey, JSON.stringify(filteredVersions))
    } catch (error) {
      console.error('Failed to delete version:', error)
      throw error
    }
  }

  private loadDocuments(): DocumentStorageItem[] {
    try {
      const data = localStorage.getItem(this.documentsKey)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to load documents:', error)
      return []
    }
  }

  private loadVersions(): VersionStorageItem[] {
    try {
      const data = localStorage.getItem(this.versionsKey)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to load versions:', error)
      return []
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

// Create a simple service that matches the interface expected by useDocumentManager
export const databaseService = {
  saveDocument: async (type: 'resume' | 'cover-letter', data: any) => {
    return SimpleDocumentStorage.getInstance().saveDocument(type, data)
  },

  getDocument: async (type: 'resume' | 'cover-letter', id?: string) => {
    return SimpleDocumentStorage.getInstance().getDocument(type, id)
  },

  saveVersion: async (version: VersionStorageItem) => {
    return SimpleDocumentStorage.getInstance().saveVersion(version)
  },

  getVersions: async () => {
    return SimpleDocumentStorage.getInstance().getVersions()
  },

  deleteVersion: async (versionId: string) => {
    return SimpleDocumentStorage.getInstance().deleteVersion(versionId)
  },
}
