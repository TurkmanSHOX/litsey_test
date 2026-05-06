from rest_framework import viewsets
from .models import TestResult
from .serializers import TestResultSerializer

class TestResultViewSet(viewsets.ModelViewSet):
    queryset = TestResult.objects.all()
    serializer_class = TestResultSerializer
