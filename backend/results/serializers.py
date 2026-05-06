from rest_framework import serializers
from .models import TestResult
from users.serializers import UserSerializer
from tests.serializers import TestSerializer

class TestResultSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    test = TestSerializer(read_only=True)

    class Meta:
        model = TestResult
        fields = '__all__'