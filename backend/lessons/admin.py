from django.contrib import admin
from .models import Lesson, LessonContent

class LessonContentInline(admin.TabularInline):
    model = LessonContent
    extra = 1

class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'has_test')
    list_filter = ('course',)
    search_fields = ('title', 'description')
    ordering = ('course', 'order')
    inlines = [LessonContentInline]

admin.site.register(Lesson, LessonAdmin)
admin.site.register(LessonContent)
