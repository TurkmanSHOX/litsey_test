from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsTeacher
from .models import Test, Question
from .serializers import TestSerializer, QuestionSerializer

class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsTeacher()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get test questions"""
        test = self.get_object()
        questions = Question.objects.filter(test=test).order_by('order')
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

    @questions.mapping.post
    def add_question(self, request, pk=None):
        if request.user.role not in ['teacher', 'admin']:
            return Response({'detail': 'Ruxsat yo\'q'}, status=status.HTTP_403_FORBIDDEN)
        test = self.get_object()
        serializer = QuestionSerializer(data={**request.data, 'test': test.id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        test = serializer.save()
        lesson = test.lesson
        lesson.test = test
        lesson.has_test = True
        lesson.save(update_fields=['test', 'has_test', 'updated_at'])

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit test answers"""
        test = self.get_object()
        answers = request.data.get('answers', {})

        # Calculate score
        questions = Question.objects.filter(test=test)
        correct_answers = 0
        total_questions = questions.count()

        for question in questions:
            user_answer = answers.get(str(question.id), '')
            if user_answer == question.correct_answer:
                correct_answers += 1

        score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0

        # Save result
        from results.models import TestResult
        result, _ = TestResult.objects.update_or_create(
            user=request.user,
            test=test,
            defaults={
                'score': score,
                'correct_answers': correct_answers,
                'total_questions': total_questions,
                'wrong_answers': max(total_questions - correct_answers, 0),
                'answers': answers,
            }
        )

        return Response({
            'id': result.id,
            'score': round(score, 1),
            'correct_answers': correct_answers,
            'total_questions': total_questions,
            'passed': score >= 70
        })
