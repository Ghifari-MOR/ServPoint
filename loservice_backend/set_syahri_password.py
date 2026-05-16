#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'renamennti_backend.settings')
django.setup()

from account.models import User

# Set password for Syahri
syahri = User.objects.filter(email='Syahri@gmail.com').first()
if syahri:
    syahri.set_password('test1234')
    syahri.save()
    print(f"✓ Password set for {syahri.email}: test1234")
else:
    print("User not found!")
