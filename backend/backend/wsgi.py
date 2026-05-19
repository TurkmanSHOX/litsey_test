"""
WSGI config for backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
import django
from django.core.wsgi import get_wsgi_application
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
os.environ.setdefault('ENVIRONMENT', 'production')

django.setup()
application = get_wsgi_application()

# WhiteNoise configuration for static files
if settings.STATICFILES_STORAGE == 'whitenoise.storage.CompressedManifestStaticFilesStorage':
    from whitenoise import WhiteNoise
    application = WhiteNoise(application, root=settings.STATIC_ROOT)
