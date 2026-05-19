import { createContext, useContext, useState, useEffect } from 'react'
import API from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const response = await API.get('/users/profile/')
        setUser(response.data)
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        delete API.defaults.headers.common['Authorization']
      }
    }
    setLoading(false)
  }

  const login = async (username, password) => {
    try {
      const response = await API.post('/users/login/', { username, password })
      const { user, tokens } = response.data

      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)
      API.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`

      setUser(user)
      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: error.response?.data?.detail || 'Login xatosi' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await API.post('/users/register/', userData)
      const { user, tokens } = response.data

      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)
      API.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`

      setUser(user)
      return { success: true }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, error: error.response?.data || 'Ro\'yxatdan o\'tish xatosi' }
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await API.post('/users/logout/', { refresh_token: refreshToken })
      }
    } catch (error) {
      console.error('Logout error:', error)
    }

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    delete API.defaults.headers.common['Authorization']
    setUser(null)
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await API.put('/users/update_profile/', profileData)
      setUser(response.data)
      return { success: true }
    } catch (error) {
      console.error('Profile update failed:', error)
      return { success: false, error: error.response?.data || 'Profil yangilash xatosi' }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher' || user?.role === 'admin',
    isStudent: user?.role === 'student'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}