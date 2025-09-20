"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import api from "@/lib/api"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  companyName: string
  userType: "sme" | "funder"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("user")
    const token = localStorage.getItem("authToken")

    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await api.auth.login(email, password)

      if (response.success && response.data) {
        const { token, user: userData } = response.data
        localStorage.setItem("authToken", token)
        localStorage.setItem("user", JSON.stringify(userData))
        setUser(userData)
      } else {
        throw new Error(response.error || "Login failed")
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: any) => {
    setIsLoading(true)
    try {
      const response = await api.auth.register(userData)

      if (response.success && response.data) {
        const { token, user: newUser } = response.data
        localStorage.setItem("authToken", token)
        localStorage.setItem("user", JSON.stringify(newUser))
        setUser(newUser)
      } else {
        throw new Error(response.error || "Registration failed")
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api.auth.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("user")
      localStorage.removeItem("authToken")
      setUser(null)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
