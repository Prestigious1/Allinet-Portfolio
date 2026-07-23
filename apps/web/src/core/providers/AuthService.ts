export interface User {
  id: string
  email: string
  name?: string
  role: 'admin' | 'visitor'
}

export interface AuthService {
  signIn(email: string, password?: string): Promise<{ user: User | null; error: Error | null }>
  signOut(): Promise<{ error: Error | null }>
  getCurrentUser(): Promise<{ user: User | null; error: Error | null }>
}

export class MockAuthService implements AuthService {
  async signIn(email: string, password?: string) {
    console.log('[MockAuth] signIn', { email })
    return {
      user: { id: 'mock-user-1', email, role: 'visitor' as const },
      error: null
    }
  }

  async signOut() {
    console.log('[MockAuth] signOut')
    return { error: null }
  }

  async getCurrentUser() {
    return {
      user: null, // by default not logged in
      error: null
    }
  }
}
