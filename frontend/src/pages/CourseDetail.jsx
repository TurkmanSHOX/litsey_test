import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  LinearProgress,
  Alert
} from '@mui/material'
import { Play, ClipboardList, User, Clock, CircleCheck, BookOpen } from 'lucide-react'

const CourseDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      fetchCourseData()
    }
  }, [id])

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      const [courseRes, lessonsRes, progressRes] = await Promise.all([
        API.get(`/courses/${id}/`),
        API.get(`/courses/${id}/lessons/`),
        user ? API.get(`/analytics/${id}/progress/`) : Promise.resolve({ data: {} })
      ])

      setCourse(courseRes.data)
      setLessons(lessonsRes.data)
      setProgress(progressRes.data)
    } catch (err) {
      console.error('Course data fetch error:', err)
      setError('Kurs ma\'lumotlarini yuklab bo\'lmadi')
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

  const getListItems = (value) => {
    if (!value) return []
    if (Array.isArray(value)) return value
    return value
      .split(/\r?\n|;/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const handleStartLesson = (lessonId) => {
    if (user) {
      navigate(`/lessons/${lessonId}`)
    } else {
      navigate('/login')
    }
  }

  const handleTakeTest = (lesson) => {
    if (user) {
      if (lesson?.test) {
        navigate(`/tests/${lesson.test}`)
      }
    } else {
      navigate('/login')
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

  if (error || !course) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error || 'Kurs topilmadi'}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Course Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={getLevelText(course.level)}
                color={getLevelColor(course.level)}
                sx={{ mb: 2 }}
              />
              <Typography variant="h3" component="h1" gutterBottom>
                {course.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1.1rem' }}>
                {course.description}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <User sx={{ mr: 1 }} />
              <Typography variant="body1">
                O'qituvchi: {course.instructor?.first_name} {course.instructor?.last_name}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Clock sx={{ mr: 1 }} />
              <Typography variant="body1">
                Davomiyligi: {course.duration || 'Aniqlanmagan'}
              </Typography>
            </Box>

            {getListItems(course.objectives).length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Kurs maqsadlari:
                </Typography>
                <List dense>
                  {getListItems(course.objectives).map((objective, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CircleCheck color="success" />
                      </ListItemIcon>
                      <ListItemText primary={objective} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              {progress.completed_lessons !== undefined && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Sizning progress'ingiz
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {progress.completed_lessons}/{progress.total_lessons} dars tugagan
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={progress.total_lessons > 0 ? (progress.completed_lessons / progress.total_lessons) * 100 : 0}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {progress.total_lessons > 0 ? Math.round((progress.completed_lessons / progress.total_lessons) * 100) : 0}% tugagan
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => handleStartLesson(lessons[0]?.id)}
                disabled={!lessons.length}
                sx={{ mb: 2 }}
              >
                Kursni boshlash
              </Button>

              {user && (
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard'ga qaytish
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Lessons List */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
        📚 Kurs Darslari
      </Typography>

      <Grid container spacing={3}>
        {lessons.map((lesson, index) => (
          <Grid item xs={12} md={6} key={lesson.id}>
            <Card elevation={2} sx={{
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" component="h3">
                    {index + 1}. {lesson.title}
                  </Typography>
                  {progress.completed_lessons_ids?.includes(lesson.id) && (
                    <CircleCheck color="success" />
                  )}
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {lesson.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    icon={<BookOpen />}
                    label={`${lesson.content_count || 0} kontent`}
                    size="small"
                    variant="outlined"
                  />
                  {lesson.has_test && (
                    <Chip
                      icon={<ClipboardList />}
                      label="Test mavjud"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Play />}
                  onClick={() => handleStartLesson(lesson.id)}
                  sx={{ mb: 1 }}
                >
                  Darsni ochish
                </Button>

                {lesson.has_test && (
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ClipboardList />}
                    onClick={() => handleTakeTest(lesson)}
                  >
                    Test topshirish
                  </Button>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {lessons.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <Typography variant="h6" color="text.secondary">
            Bu kursda hali darslar mavjud emas
          </Typography>
        </Paper>
      )}
    </Container>
  )
}

export default CourseDetail
