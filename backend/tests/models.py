from django.db import models

class Test(models.Model):
    lesson = models.ForeignKey('lessons.Lesson', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    questions = models.JSONField()  # JSON list of questions

    def __str__(self):
        return self.title
