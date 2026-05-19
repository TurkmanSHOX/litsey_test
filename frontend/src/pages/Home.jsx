import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../services/api'
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Paper,
  Avatar
} from '@mui/material'
import { School, History, Brain, CircleCheck, ArrowRight } from 'lucide-react'

const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await API.get('/courses/')
      setCourses(response.data.slice(0, 3)) // Faqat 3 ta kurs ko'rsatish
    } catch (error) {
      console.error('Courses fetch error:', error)
    }
  }

  const features = [
    {
      icon: <School sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Interaktiv Ta\'lim',
      description: 'Zamonaviy texnologiyalar yordamida qiziqarli ta\'lim jarayoni'
    },
    {
      icon: <CircleCheck sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'Amaliy Bilim',
      description: 'Nazariy bilim bilan amaliy ko\'nikmalarni uyg\'unlashtirish'
    },
    {
      icon: <History sx={{ fontSize: 40, color: 'success.main' }} />,
      title: 'Tarixiy Kontekst',
      description: 'O\'zbekiston tarixi va madaniyatini chuqur o\'rganish'
    },
    {
      icon: <Brain sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Shaxsiy Rivojlanish',
      description: 'Har bir o\'quvchining individual rivojlanish yo\'li'
    }
  ]

  const subjects = [
    { name: 'Matematika', icon: '🔢', color: 'primary' },
    { name: 'Fizika', icon: '⚛️', color: 'secondary' },
    { name: 'Kimyo', icon: '🧪', color: 'success' },
    { name: 'Ona tili', icon: '📝', color: 'warning' },
    { name: 'Tarix', icon: '📚', color: 'info' }
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            📚 O'zbekiston Akademik Litsey
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4, opacity: 0.9 }}>
            Innovatsion ta'lim orqali kelajakni yaratamiz
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, fontSize: '1.2rem', opacity: 0.8 }}>
            O'zbekiston akademik litsey darsliklari asosida yaratilgan zamonaviy ta'lim platformasi.
            Matematika, Fizika, Kimyo, Ona tili va Tarix fanlarini interaktiv shaklda o'rganing.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                Dashboard'ga o'tish
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                >
                  Kirish
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  Ro'yxatdan o'tish
                </Button>
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
          Nima uchun bizni tanlash kerak?
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Subjects Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
            O'rganiladigan Fanlar
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            {subjects.map((subject, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <Box textAlign="center">
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 2,
                      fontSize: '2rem',
                      bgcolor: `${subject.color}.main`
                    }}
                  >
                    {subject.icon}
                  </Avatar>
                  <Typography variant="h6">
                    {subject.name}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Sample Courses */}
      {courses.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
            Kurslar Namunalari
          </Typography>

          <Grid container spacing={4}>
            {courses.map((course) => (
              <Grid item xs={12} md={4} key={course.id}>
                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {course.description}
                    </Typography>
                    <Chip
                      label={course.level === 'beginner' ? 'Boshlang\'ich' :
                             course.level === 'intermediate' ? 'O\'rta' : 'Yuqori'}
                      color={course.level === 'beginner' ? 'success' :
                             course.level === 'intermediate' ? 'warning' : 'error'}
                      size="small"
                    />
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      onClick={() => user ? navigate(`/courses/${course.id}`) : navigate('/login')}
                    >
                      {user ? 'Kursni ochish' : 'Kirish kerak'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom>
            Tayyor bo'ldingizmi?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Bilim olishning eng yaxshi vaqti - hozir!
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            Boshlash <ArrowRight size={18} style={{ marginLeft: 8 }} />
          </Button>
        </Container>
      </Box>
    </Box>
  )
}

export default Home
