import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CourseDetail from './pages/CourseDetail';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import LessonPage from './pages/LessonPage';
import Login from './pages/Login';
import Profile from './pages/Profile';
import TestPage from './pages/TestPage';
import AdminPanel from './pages/AdminPanel';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      dark: '#1d4ed8',
      light: '#93c5fd',
    },
    secondary: {
      main: '#d97706',
    },
    success: {
      main: '#059669',
    },
    info: {
      main: '#0891b2',
    },
    warning: {
      main: '#d97706',
    },
    background: {
      default: '#f4f7fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#4b5563',
    },
    divider: '#d9e2ec',
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { color: '#111827', fontWeight: 700 },
    h2: { color: '#111827', fontWeight: 700 },
    h3: { color: '#111827', fontWeight: 700 },
    h4: { color: '#111827', fontWeight: 700 },
    h5: { color: '#111827', fontWeight: 700 },
    h6: { color: '#111827', fontWeight: 700 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #d9e2ec',
          boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #d9e2ec',
          boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
        },
      },
    },
  },
})

function AppContent() {
  const { user, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Yuklanmoqda...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      {user && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {user && <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/home" element={user ? <Home /> : <Navigate to="/login" />} />
          <Route path="/courses" element={user ? <Home /> : <Navigate to="/login" />} />
          <Route path="/courses/:id" element={user ? <CourseDetail /> : <Navigate to="/login" />} />
          <Route path="/lessons" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/lessons/:id" element={user ? <LessonPage /> : <Navigate to="/login" />} />
          <Route path="/tests" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/tests/:id" element={user ? <TestPage /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        </Routes>
      </Box>
    </Box>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
