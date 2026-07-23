import { DatabaseProvider } from './DatabaseProvider'

export class PayloadDatabaseProvider implements DatabaseProvider {
  private getBaseUrl() {
    // In browser, use relative path. In server, use absolute URL if configured.
    return typeof window !== 'undefined' ? '/api' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api')
  }

  /** Guard: throws a descriptive error if the response is not JSON (e.g. an HTML error page). */
  private async parseJsonSafe(res: Response, context: string): Promise<any> {
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      throw new Error(
        `[PayloadDatabaseProvider] Expected JSON from ${context} but received "${contentType || 'unknown content-type'}" (HTTP ${res.status}). CMS may be offline or route may not exist.`
      )
    }
    return res.json()
  }

  async query<T>(table: string, filters?: Record<string, any>) {
    try {
      const url = new URL(`${this.getBaseUrl()}/${table}`)

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          url.searchParams.append(`where[${key}][equals]`, String(value))
        })
      }

      const res = await fetch(url.toString(), {
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await this.parseJsonSafe(res, url.toString())

      if (!res.ok) {
        throw new Error(data.errors?.[0]?.message || `Failed to fetch from ${table}`)
      }

      return { data: data.docs as T[], error: null }
    } catch (err: any) {
      console.error(`[PayloadDatabaseProvider] query(${table}) error:`, err.message)
      return { data: null, error: err as Error }
    }
  }

  async insert<T>(table: string, record: Partial<T>) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/${table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })

      const data = await this.parseJsonSafe(res, `${this.getBaseUrl()}/${table}`)

      if (!res.ok) {
        throw new Error(data.errors?.[0]?.message || `Failed to insert into ${table}`)
      }

      return { data: data.doc as T, error: null }
    } catch (err: any) {
      console.error(`[PayloadDatabaseProvider] insert(${table}) error:`, err.message)
      return { data: null, error: err as Error }
    }
  }

  async update<T>(table: string, id: string, record: Partial<T>) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/${table}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })

      const data = await this.parseJsonSafe(res, `${this.getBaseUrl()}/${table}/${id}`)

      if (!res.ok) {
        throw new Error(data.errors?.[0]?.message || `Failed to update ${table}/${id}`)
      }

      return { data: data.doc as T, error: null }
    } catch (err: any) {
      console.error(`[PayloadDatabaseProvider] update(${table}/${id}) error:`, err.message)
      return { data: null, error: err as Error }
    }
  }

  async delete(table: string, id: string) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/${table}/${id}`, {
        method: 'DELETE',
      })

      const data = await this.parseJsonSafe(res, `${this.getBaseUrl()}/${table}/${id}`)

      if (!res.ok) {
        throw new Error(data.errors?.[0]?.message || `Failed to delete ${table}/${id}`)
      }

      return { success: true, error: null }
    } catch (err: any) {
      console.error(`[PayloadDatabaseProvider] delete(${table}/${id}) error:`, err.message)
      return { success: false, error: err as Error }
    }
  }
}
