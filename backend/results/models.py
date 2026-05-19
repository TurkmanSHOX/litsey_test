from django.db import models

class TestResult(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='test_results')
    test = models.ForeignKey('tests.Test', on_delete=models.CASCADE, related_name='results')
    score = models.FloatField()  # foizda
    total_questions = models.PositiveIntegerField()
    correct_answers = models.PositiveIntegerField()
    wrong_answers = models.PositiveIntegerField()
    time_taken = models.PositiveIntegerField(blank=True, null=True)  # soniyalarda
    answers = models.JSONField(blank=True, null=True)  # foydalanuvchi javoblari
    completed_at = models.DateTimeField(auto_now_add=True)
    is_passed = models.BooleanField(default=False)

    class Meta:
        unique_together = ['user', 'test']
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.user.username} - {self.test.title} - {self.score}%"

    def save(self, *args, **kwargs):
        self.is_passed = self.score >= self.test.passing_score
        super().save(*args, **kwargs)
