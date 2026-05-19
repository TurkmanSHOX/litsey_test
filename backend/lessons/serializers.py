from rest_framework import serializers
from .models import Lesson, LessonContent

class LessonContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonContent
        fields = '__all__'

class LessonSerializer(serializers.ModelSerializer):
    content_count = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = '__all__'

    def get_content_count(self, obj):
        return obj.content.count()