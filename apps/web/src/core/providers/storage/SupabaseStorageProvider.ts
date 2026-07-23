import { createClient } from '@supabase/supabase-js'
import { StorageProvider } from './StorageProvider'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// We only initialize the client if the URL and KEY are present.
// Otherwise this will throw at runtime if trying to use it without ENV vars.
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export class SupabaseStorageProvider implements StorageProvider {
  async uploadFile(bucket: string, path: string, file: File | Blob) {
    if (!supabase) return { url: null, error: new Error('Supabase client not configured.') }

    try {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      })

      if (error) throw error

      const urlData = supabase.storage.from(bucket).getPublicUrl(data.path)
      return { url: urlData.data.publicUrl, error: null }
    } catch (err: any) {
      console.error('[SupabaseStorageProvider Error]:', err)
      return { url: null, error: err as Error }
    }
  }

  async deleteFile(bucket: string, path: string) {
    if (!supabase) return { success: false, error: new Error('Supabase client not configured.') }

    try {
      const { error } = await supabase.storage.from(bucket).remove([path])
      if (error) throw error
      return { success: true, error: null }
    } catch (err: any) {
      console.error('[SupabaseStorageProvider Error]:', err)
      return { success: false, error: err as Error }
    }
  }

  async getFileUrl(bucket: string, path: string) {
    if (!supabase) return { url: null, error: new Error('Supabase client not configured.') }

    const urlData = supabase.storage.from(bucket).getPublicUrl(path)
    return { url: urlData.data.publicUrl, error: null }
  }
}
