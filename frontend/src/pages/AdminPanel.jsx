import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { BookOpen, ClipboardList, FileImage, Plus, Users } from 'lucide-react'
import API from '../services/api'
import { useAuth } from '../context/AuthContext'

const emptyCourse = { title: '', description: '', level: 'beginner', duration: '', semester: '', objectives: '', expected_outcomes: '', image: null }
const emptyLesson = { course: '', title: '', description: '', order: 1, duration: '35 daqiqa', contentTitle: '', content: '', file: null }
const emptyTest = { lesson: '', title: '', description: '', time_limit: 15, passing_score: 70 }
const emptyQuestion = { test: '', question_text: '', options: 'Variant A\nVariant B\nVariant C\nVariant D', correct_answer: 'Variant A', order: 1 }

const AdminPanel = () => {
  const { isAdmin } = useAuth()
  const [tab, setTab] = useState(0)
  const [courses, setCourses] = useState([])
  const [lessons, setLessons] = useState([])
  const [tests, setTests] = useState([])
  const [results, setResults] = useState([])
  const [users, setUsers] = useState([])
  const [courseForm, setCourseForm] = useState(emptyCourse)
  const [lessonForm, setLessonForm] = useState(emptyLesson)
  const [testForm, setTestForm] = useState(emptyTest)
  const [questionForm, setQuestionForm] = useState(emptyQuestion)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const lessonsWithoutTest = lessons.filter((lesson) => !lesson.test)

  useEffect(() => {
    if (isAdmin) {
      loadAdminData()
    }
  }, [isAdmin])

  const loadAdminData = async () => {
    try {
      setError('')
      const [coursesRes, lessonsRes, testsRes, resultsRes, usersRes] = await Promise.all([
        API.get('/courses/'),
        API.get('/lessons/'),
        API.get('/tests/'),
        API.get('/results/'),
        API.get('/users/'),
      ])
      setCourses(coursesRes.data)
      setLessons(lessonsRes.data)
      setTests(testsRes.data)
      setResults(resultsRes.data)
      setUsers(usersRes.data)
    } catch (err) {
      console.error('Admin data error:', err)
      setError('Admin ma\'lumotlarini yuklab bo\'lmadi')
    }
  }

  const showSuccess = (text) => {
    setMessage(text)
    setError('')
    setTimeout(() => setMessage(''), 2500)
  }

  const createCourse = async (event) => {
    event.preventDefault()
    try {
      const data = new FormData()
      Object.entries(courseForm).forEach(([key, value]) => {
        if (value !== null && value !== '') data.append(key, value)
      })
      await API.post('/courses/', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setCourseForm(emptyCourse)
      await loadAdminData()
      showSuccess('Kurs va rasm saqlandi')
    } catch (err) {
      console.error('Course create error:', err)
      setError('Kurs qo\'shishda xatolik')
    }
  }

  const createLesson = async (event) => {
    event.preventDefault()
    try {
      const lessonRes = await API.post('/lessons/', {
        course: lessonForm.course,
        title: lessonForm.title,
        description: lessonForm.description,
        order: lessonForm.order,
        duration: lessonForm.duration,
      })

      const contentData = new FormData()
      contentData.append('title', lessonForm.contentTitle || `${lessonForm.title} kontenti`)
      contentData.append('content', lessonForm.content)
      contentData.append('content_type', lessonForm.file ? 'image' : 'text')
      contentData.append('order', 1)
      if (lessonForm.file) contentData.append('file', lessonForm.file)
      await API.post(`/lessons/${lessonRes.data.id}/add_content/`, contentData, { headers: { 'Content-Type': 'multipart/form-data' } })

      setLessonForm(emptyLesson)
      await loadAdminData()
      showSuccess('Mavzu va kontent qo\'shildi')
    } catch (err) {
      console.error('Lesson create error:', err)
      setError('Mavzu qo\'shishda xatolik')
    }
  }

  const createTest = async (event) => {
    event.preventDefault()
    try {
      await API.post('/tests/', testForm)
      setTestForm(emptyTest)
      await loadAdminData()
      showSuccess('Test qo\'shildi')
    } catch (err) {
      console.error('Test create error:', err)
      setError('Test qo\'shishda xatolik')
    }
  }

  const createQuestion = async (event) => {
    event.preventDefault()
    try {
      const options = questionForm.options.split('\n').map((item) => item.trim()).filter(Boolean)
      await API.post(`/tests/${questionForm.test}/questions/`, {
        question_text: questionForm.question_text,
        options,
        correct_answer: questionForm.correct_answer,
        order: questionForm.order,
      })
      setQuestionForm({ ...emptyQuestion, test: questionForm.test, order: Number(questionForm.order) + 1 })
      await loadAdminData()
      showSuccess('Savol qo\'shildi')
    } catch (err) {
      console.error('Question create error:', err)
      setError('Savol qo\'shishda xatolik')
    }
  }

  const updateUser = async (user, updates) => {
    try {
      await API.patch(`/users/${user.id}/`, updates)
      await loadAdminData()
      showSuccess(`${user.username} yangilandi`)
    } catch (err) {
      console.error('User update error:', err)
      setError('Foydalanuvchini yangilab bo\'lmadi')
    }
  }

  if (!isAdmin) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Bu sahifa faqat admin uchun.</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 5, textAlign: 'left' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin panel
        </Typography>
        <Typography color="text.secondary">
          Fan, mavzu, rasm, test, natija va foydalanuvchilarni shu yerdan boshqaring.
        </Typography>
      </Paper>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<BookOpen size={18} />} iconPosition="start" label="Fan va mavzu" />
          <Tab icon={<ClipboardList size={18} />} iconPosition="start" label="Testlar" />
          <Tab icon={<Users size={18} />} iconPosition="start" label="Natijalar" />
          <Tab icon={<Users size={18} />} iconPosition="start" label="Foydalanuvchilar" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Fan qo'shish</Typography>
                <Box component="form" onSubmit={createCourse} sx={{ display: 'grid', gap: 2 }}>
                  <TextField label="Fan nomi" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required />
                  <TextField label="Tavsif" multiline rows={3} value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} required />
                  <FormControl>
                    <InputLabel>Daraja</InputLabel>
                    <Select label="Daraja" value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}>
                      <MenuItem value="beginner">Boshlang'ich</MenuItem>
                      <MenuItem value="intermediate">O'rta</MenuItem>
                      <MenuItem value="advanced">Yuqori</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField label="Davomiyligi" value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} />
                  <TextField label="Semestr" value={courseForm.semester} onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })} />
                  <TextField label="Maqsadlar" multiline rows={3} value={courseForm.objectives} onChange={(e) => setCourseForm({ ...courseForm, objectives: e.target.value })} />
                  <Button component="label" variant="outlined" startIcon={<FileImage />}>
                    Fan rasmi yuklash
                    <input hidden type="file" accept="image/*" onChange={(e) => setCourseForm({ ...courseForm, image: e.target.files?.[0] || null })} />
                  </Button>
                  {courseForm.image && <Chip label={courseForm.image.name} />}
                  <Button type="submit" variant="contained" startIcon={<Plus />}>Fan qo'shish</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Mavzu qo'shish</Typography>
                <Box component="form" onSubmit={createLesson} sx={{ display: 'grid', gap: 2 }}>
                  <FormControl required>
                    <InputLabel>Fan</InputLabel>
                    <Select label="Fan" value={lessonForm.course} onChange={(e) => setLessonForm({ ...lessonForm, course: e.target.value })}>
                      {courses.map((course) => <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField label="Mavzu nomi" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} required />
                  <TextField label="Qisqa tavsif" value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} />
                  <TextField label="Tartib raqami" type="number" value={lessonForm.order} onChange={(e) => setLessonForm({ ...lessonForm, order: e.target.value })} required />
                  <TextField label="Kontent sarlavhasi" value={lessonForm.contentTitle} onChange={(e) => setLessonForm({ ...lessonForm, contentTitle: e.target.value })} />
                  <TextField label="Mavzu matni" multiline rows={5} value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} />
                  <Button component="label" variant="outlined" startIcon={<FileImage />}>
                    Mavzu rasmi yuklash
                    <input hidden type="file" accept="image/*" onChange={(e) => setLessonForm({ ...lessonForm, file: e.target.files?.[0] || null })} />
                  </Button>
                  {lessonForm.file && <Chip label={lessonForm.file.name} />}
                  <Button type="submit" variant="contained" startIcon={<Plus />}>Mavzu qo'shish</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Test qo'shish</Typography>
                <Box component="form" onSubmit={createTest} sx={{ display: 'grid', gap: 2 }}>
                  <FormControl required>
                    <InputLabel>Mavzu</InputLabel>
                    <Select label="Mavzu" value={testForm.lesson} onChange={(e) => setTestForm({ ...testForm, lesson: e.target.value })}>
                      {lessonsWithoutTest.map((lesson) => <MenuItem key={lesson.id} value={lesson.id}>{lesson.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                  {lessonsWithoutTest.length === 0 && (
                    <Alert severity="info">Hamma mavzularga test biriktirilgan. Yangi test uchun avval yangi mavzu qo'shing.</Alert>
                  )}
                  <TextField label="Test nomi" value={testForm.title} onChange={(e) => setTestForm({ ...testForm, title: e.target.value })} required />
                  <TextField label="Tavsif" value={testForm.description} onChange={(e) => setTestForm({ ...testForm, description: e.target.value })} />
                  <TextField label="Vaqt limiti (daqiqa)" type="number" value={testForm.time_limit} onChange={(e) => setTestForm({ ...testForm, time_limit: e.target.value })} />
                  <TextField label="O'tish bali (%)" type="number" value={testForm.passing_score} onChange={(e) => setTestForm({ ...testForm, passing_score: e.target.value })} />
                  <Button type="submit" variant="contained">Test qo'shish</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Savol qo'shish</Typography>
                <Box component="form" onSubmit={createQuestion} sx={{ display: 'grid', gap: 2 }}>
                  <FormControl required>
                    <InputLabel>Test</InputLabel>
                    <Select label="Test" value={questionForm.test} onChange={(e) => setQuestionForm({ ...questionForm, test: e.target.value })}>
                      {tests.map((test) => <MenuItem key={test.id} value={test.id}>{test.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField label="Savol matni" value={questionForm.question_text} onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })} required />
                  <TextField label="Variantlar (har qatorga bittadan)" multiline rows={4} value={questionForm.options} onChange={(e) => setQuestionForm({ ...questionForm, options: e.target.value })} required />
                  <TextField label="To'g'ri javob matni" value={questionForm.correct_answer} onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })} required />
                  <TextField label="Tartib raqami" type="number" value={questionForm.order} onChange={(e) => setQuestionForm({ ...questionForm, order: e.target.value })} />
                  <Button type="submit" variant="contained">Savol qo'shish</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 2 && (
        <Paper sx={{ overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>O'quvchi</TableCell>
                <TableCell>Test</TableCell>
                <TableCell>Ball</TableCell>
                <TableCell>To'g'ri</TableCell>
                <TableCell>Sana</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>{result.user?.username}</TableCell>
                  <TableCell>{result.test?.title}</TableCell>
                  <TableCell>{result.score}%</TableCell>
                  <TableCell>{result.correct_answers}/{result.total_questions}</TableCell>
                  <TableCell>{new Date(result.completed_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {tab === 3 && (
        <Paper sx={{ overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Ism</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Holat</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.username}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.first_name} {item.last_name}</TableCell>
                  <TableCell>
                    <Select size="small" value={item.role} onChange={(e) => updateUser(item, { role: e.target.value })}>
                      <MenuItem value="student">O'quvchi</MenuItem>
                      <MenuItem value="teacher">O'qituvchi</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select size="small" value={item.is_active ? 'active' : 'blocked'} onChange={(e) => updateUser(item, { is_active: e.target.value === 'active' })}>
                      <MenuItem value="active">Faol</MenuItem>
                      <MenuItem value="blocked">Bloklangan</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  )
}

export default AdminPanel
