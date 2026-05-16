#!/usr/bin/env python
import os
import django
from django.contrib.auth import authenticate

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'renamennti_backend.settings')
django.setup()

from account.models import User

# List all users
print("=" * 60)
print("All Users in Database")
print("=" * 60)

users = User.objects.all()
for user in users:
    print(f"\nEmail: {user.email}")
    print(f"  Username: {user.username}")
    print(f"  Name: {user.name}")
    print(f"  Role: {user.role}")
    print(f"  Has usable password: {user.has_usable_password()}")
    print(f"  Is active: {user.is_active}")

# Try to authenticate Syahri with different approaches
print("\n\n" + "=" * 60)
print("Testing Authentication for Syahri")
print("=" * 60)

syahri = User.objects.filter(email='Syahri@gmail.com').first()
if syahri:
    print(f"\nFound user: {syahri.email}")
    print(f"  Username: {syahri.username}")
    print(f"  Has usable password: {syahri.has_usable_password()}")
    
    # Try to authenticate
    result = authenticate(username=syahri.email, password='password')
    print(f"\n  Authenticate with 'password': {result}")
    
    # Try with username
    result = authenticate(username=syahri.username, password='password')
    print(f"  Authenticate with username 'password': {result}")
    
    # Check raw password hash
    print(f"\n  Password hash starts with: {syahri.password[:20]}...")
else:
    print("\nSyahri user not found!")
