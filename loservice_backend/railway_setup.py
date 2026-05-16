#!/usr/bin/env python
"""
Railway Production Setup Script
Run this script di Railway shell after first deployment
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'renamennti_backend.settings')
django.setup()

from account.models import User, Kategori

print("=" * 60)
print("RAILWAY PRODUCTION SETUP")
print("=" * 60)

# 1. Run migrations
print("\n1. Running migrations...")
os.system('python manage.py migrate')

# 2. Create admin user
print("\n2. Creating admin user...")
admin_email = 'admin@loservice.local'
if not User.objects.filter(email=admin_email).exists():
    User.objects.create_superuser(
        username='admin',
        email=admin_email,
        password='DjyDnZckHPk2fELvZuUclQ',
        name='Administrator',
        role='ADMIN'
    )
    print(f"✓ Admin user created: {admin_email}")
else:
    print(f"✓ Admin user already exists: {admin_email}")

# 3. Create categories
print("\n3. Creating production categories...")
categories_data = [
    'Servis Laptop & Komputer',
    'Servis Smartphone',
    'Jasa Pembersihan',
    'Jasa Perbaikan',
    'Jasa Konstruksi',
    'Jasa Desain',
    'Jasa Fotografi',
    'Jasa Catering',
]

for kategori_name in categories_data:
    obj, created = Kategori.objects.get_or_create(nama_kategori=kategori_name)
    if created:
        print(f"✓ Created: {kategori_name}")
    else:
        print(f"✓ Already exists: {kategori_name}")

# 4. Summary
print("\n" + "=" * 60)
print("SETUP COMPLETE!")
print("=" * 60)
print(f"\nAdmin credentials:")
print(f"  Email: {admin_email}")
print(f"  Password: DjyDnZckHPk2fELvZuUclQ")
print(f"\nTotal categories: {Kategori.objects.count()}")
print(f"Total users: {User.objects.count()}")
print("=" * 60)
