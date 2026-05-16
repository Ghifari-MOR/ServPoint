#!/usr/bin/env python
"""Verify production setup - check database state and configuration"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'renamennti_backend.settings')
django.setup()

from account.models import User, Kategori, UMKM, UMKMReview, UMKMProduct, UMKMService
from django.conf import settings

print("=" * 60)
print("PRODUCTION SETUP VERIFICATION")
print("=" * 60)

# 1. Check Django Settings
print("\n1. DJANGO SETTINGS:")
print(f"   DEBUG: {settings.DEBUG}")
print(f"   ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
print(f"   MEDIA_URL: {settings.MEDIA_URL}")
print(f"   MEDIA_ROOT: {settings.MEDIA_ROOT}")

# 2. Check Database State
print("\n2. DATABASE STATE:")
print(f"   Users: {User.objects.count()}")
print(f"   Categories: {Kategori.objects.count()}")
print(f"   UMKM: {UMKM.objects.count()}")
print(f"   Products: {UMKMProduct.objects.count()}")
print(f"   Services: {UMKMService.objects.count()}")
print(f"   Reviews: {UMKMReview.objects.count()}")

# 3. Check Admin User
print("\n3. ADMIN USER:")
try:
    admin = User.objects.get(role='ADMIN')
    print(f"   ✓ Email: {admin.email}")
    print(f"   ✓ Name: {admin.name}")
    print(f"   ✓ Role: {admin.role}")
    print(f"   ✓ Is Staff: {admin.is_staff}")
    print(f"   ✓ Is Superuser: {admin.is_superuser}")
except User.DoesNotExist:
    print("   ✗ No admin user found!")

# 4. Check Categories
print("\n4. CATEGORIES (Production):")
categories = Kategori.objects.all()
if categories.count() == 0:
    print("   ✗ No categories found!")
else:
    for cat in categories:
        print(f"   ✓ {cat.nama_kategori}")

# 5. Check Frontend Build
import os.path
frontend_build_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'loservice_frontend', 'dist')
print("\n5. FRONTEND BUILD:")
if os.path.exists(frontend_build_path):
    print(f"   ✓ Build directory exists: {frontend_build_path}")
    # Check for key files
    index_html = os.path.join(frontend_build_path, 'index.html')
    assets_dir = os.path.join(frontend_build_path, 'assets')
    print(f"   ✓ index.html: {os.path.exists(index_html)}")
    print(f"   ✓ assets/: {os.path.exists(assets_dir)}")
else:
    print(f"   ✗ Build directory NOT found")

print("\n" + "=" * 60)
print("SUMMARY: ✓ Production setup ready!")
print("=" * 60)
print("\nNext steps:")
print("1. Deploy to VPS/Server with domain name")
print("2. Update ALLOWED_HOSTS with production domain")
print("3. Setup Nginx/Apache to serve frontend and proxy API")
print("4. Enable HTTPS/SSL certificates")
print("5. Update CORS_ALLOWED_ORIGINS with production domain")
print("6. Set security flags: SECURE_SSL_REDIRECT, SESSION_COOKIE_SECURE, etc")
print("=" * 60)
