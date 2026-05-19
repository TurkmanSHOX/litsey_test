from rest_framework import serializers
from .models import Test, Question

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class TestSerializer(serializers.ModelSerializer):
    total_questions = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = '__all__'

    def get_total_questions(self, obj):
        return obj.get_total_questions()