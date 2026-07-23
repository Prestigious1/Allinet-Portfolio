export interface DatabaseProvider {
  query<T>(table: string, filters?: Record<string, any>): Promise<{ data: T[] | null; error: Error | null }>
  insert<T>(table: string, record: Partial<T>): Promise<{ data: T | null; error: Error | null }>
  update<T>(table: string, id: string, record: Partial<T>): Promise<{ data: T | null; error: Error | null }>
  delete(table: string, id: string): Promise<{ success: boolean; error: Error | null }>
}

export class MockDatabaseProvider implements DatabaseProvider {
  private memoryStore: Record<string, any[]> = {}

  async query<T>(table: string, filters?: Record<string, any>) {
    console.log(`[MockDB] query from ${table}`, filters)
    return { data: (this.memoryStore[table] || []) as T[], error: null }
  }

  async insert<T>(table: string, record: Partial<T>) {
    console.log(`[MockDB] insert into ${table}`, record)
    if (!this.memoryStore[table]) this.memoryStore[table] = []
    const newRecord = { id: `mock-id-${Date.now()}`, ...record }
    this.memoryStore[table].push(newRecord)
    return { data: newRecord as T, error: null }
  }

  async update<T>(table: string, id: string, record: Partial<T>) {
    console.log(`[MockDB] update ${table} id: ${id}`, record)
    return { data: { id, ...record } as T, error: null }
  }

  async delete(table: string, id: string) {
    console.log(`[MockDB] delete from ${table} id: ${id}`)
    return { success: true, error: null }
  }
}
