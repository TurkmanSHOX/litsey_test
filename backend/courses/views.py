from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from users.permissions import IsTeacher, IsAdmin, IsOwnerOrAdmin
from .models import Course
from .serializers import CourseSerializer

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [IsAuthenticated(), IsTeacher()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsOwnerOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Course.objects.all()
        search = self.request.query_params.get('search', None)
        level = self.request.query_params.get('level', None)
        instructor = self.request.query_params.get('instructor', None)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )
        if level:
            queryset = queryset.filter(level=level)
        if instructor:
            queryset = queryset.filter(instructor__username__icontains=instructor)

        return queryset

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=False, methods=['get'])
    def my_courses(self, request):
        """O'qituvchi uchun o'z kurslari"""
        if request.user.role in ['teacher', 'admin']:
            courses = Course.objects.filter(instructor=request.user)
        else:
            # O'quvchi uchun barcha kurslar
            courses = Course.objects.all()
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """Kursga yozilish"""
        course = self.get_object()
        # Bu yerda enrollment logikasini qo'shish mumkin
        return Response({'message': f'{course.title} kursiga yozildingiz'})

    @action(detail=True, methods=['get'])
    def lessons(self, request, pk=None):
        """Get course lessons"""
        course = self.get_object()
        from lessons.serializers import LessonSerializer
        lessons = course.lessons.all().order_by('order')
        serializer = LessonSerializer(lessons, many=True)
        return Response(serializer.data)
