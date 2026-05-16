#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'renamennti_backend.settings')
django.setup()

from account.models import User, UMKM
from account.serializer import UMKMReviewSerializer
from rest_framework.test import APIRequestFactory

# Create a mock request with valid host
factory = APIRequestFactory()
request = factory.post('http://127.0.0.1:8000/api/umkm-reviews/', 
                       HTTP_HOST='127.0.0.1:8000',
                       HTTP_AUTHORIZATION='Bearer token_here')

# Get a user
user = User.objects.filter(email='Syahri@gmail.com').first()
if not user:
    print("User not found!")
    exit(1)

# Get an UMKM
umkm = UMKM.objects.first()
if not umkm:
    print("UMKM not found!")
    exit(1)

print(f"Testing with user: {user.email}")
print(f"Testing with UMKM: {umkm.nama_umkm} (ID: {umkm.umkm_id})\n")

# Test data (same as frontend)
test_data = {
    'umkm': str(umkm.umkm_id),  # Frontend sends UUID as string
    'rating': 5,
    'comment': 'Test ulasan'
}

print("Request data:")
print(json.dumps(test_data, indent=2))
print()

# Test serializer validation
serializer = UMKMReviewSerializer(data=test_data, context={'request': request})

if serializer.is_valid():
    print("✓ Serializer is VALID")
    print("\nValidated data:")
    print(json.dumps(serializer.validated_data, indent=2, default=str))
else:
    print("✗ Serializer validation FAILED")
    print("\nErrors:")
    print(json.dumps(serializer.errors, indent=2))
