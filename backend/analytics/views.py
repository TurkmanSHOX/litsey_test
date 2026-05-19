from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg, Q
from .models import CourseView
from .serializers import CourseViewSerializer

class CourseViewViewSet(viewsets.ModelViewSet):
    queryset = CourseView.objects.all()
    serializer_class = CourseViewSerializer

    @action(detail=False, methods=['get'])
    def user_stats(self, request):
        """Foydalanuvchi statistikasi"""
        user = request.user

        from lessons.models import Lesson
        from results.models import TestResult
        from courses.models import Course
        from tests.models import Test
        from users.models import User
        from .models import LessonProgress

        total_courses = Course.objects.count()
        completed_lessons = LessonProgress.objects.filter(user=user, completed=True).count()
        total_tests = TestResult.objects.filter(user=user).count()
        avg_score = TestResult.objects.filter(user=user).aggregate(avg=Avg('score'))['avg'] or 0
        payload = {
            'total_courses_enrolled': total_courses,
            'total_lessons_completed': completed_lessons,
            'total_tests_taken': total_tests,
            'average_score': round(avg_score, 1)
        }

        if user.role == 'admin':
            payload.update({
                'total_users': User.objects.count(),
                'total_students': User.objects.filter(role='student').count(),
                'total_teachers': User.objects.filter(role='teacher').count(),
                'total_admins': User.objects.filter(role='admin').count(),
                'total_courses': total_courses,
                'total_lessons': Lesson.objects.count(),
                'total_tests': Test.objects.count(),
                'total_results': TestResult.objects.count(),
                'platform_average_score': round(TestResult.objects.aggregate(avg=Avg('score'))['avg'] or 0, 1),
            })

        return Response(payload)

    @action(detail=True, methods=['get'], url_path='progress')
    def course_progress(self, request, pk=None):
        """Kurs progressi"""
        user = request.user
        course_id = pk

        from courses.models import Course
        from lessons.models import Lesson

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Kurs topilmadi'}, status=status.HTTP_404_NOT_FOUND)

        lessons = Lesson.objects.filter(course=course)
        total_lessons = lessons.count()

        # Tugagan darslar
        completed_lessons_ids = []
        completed_lessons = 0

        # Bu yerda progress logikasini qo'shish kerak
        # Hozircha oddiy hisoblash
        completed_lessons = 0  # Placeholder

        return Response({
            'course_id': course_id,
            'total_lessons': total_lessons,
            'completed_lessons': completed_lessons,
            'completed_lessons_ids': completed_lessons_ids,
            'progress_percentage': (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
        })

    @action(detail=True, methods=['get'], url_path='lesson_progress')
    def lesson_progress(self, request, pk=None):
        """Dars progressi"""
        user = request.user
        lesson_id = pk

        from lessons.models import Lesson

        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({'error': 'Dars topilmadi'}, status=status.HTTP_404_NOT_FOUND)

        # Bu yerda lesson progress logikasini qo'shish kerak
        # Hozircha false qaytaramiz
        return Response({
            'lesson_id': lesson_id,
            'completed': False,
            'last_position': 0
        })

    @action(detail=True, methods=['post'], url_path='complete_lesson')
    def complete_lesson(self, request, pk=None):
        """Darsni tugagan deb belgilash"""
        user = request.user
        lesson_id = pk

        from lessons.models import Lesson

        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({'error': 'Dars topilmadi'}, status=status.HTTP_404_NOT_FOUND)

        # Bu yerda completion logikasini qo'shish kerak
        # Hozircha muvaffaqiyat qaytaramiz
        return Response({
            'message': 'Dars muvaffaqiyatli tugagan deb belgilandi',
            'lesson_id': lesson_id
        })
