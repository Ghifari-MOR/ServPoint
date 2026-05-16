#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'renamennti_backend.settings')
django.setup()

from account.models import User
from account.serializer import UserSerializer
from rest_framework.test import APIRequestFactory

# Create a mock request with valid host
factory = APIRequestFactory()
request = factory.get('http://127.0.0.1:8000/api/users/', HTTP_HOST='127.0.0.1:8000')

# Get user with profile picture
user = User.objects.filter(profile_picture__isnull=False).exclude(profile_picture='').first()

if user:
    print(f"Testing user: {user.email}\n")
    
    # Test serializer with context
    serializer = UserSerializer(user, context={'request': request})
    data = serializer.data
    
    print("Serialized data WITH context:")
    print(json.dumps({
        'email': data.get('email'),
        'name': data.get('name'),
        'profile_picture': data.get('profile_picture'),
        'profile_picture_url': data.get('profile_picture_url'),
    }, indent=2))
    
    # Test without context (to show the difference)
    print("\n\nSerialized data WITHOUT context:")
    serializer_no_context = UserSerializer(user)
    data_no_context = serializer_no_context.data
    print(json.dumps({
        'email': data_no_context.get('email'),
        'name': data_no_context.get('name'),
        'profile_picture': data_no_context.get('profile_picture'),
        'profile_picture_url': data_no_context.get('profile_picture_url'),
    }, indent=2))
else:
    print("No users with profile pictures found")
