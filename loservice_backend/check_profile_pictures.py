#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'renamennti_backend.settings')
django.setup()

from account.models import User

# Check users dengan profile_picture
users = User.objects.filter(profile_picture__isnull=False).exclude(profile_picture='')
print(f"Total users dengan profile_picture: {users.count()}\n")

for user in users[:10]:
    print(f"User: {user.email} (ID: {user.user_id})")
    print(f"  profile_picture field: {user.profile_picture}")
    print(f"  profile_picture.name: {user.profile_picture.name}")
    if user.profile_picture:
        try:
            print(f"  profile_picture.url: {user.profile_picture.url}")
            print(f"  profile_picture.path: {user.profile_picture.path}")
            # Check if file actually exists
            file_exists = os.path.exists(user.profile_picture.path)
            print(f"  File exists: {file_exists}")
        except Exception as e:
            print(f"  Error accessing URL/path: {e}")
    print()
