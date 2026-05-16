#!/usr/bin/env python
import os
import django
import secrets

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'renamennti_backend.settings')
django.setup()

from account.models import User, Kategori

print("=" * 60)
print("Setup Production Admin & Initial Data")
print("=" * 60)

# 1. Create admin user
print("\n1. Creating Admin User...")

admin_email = 'admin@loservice.local'
admin_password = secrets.token_urlsafe(16)  # Generate secure password

try:
    admin = User.objects.create_superuser(
        email=admin_email,
        username='admin',
        password=admin_password,
        name='Administrator',
        role='ADMIN'
    )
    print(f"   ✓ Admin user created")
    print(f"   📧 Email: {admin_email}")
    print(f"   🔑 Password: {admin_password}")
    print(f"   ⚠️  SAVE PASSWORD SECURELY!")
except Exception as e:
    print(f"   ✗ Error: {e}")

# 2. Create kategori
print("\n2. Creating Categories...")

categories = [
    'Servis Laptop & Komputer',
    'Servis Smartphone',
    'Jasa Pembersihan',
    'Jasa Perbaikan',
    'Jasa Konstruksi',
    'Jasa Desain',
    'Jasa Fotografi',
    'Jasa Catering',
]

for cat_name in categories:
    try:
        kategori, created = Kategori.objects.get_or_create(
            nama_kategori=cat_name
        )
        if created:
            print(f"   ✓ {cat_name}")
        else:
            print(f"   - {cat_name} (already exists)")
    except Exception as e:
        print(f"   ✗ {cat_name}: {e}")

# 3. Summary
print("\n" + "=" * 60)
print("Setup Complete!")
print("=" * 60)
print(f"✓ Users: {User.objects.count()}")
print(f"✓ Categories: {Kategori.objects.count()}")
print("\nDatabase is now CLEAN and READY for production!")
print("\n⚠️  IMPORTANT:")
print("   1. Change admin password immediately after first login")
print("   2. Keep backup file safe")
print("   3. Ready to accept real users!")
