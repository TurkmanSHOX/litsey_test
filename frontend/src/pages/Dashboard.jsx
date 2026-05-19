import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../services/api'
import { MEDIA_BASE_URL } from '../services/api'
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Paper,
  Avatar,
} from '@mui/material'
import { School, BookOpen, ClipboardList, TrendingUp, Clock, Users, ShieldCheck, BarChart3 } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [coursesRes, statsRes] = await Promise.all([
        API.get('/courses/'),
        API.get('/analytics/user_stats/')
      ])

      setCourses(coursesRes.data)
      setStats(statsRes.data)
    } catch (err) {
      console.error('Dashboard data fetch error:', err)
      setError('Ma\'lumotlarni yuklab bo\'lmadi')
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'success'
      case 'intermediate': return 'warning'
      case 'advanced': return 'error'
      default: return 'default'
    }
  }

  const getLevelText = (level) => {
    switch (level) {
      case 'beginner': return 'Boshlang\'ich'
      case 'intermediate': return 'O\'rta'
      case 'advanced': return 'Yuqori'
      default: return level
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ width: 60, height: 60, mr: 3, bgcolor: 'rgba(255,255,255,0.2)' }}>
            {user?.first_name ? user.first_name[0].toUpperCase() : user?.username[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Salom, {user?.first_name || user?.username}! 👋
            </Typography>
            <Typography variant="h6">
              {isAdmin
                ? 'Admin boshqaruv paneli: kurslar, testlar va foydalanuvchilar nazorati'
                : 'O\'quvchi paneli: kurslar, darslar va test natijalari'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <School color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {isAdmin ? 'Jami kurslar' : 'Kurslar'}
                  </Typography>
                  <Typography variant="h4">
                    {isAdmin ? (stats.total_courses || courses.length) : courses.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BookOpen color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {isAdmin ? 'Foydalanuvchilar' : 'Darslar'}
                  </Typography>
                  <Typography variant="h4">
                    {isAdmin ? (stats.total_users || 0) : (stats.total_lessons_completed || 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ClipboardList color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {isAdmin ? 'Jami testlar' : 'Testlar'}
                  </Typography>
                  <Typography variant="h4">
                    {isAdmin ? (stats.total_tests || 0) : (stats.total_tests_taken || 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {isAdmin ? 'Platforma balli' : 'O\'rtacha ball'}
                  </Typography>
                  <Typography variant="h4">
                    {isAdmin
                      ? `${stats.platform_average_score || 0}%`
                      : (stats.average_score ? `${stats.average_score.toFixed(1)}%` : '0%')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {isAdmin && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ShieldCheck size={28} style={{ marginRight: 12, color: '#2563eb' }} />
            <Box>
              <Typography variant="h5" component="h2">
                Admin boshqaruvi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Platformadagi asosiy obyektlar holati va tezkor amallar
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Users size={22} style={{ marginRight: 8 }} />
                    <Typography variant="h6">O'quvchilar</Typography>
                  </Box>
                  <Typography variant="h4">{stats.total_students || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    O'qituvchilar: {stats.total_teachers || 0}, adminlar: {stats.total_admins || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BookOpen size={22} style={{ marginRight: 8 }} />
                    <Typography variant="h6">Kontent</Typography>
                  </Box>
                  <Typography variant="h4">{stats.total_lessons || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Darslar va {stats.total_tests || 0} ta test
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BarChart3 size={22} style={{ marginRight: 8 }} />
                    <Typography variant="h6">Natijalar</Typography>
                  </Box>
                  <Typography variant="h4">{stats.total_results || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Topshirilgan test natijalari
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" onClick={() => { window.location.href = 'http://127.0.0.1:8000/admin' }}>
                Django admin panelini ochish
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Courses Section */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
        {isAdmin ? 'Kurslarni ko\'rish va tekshirish' : 'Mavjud kurslar'}
      </Typography>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card elevation={3} sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6
              }
            }}>
              {course.image && (
                <Box
                  component="img"
                  src={course.image.startsWith('http') ? course.image : `${MEDIA_BASE_URL}${course.image}`}
                  alt={course.title}
                  sx={{ width: '100%', height: 150, objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {course.title}
                  </Typography>
                  <Chip
                    label={getLevelText(course.level)}
                    color={getLevelColor(course.level)}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {course.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Clock sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    {course.duration || 'Muddati ko\'rsatilmagan'}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  O'qituvchi: {course.instructor?.first_name} {course.instructor?.last_name}
                </Typography>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  fullWidth
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  Kursni ochish
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {courses.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <Typography variant="h6" color="text.secondary">
            Hozircha kurslar mavjud emas
          </Typography>
        </Paper>
      )}
    </Container>
  )
}

export default Dashboard
