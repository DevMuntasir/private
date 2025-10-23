export const authManager = {
  logout(path: string) {
    try {
      const keys = [
        'auth_token',
        'refresh_token',
        'auth_user',
        'isAdmin'
      ]
      keys.forEach((k) => localStorage.removeItem(k))
    } catch {
      // ignore
    }
    window.location.href = path 
  }
}
