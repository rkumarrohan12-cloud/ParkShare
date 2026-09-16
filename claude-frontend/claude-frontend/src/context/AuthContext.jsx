import { createContext, useContext, useEffect, useState } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ps_token')

    if (!token) {
      setLoading(false)
      return
    }

    authAPI.me()
      .then((response) => {
        setUser(response.data.user)
      })
      .catch(() => {
        localStorage.removeItem('ps_token')
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const login = async ({ email, password }) => {
    try {
      const response = await authAPI.login(email, password)

      const { token, user } = response.data

      localStorage.setItem('ps_token', token)
      setUser(user)

      return {
        ok: true,
        user,
      }
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      }
    }
  }

  const signup = async ({ name, email, phone, password, role }) => {
    try {
      const response = await authAPI.signup({
        name,
        email,
        phone,
        password,
        role,
      })

      const { token, user } = response.data

      localStorage.setItem('ps_token', token)
      setUser(user)

      return {
        ok: true,
        user,
      }
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('ps_token')
    setUser(null)
  }

  const updateProfile = (patch) => {
    setUser((currentUser) => {
      if (!currentUser) return null

      return {
        ...currentUser,
        ...patch,
      }
    })
  }

  const switchRole = (role) => {
    updateProfile({ role })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)