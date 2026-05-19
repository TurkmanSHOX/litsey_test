from django.db import models

class Test(models.Model):
    lesson = models.OneToOneField('lessons.Lesson', on_delete=models.CASCADE, related_name='lesson_test')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    time_limit = models.PositiveIntegerField(default=30)  # daqiqalarda
    passing_score = models.PositiveIntegerField(default=70)  # foizda
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.lesson.title} - {self.title}"

    def get_total_questions(self):
        return self.questions.count()

class Question(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    options = models.JSONField()  # ["variant1", "variant2", "variant3", "variant4"]
    correct_answer = models.CharField(max_length=500)  # to'g'ri javob matni
    order = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']
        unique_together = ['test', 'order']

    def __str__(self):
        return f"{self.test.title} - Question {self.order}"
