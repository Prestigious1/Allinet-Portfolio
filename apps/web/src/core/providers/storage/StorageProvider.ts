export interface StorageProvider {
  uploadFile(bucket: string, path: string, file: File | Blob): Promise<{ url: string | null; error: Error | null }>
  deleteFile(bucket: string, path: string): Promise<{ success: boolean; error: Error | null }>
  getFileUrl(bucket: string, path: string): Promise<{ url: string | null; error: Error | null }>
}

export class MockStorageProvider implements StorageProvider {
  async uploadFile(bucket: string, path: string, file: File | Blob) {
    console.log(`[MockStorage] upload to ${bucket}/${path}`)
    return { url: `https://mock-storage.com/${bucket}/${path}`, error: null }
  }

  async deleteFile(bucket: string, path: string) {
    console.log(`[MockStorage] delete ${bucket}/${path}`)
    return { success: true, error: null }
  }

  async getFileUrl(bucket: string, path: string) {
    return { url: `https://mock-storage.com/${bucket}/${path}`, error: null }
  }
}
