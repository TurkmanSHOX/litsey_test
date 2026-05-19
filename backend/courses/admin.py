from django.contrib import admin
from .models import Course

class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'level', 'duration', 'created_at')
    list_filter = ('level', 'created_at')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at',)

admin.site.register(Course, CourseAdmin)
