from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewViewSet

router = DefaultRouter()
router.register(r'analytics', CourseViewViewSet)

urlpatterns = [
    path('', include(router.urls)),
]