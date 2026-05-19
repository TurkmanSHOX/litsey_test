from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from users.permissions import IsTeacher, IsOwnerOrAdmin
from .models import Lesson, LessonContent
from .serializers import LessonSerializer, LessonContentSerializer

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsTeacher()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Lesson.objects.all()
        course_id = self.request.query_params.get('course', None)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset.order_by('order')

    @action(detail=True, methods=['get'])
    def content(self, request, pk=None):
        """Get lesson content"""
        lesson = self.get_object()
        content = LessonContent.objects.filter(lesson=lesson).order_by('order')
        serializer = LessonContentSerializer(content, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher], parser_classes=[MultiPartParser, FormParser, JSONParser])
    def add_content(self, request, pk=None):
        lesson = self.get_object()
        serializer = LessonContentSerializer(data={**request.data, 'lesson': lesson.id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def test(self, request, pk=None):
        """Get lesson test"""
        lesson = self.get_object()
        if lesson.test:
            from tests.serializers import TestSerializer
            serializer = TestSerializer(lesson.test)
            return Response(serializer.data)
        return Response({'detail': 'Test mavjud emas'}, status=status.HTTP_404_NOT_FOUND)
