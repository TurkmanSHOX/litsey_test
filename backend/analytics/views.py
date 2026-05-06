from rest_framework import viewsets
from .models import CourseView
from .serializers import CourseViewSerializer

class CourseViewViewSet(viewsets.ModelViewSet):
    queryset = CourseView.objects.all()
    serializer_class = CourseViewSerializer
