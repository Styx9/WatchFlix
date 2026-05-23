'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { login as loginRequest, register as registerRequest, type User } from './api'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAuthModalOpen: boolean
  authMode: 'login' | 'register'
  login: (username: string, password: string) => Promise<void>
  register: (fullName: string, username: string, password: string) => Promise<void>
  updateUser: (user: User) => void
  logout: () => void
  openAuthModal: (mode: 'login' | 'register') => void
  closeAuthModal: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const STORAGE_KEY = 'watchflix.user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  useEffect(() => {
    const savedUser = window.localStorage.getItem(STORAGE_KEY)
    if (!savedUser) return

    try {
      setUser(JSON.parse(savedUser) as User)
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const login = async (username: string, password: string) => {
    const loggedInUser = await loginRequest(username, password)
    setUser(loggedInUser)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser))
    setIsAuthModalOpen(false)
  }

  const register = async (fullName: string, username: string, password: string) => {
    const createdUser = await registerRequest(
      username,
      `${username}@watchflix.local`,
      password,
      fullName
    )
    setUser(createdUser)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(createdUser))
    setIsAuthModalOpen(false)
  }

  const logout = () => {
    setUser(null)
    window.localStorage.removeItem(STORAGE_KEY)
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))
  }

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode)
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authMode,
        login,
        register,
        updateUser,
        logout,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
