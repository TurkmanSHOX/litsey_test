from django.contrib import admin
from .models import Test, Question

class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1

class TestAdmin(admin.ModelAdmin):
    list_display = ('title', 'lesson', 'time_limit', 'passing_score', 'is_active')
    list_filter = ('lesson__course',)
    search_fields = ('title',)
    inlines = [QuestionInline]

admin.site.register(Test, TestAdmin)
admin.site.register(Question)
