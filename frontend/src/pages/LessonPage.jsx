import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../services/api'
import { MEDIA_BASE_URL } from '../services/api'
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material'
import { ArrowRight, ArrowLeft, CircleCheck, Play, ClipboardList, House } from 'lucide-react'
import { Link } from 'react-router-dom'

const LessonPage = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [course, setCourse] = useState(null)
  const [content, setContent] = useState([])
  const [currentContentIndex, setCurrentContentIndex] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id && user) {
      fetchLessonData()
    } else if (!user) {
      navigate('/login')
    }
  }, [id, user])

  const fetchLessonData = async () => {
    try {
      setLoading(true)
      const [lessonRes, contentRes] = await Promise.all([
        API.get(`/lessons/${id}/`),
        API.get(`/lessons/${id}/content/`)
      ])

      setLesson(lessonRes.data)
      setCourse(lessonRes.data.course)
      setContent(contentRes.data)
      setCompleted(lessonRes.data.is_completed)

      // Check if lesson is completed
      const progressRes = await API.get(`/analytics/${id}/lesson_progress/`)
      setCompleted(progressRes.data.completed)
    } catch (err) {
      console.error('Lesson data fetch error:', err)
      setError('Dars ma\'lumotlarini yuklab bo\'lmadi')
    } finally {
      setLoading(false)
    }
  }

  const handleContentNavigation = (direction) => {
    if (direction === 'next' && currentContentIndex < content.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1)
    } else if (direction === 'prev' && currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1)
    }
  }

  const handleCompleteLesson = async () => {
    try {
      await API.post(`/analytics/${id}/complete_lesson/`)
      setCompleted(true)
      // Show success message or navigate
    } catch (err) {
      console.error('Complete lesson error:', err)
    }
  }

  const handleTakeTest = () => {
    if (lesson?.test) {
      navigate(`/tests/${lesson.test}`)
    }
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Darslarni ko'rish uchun tizimga kirishingiz kerak.
        </Alert>
      </Container>
    )
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

  if (error || !lesson) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error || 'Dars topilmadi'}
        </Alert>
      </Container>
    )
  }

  const currentContent = content[currentContentIndex]
  const mediaUrl = (path) => {
    if (!path) return ''
    return path.startsWith('http') ? path : `${MEDIA_BASE_URL}${path}`
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }} separator={<ArrowRight size={16} />}>
        <MuiLink component={Link} to="/" underline="hover">
          <House size={16} style={{ marginRight: 4 }} />
          Bosh sahifa
        </MuiLink>
        <MuiLink component={Link} to="/dashboard" underline="hover">
          Dashboard
        </MuiLink>
        <MuiLink component={Link} to={`/courses/${course?.id}`} underline="hover">
          {course?.title}
        </MuiLink>
        <Typography color="text.primary">{lesson.title}</Typography>
      </Breadcrumbs>

      {/* Lesson Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {lesson.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {lesson.description}
            </Typography>
          </Box>
          {completed && (
            <Chip
              icon={<CircleCheck />}
              label="Tugagan"
              color="success"
              variant="outlined"
            />
          )}
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Kontent progressi: {currentContentIndex + 1} / {content.length}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={content.length > 0 ? ((currentContentIndex + 1) / content.length) * 100 : 0}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      </Paper>

      {/* Content Display */}
      {currentContent && (
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                {currentContent.title}
              </Typography>

              <Box sx={{ mt: 2 }}>
                {currentContent.content_type === 'text' && (
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {currentContent.content}
                  </Typography>
                )}

                {currentContent.content_type === 'video' && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Video kontent
                    </Typography>
                    {/* Video player would go here */}
                    <Paper sx={{ p: 4, bgcolor: 'grey.100' }}>
                      <Play sx={{ fontSize: 48, color: 'grey.500' }} />
                      <Typography>Video pleyer</Typography>
                    </Paper>
                  </Box>
                )}

                {currentContent.content_type === 'image' && (
                  <Box sx={{ textAlign: 'center' }}>
                    {currentContent.file ? (
                      <Box
                        component="img"
                        src={mediaUrl(currentContent.file)}
                        alt={currentContent.title}
                        sx={{
                          width: '100%',
                          maxHeight: 520,
                          objectFit: 'contain',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: '#f8fafc',
                        }}
                      />
                    ) : (
                      <Alert severity="info">Bu rasm kontentida fayl topilmadi.</Alert>
                    )}
                    {currentContent.content && (
                      <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
                        {currentContent.content}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft />}
          onClick={() => handleContentNavigation('prev')}
          disabled={currentContentIndex === 0}
        >
          Oldingi
        </Button>

        <Typography variant="body2" color="text.secondary">
          {currentContentIndex + 1} / {content.length}
        </Typography>

        <Button
          variant="outlined"
          endIcon={<ArrowRight />}
          onClick={() => handleContentNavigation('next')}
          disabled={currentContentIndex === content.length - 1}
        >
          Keyingi
        </Button>
      </Box>

      {/* Actions */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleCompleteLesson}
              disabled={completed}
              startIcon={completed ? <CircleCheck /> : <Play />}
            >
              {completed ? 'Dars tugagan' : 'Darsni tugagan deb belgilash'}
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={handleTakeTest}
              disabled={!lesson?.test}
              startIcon={<ClipboardList />}
            >
              Test topshirish
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default LessonPage
