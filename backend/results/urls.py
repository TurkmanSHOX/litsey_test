from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TestResultViewSet

router = DefaultRouter()
router.register(r'results', TestResultViewSet)

urlpatterns = [
    path('', include(router.urls)),
]