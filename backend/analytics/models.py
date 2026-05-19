from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class CourseView(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_views')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='views')
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'course']

    def __str__(self):
        return f"{self.user.username} viewed {self.course.title}"

class LessonProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey('lessons.Lesson', on_delete=models.CASCADE, related_name='progress')
    completed = models.BooleanField(default=False)
    time_spent = models.PositiveIntegerField(default=0)  # soniyalarda
    last_accessed = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ['user', 'lesson']

    def __str__(self):
        return f"{self.user.username} - {self.lesson.title} - {'Completed' if self.completed else 'In Progress'}"

class UserAnalytics(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='analytics')
    total_tests_taken = models.PositiveIntegerField(default=0)
    average_score = models.FloatField(default=0.0)
    total_time_spent = models.PositiveIntegerField(default=0)  # soniyalarda
    courses_completed = models.PositiveIntegerField(default=0)
    lessons_completed = models.PositiveIntegerField(default=0)
    streak_days = models.PositiveIntegerField(default=0)
    last_activity = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} Analytics"

    def update_stats(self):
        results = self.user.test_results.all()
        if results:
            self.total_tests_taken = results.count()
            self.average_score = sum(r.score for r in results) / self.total_tests_taken
        else:
            self.total_tests_taken = 0
            self.average_score = 0.0

        progress = self.user.lesson_progress.filter(completed=True)
        self.lessons_completed = progress.count()

        # Kurslarni tugaganini hisoblash (barcha darslari tugagan kurslar)
        completed_courses = 0
        for course in self.user.course_views.values_list('course', flat=True).distinct():
            total_lessons = course.lessons.count()
            completed_lessons = progress.filter(lesson__course=course).count()
            if total_lessons > 0 and completed_lessons == total_lessons:
                completed_courses += 1
        self.courses_completed = completed_courses

        self.save()
