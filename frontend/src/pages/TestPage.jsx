import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../services/api'
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material'
import { ArrowRight, ArrowLeft, Send, Clock, CircleCheck, House } from 'lucide-react'
import { Link } from 'react-router-dom'

const TestPage = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (id && user) {
      fetchTestData()
    } else if (!user) {
      navigate('/login')
    }
  }, [id, user])

  useEffect(() => {
    if (results) return
    if (test && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && test) {
      handleSubmitTest()
    }
  }, [timeLeft, test, results])

  const fetchTestData = async () => {
    try {
      setLoading(true)
      const [testRes, questionsRes] = await Promise.all([
        API.get(`/tests/${id}/`),
        API.get(`/tests/${id}/questions/`)
      ])

      setTest(testRes.data)
      setQuestions(questionsRes.data)
      setTimeLeft(testRes.data.time_limit * 60) // Convert minutes to seconds

      // Initialize answers object
      const initialAnswers = {}
      questionsRes.data.forEach(q => {
        initialAnswers[q.id] = ''
      })
      setAnswers(initialAnswers)
    } catch (err) {
      console.error('Test data fetch error:', err)
      setError('Test ma\'lumotlarini yuklab bo\'lmadi')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleQuestionNavigation = (direction) => {
    if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitTest = async () => {
    if (submitting) return

    try {
      setSubmitting(true)
      setError('')
      const response = await API.post(`/tests/${id}/submit/`, {
        answers: answers
      })

      setResults(response.data)
      setShowResults(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Submit test error:', err)
      const detail = err.response?.data?.detail || err.response?.data?.error
      setError(detail || 'Testni topshirishda xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getAnsweredCount = () => {
    return Object.values(answers).filter(answer => answer !== '').length
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Test topshirish uchun tizimga kirishingiz kerak.
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

  if (!test) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Test topilmadi
        </Alert>
      </Container>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const answeredCount = getAnsweredCount()

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 14, textAlign: 'left' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }} separator={<ArrowRight size={16} />}>
        <MuiLink component={Link} to="/" underline="hover">
          <House size={16} style={{ marginRight: 4 }} />
          Bosh sahifa
        </MuiLink>
        <MuiLink component={Link} to="/dashboard" underline="hover">
          Dashboard
        </MuiLink>
        <Typography sx={{ color: 'text.primary', fontWeight: 700 }}>{test.title}</Typography>
      </Breadcrumbs>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {results && (
        <Alert
          severity={results.score >= 70 ? 'success' : 'warning'}
          sx={{ mb: 3, alignItems: 'center' }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          }
        >
          Test yakunlandi: {results.score}% natija. To'g'ri javoblar: {results.correct_answers}/{results.total_questions}.
        </Alert>
      )}

      {/* Test Header */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          bgcolor: '#ffffff',
          borderTop: '4px solid',
          borderTopColor: 'primary.main',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#111827', fontWeight: 800 }}>
              {test.title}
            </Typography>
            <Typography variant="body1" sx={{ color: '#374151' }}>
              {test.description}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Clock size={20} style={{ marginRight: 8 }} />
              <Typography variant="h6" sx={{ color: timeLeft < 300 ? 'error.main' : '#111827', fontWeight: 800 }}>
                {formatTime(timeLeft)}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#374151' }}>
              {answeredCount}/{questions.length} savol javob berildi
            </Typography>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={questions.length ? (answeredCount / questions.length) * 100 : 0}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Paper>

      {/* Question Display */}
      {currentQuestion && (
        <Card elevation={3} sx={{ mb: 3, bgcolor: '#ffffff', borderLeft: '4px solid', borderLeftColor: 'secondary.main' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#111827', fontWeight: 800 }}>
              {currentQuestionIndex + 1}. {currentQuestion.question_text}
            </Typography>

            <FormControl component="fieldset" sx={{ mt: 3, width: '100%' }}>
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              >
                {currentQuestion.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={option}
                    sx={{
                      mb: 1,
                      color: '#111827',
                      '& .MuiFormControlLabel-label': {
                        fontSize: '1rem',
                        fontWeight: 500,
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft />}
          onClick={() => handleQuestionNavigation('prev')}
          disabled={currentQuestionIndex === 0}
        >
          Oldingi savol
        </Button>

        <Typography variant="body2" sx={{ color: '#374151', fontWeight: 700 }}>
          {currentQuestionIndex + 1} / {questions.length}
        </Typography>

        <Button
          variant="outlined"
          endIcon={<ArrowRight />}
          onClick={() => handleQuestionNavigation('next')}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          Keyingi savol
        </Button>
      </Box>

      {/* Submit Button */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          bgcolor: '#ffffff',
          textAlign: 'center',
          position: { xs: 'sticky', md: 'static' },
          bottom: 0,
          zIndex: 5,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#111827', fontWeight: 800 }}>
            Testni topshirishga tayyormisiz?
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: '#374151' }}>
            Barcha savollarga javob berganingizga ishonch hosil qiling
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmitTest}
            disabled={submitting || answeredCount === 0 || Boolean(results)}
            startIcon={results ? <CircleCheck /> : <Send />}
            sx={{ minWidth: 200 }}
          >
            {results ? 'Test yakunlangan' : (submitting ? 'Yuborilmoqda...' : 'Testni topshirish')}
          </Button>
          {answeredCount === 0 && (
            <Typography variant="body2" sx={{ mt: 2, color: 'error.main' }}>
              Yakunlash uchun kamida bitta javob belgilang.
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Results Dialog */}
      <Dialog open={showResults} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircleCheck sx={{ mr: 1, color: 'success.main' }} />
            Test natijalari
          </Box>
        </DialogTitle>
        <DialogContent>
          {results && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {results.score}% - {results.score >= 70 ? 'O\'tdi' : 'O\'tmadi'}
              </Typography>

              <Box sx={{ my: 3 }}>
                <Chip
                  label={`${results.correct_answers}/${results.total_questions} to'g'ri`}
                  color={results.score >= 70 ? 'success' : 'error'}
                  size="large"
                />
              </Box>

              <Typography variant="body1" sx={{ mb: 2 }}>
                Siz {results.total_questions} ta savoldan {results.correct_answers} tasiga to'g'ri javob berdingiz.
              </Typography>

              {results.score >= 70 ? (
                <Typography variant="body2" color="success.main">
                  Tabriklaymiz! Siz testdan muvaffaqiyatli o'tdingiz.
                </Typography>
              ) : (
                <Typography variant="body2" color="error.main">
                  Testdan o'ta olmadingiz. Qayta urinib ko'ring.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/dashboard')}>
            Dashboard'ga qaytish
          </Button>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
          >
            Qayta topshirish
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default TestPage
