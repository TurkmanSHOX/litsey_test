from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsAdmin
from .models import TestResult
from .serializers import TestResultSerializer

class TestResultViewSet(viewsets.ModelViewSet):
    queryset = TestResult.objects.all()
    serializer_class = TestResultSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return TestResult.objects.select_related('user', 'test', 'test__lesson').all()
        return TestResult.objects.select_related('user', 'test', 'test__lesson').filter(user=self.request.user)
