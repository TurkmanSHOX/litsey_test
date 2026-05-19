import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../services/api'
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  TextField,
  Avatar,
  Card,
  CardContent,
  Chip,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { User, Mail, Phone, Pencil, Save, CircleX, School, TrendingUp, Clock, ClipboardList } from 'lucide-react'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({})
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    if (user) {
      fetchProfileData()
    }
  }, [user])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      setError('')
      const profileRes = await API.get('/users/profile/')
      setProfile(profileRes.data)
      setFormData(profileRes.data)

      try {
        const statsRes = await API.get('/analytics/user_stats/')
        setStats(statsRes.data)
      } catch (statsErr) {
        console.error('Profile stats fetch error:', statsErr)
        setStats({})
      }
    } catch (err) {
      console.error('Profile data fetch error:', err)
      setError('Profil ma\'lumotlarini yuklab bo\'lmadi')
      setProfile(user || {})
      setFormData(user || {})
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const result = await updateProfile(formData)
      if (!result.success) {
        throw new Error('Profile update failed')
      }
      setProfile(formData)
      setEditing(false)
      setSuccess('Profil muvaffaqiyatli yangilandi')
    } catch (err) {
      console.error('Save profile error:', err)
      setError('Profilni saqlashda xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setFormData(profile)
    setEditing(false)
    setError('')
  }

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Yangi parol mos kelmadi')
      return
    }

    try {
      setSaving(true)
      await API.post('/users/change_password/', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      })

      setShowPasswordDialog(false)
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' })
      setSuccess('Parol muvaffaqiyatli o\'zgartirildi')
    } catch (err) {
      console.error('Password change error:', err)
      setError('Parolni o\'zgartirishda xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  const getRoleText = (role) => {
    switch (role) {
      case 'student': return 'O\'quvchi'
      case 'teacher': return 'O\'qituvchi'
      case 'admin': return 'Admin'
      default: return role
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'student': return 'primary'
      case 'teacher': return 'secondary'
      case 'admin': return 'error'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
        </Box>
      </Container>
    )
  }

  if (!profile?.username) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Profil ma'lumotlari topilmadi. Qayta kirib ko'ring.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Success/Error Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Profile Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  fontSize: '3rem',
                  bgcolor: 'primary.main'
                }}
              >
                {profile.first_name ? profile.first_name[0].toUpperCase() :
                 profile.username[0].toUpperCase()}
              </Avatar>

              <Chip
                label={getRoleText(profile.role)}
                color={getRoleColor(profile.role)}
                sx={{ mb: 2 }}
              />

              <Typography variant="h5" gutterBottom>
                {profile.first_name} {profile.last_name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                @{profile.username}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Typography variant="h4" component="h1">
                Shaxsiy ma'lumotlar
              </Typography>

              {!editing ? (
                <Button
                  variant="outlined"
                  startIcon={<Pencil />}
                  onClick={() => setEditing(true)}
                >
                  Tahrirlash
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CircleX />}
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Bekor qilish
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ism"
                  value={editing ? formData.first_name || '' : profile.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: <User sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Familiya"
                  value={editing ? formData.last_name || '' : profile.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  disabled={!editing}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editing ? formData.email || '' : profile.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: <Mail size={18} style={{ marginRight: 8 }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={editing ? formData.phone || '' : profile.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={editing ? formData.bio || '' : profile.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!editing}
                  placeholder="O'zingiz haqingizda qisqacha ma'lumot..."
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setShowPasswordDialog(true)}
              >
                Parolni o'zgartirish
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
        {profile.role === 'admin' ? 'Platforma statistikasi' : 'O\'quv statistikasi'}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <School color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {profile.role === 'admin' ? 'Jami kurslar' : 'Kurslar'}
                  </Typography>
                  <Typography variant="h4">
                    {profile.role === 'admin' ? (stats.total_courses || 0) : (stats.total_courses_enrolled || 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Clock color="secondary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {profile.role === 'admin' ? 'Foydalanuvchilar' : 'Darslar'}
                  </Typography>
                  <Typography variant="h4">
                    {profile.role === 'admin' ? (stats.total_users || 0) : (stats.total_lessons_completed || 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ClipboardList color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {profile.role === 'admin' ? 'Jami testlar' : 'Testlar'}
                  </Typography>
                  <Typography variant="h4">
                    {profile.role === 'admin' ? (stats.total_tests || 0) : (stats.total_tests_taken || 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {profile.role === 'admin' ? 'Platforma balli' : 'O\'rtacha ball'}
                  </Typography>
                  <Typography variant="h4">
                    {profile.role === 'admin'
                      ? `${stats.platform_average_score || 0}%`
                      : (stats.average_score ? `${stats.average_score.toFixed(1)}%` : '0%')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Parolni o'zgartirish</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="password"
              label="Eski parol"
              value={passwordData.old_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, old_password: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="Yangi parol"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="Yangi parolni tasdiqlang"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>Bekor qilish</Button>
          <Button
            variant="contained"
            onClick={handlePasswordChange}
            disabled={saving}
          >
            {saving ? 'O\'zgartirilmoqda...' : 'O\'zgartirish'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default Profile
