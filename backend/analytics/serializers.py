from rest_framework import serializers
from .models import CourseView
from users.serializers import UserSerializer
from courses.serializers import CourseSerializer

class CourseViewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)

    class Meta:
        model = CourseView
        fields = '__all__'