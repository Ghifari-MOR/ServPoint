#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'renamennti_backend.settings')
django.setup()

from account.models import User, UMKM, UMKMReview
from rest_framework.test import APIRequestFactory, force_authenticate
from account.api_views import UMKMReviewViewSet
from rest_framework.request import Request as DRFRequest

# Create a mock request
factory = APIRequestFactory()
post_request = factory.post(
    'http://127.0.0.1:8000/api/umkm-reviews/',
    {
        'umkm': '87d1412e-92e6-4a1d-b4e7-54a641e8c9ea',
        'rating': 5,
        'comment': 'Test ulasan dari script'
    },
    format='json',
    HTTP_HOST='127.0.0.1:8000'
)

# Get user and authenticate
user = User.objects.filter(email='Syahri@gmail.com').first()
force_authenticate(post_request, user=user)

# Create DRF request
drf_request = DRFRequest(post_request)

print(f"Authenticated user: {drf_request.user.email}")
print(f"User role: {drf_request.user.role}\n")

# Call the viewset
viewset = UMKMReviewViewSet()
viewset.request = drf_request
viewset.format_kwarg = None

# Try to create
try:
    response = viewset.create(drf_request)
    print("✓ Review created successfully!")
    print("\nResponse data:")
    print(json.dumps(response.data, indent=2, default=str))
except Exception as e:
    print(f"✗ Error creating review: {e}")
    import traceback
    traceback.print_exc()

# Check if review was actually created
reviews_count = UMKMReview.objects.filter(user=user).count()
print(f"\n\nTotal reviews by {user.email}: {reviews_count}")
