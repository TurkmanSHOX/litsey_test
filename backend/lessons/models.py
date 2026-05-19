from django.db import models

class Lesson(models.Model):
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField()
    duration = models.CharField(max_length=20, blank=True, null=True)  # "30 min", "1 soat" kabi
    has_test = models.BooleanField(default=False)
    test = models.OneToOneField('tests.Test', on_delete=models.SET_NULL, null=True, blank=True, related_name='lesson_test')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        unique_together = ['course', 'order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class LessonContent(models.Model):
    CONTENT_TYPES = [
        ('text', 'Matn'),
        ('video', 'Video'),
        ('image', 'Rasm'),
        ('file', 'Fayl'),
    ]

    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='content')
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)  # Matn kontenti uchun
    content_type = models.CharField(max_length=10, choices=CONTENT_TYPES, default='text')
    file = models.FileField(upload_to='lesson_content/', blank=True, null=True)
    url = models.URLField(blank=True, null=True)  # Video yoki boshqa URL uchun
    order = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']
        unique_together = ['lesson', 'order']

    def __str__(self):
        return f"{self.lesson.title} - {self.title}"
