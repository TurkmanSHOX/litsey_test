from django.db import models

class Course(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Boshlang\'ich'),
        ('intermediate', 'O\'rta'),
        ('advanced', 'Yuqori'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    instructor = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='courses')
    level = models.CharField(max_length=15, choices=LEVEL_CHOICES, default='beginner')
    image = models.ImageField(upload_to='courses/', blank=True, null=True)
    duration = models.CharField(max_length=50, blank=True, null=True)  # "3 oy", "6 hafta" kabi
    semester = models.CharField(max_length=50, blank=True, null=True)
    objectives = models.TextField(blank=True, null=True)  # O'rganish maqsadlari
    expected_outcomes = models.TextField(blank=True, null=True)  # Kutilayotgan natijalar
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
