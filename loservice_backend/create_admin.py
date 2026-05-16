#!/usr/bin/env python
import os
import django
from django.contrib.auth import get_user_model

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'renamennti_backend.settings')
django.setup()

User = get_user_model()

# Create admin user
email = 'admin@lokator.com'
username = 'admin'
password = 'Admin@123456'
name = 'Administrator'

# Check if admin exists
if User.objects.filter(email=email).exists():
    print(f"Admin user with email {email} already exists!")
else:
    admin = User.objects.create_superuser(
        email=email,
        username=username,
        password=password,
        name=name,
        role='ADMIN'
    )
    print(f"✓ Admin user created successfully!")
    print(f"  Email: {email}")
    print(f"  Password: {password}")
    print(f"  Access Django Admin at: http://127.0.0.1:8000/admin/")
