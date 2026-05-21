import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'renamennti_backend.settings')
django.setup()

from django.contrib.auth import get_user_model, authenticate

User = get_user_model()

print("=" * 50)
print("Setting up admin user in VPS PostgreSQL")
print("=" * 50)

# Check if admin with email exists
admin = User.objects.filter(email='admin@servpoint.local').first()

if admin:
    print("\n[FOUND] Admin user exists!")
    print("  Email: {}".format(admin.email))
    print("  Username: {}".format(admin.username))
else:
    print("\n[CREATE] Creating new admin user...")
    try:
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@servpoint.local',
            password='Admin@12345',
            name='Administrator'
        )
        admin.role = 'ADMIN'
        admin.save()
        print("[OK] Admin created!")
        print("  Email: {}".format(admin.email))
        print("  Username: {}".format(admin.username))
    except Exception as e:
        print("[ERROR] Failed to create admin: {}".format(e))
        exit(1)

# Update password to ensure it's correct
print("\n[UPDATE] Setting password to: Admin@12345")
admin.set_password('Admin@12345')
admin.save()
print("[OK] Password updated")

# Verify authentication
print("\n[VERIFY] Testing login...")
result = authenticate(username='admin@servpoint.local', password='Admin@12345')
if result:
    print("[SUCCESS] Login works!")
else:
    print("[WARNING] Login verification failed - may still work in API")

print("\n" + "=" * 50)
print("Admin user ready:")
print("  Email: admin@servpoint.local")
print("  Password: Admin@12345")
print("=" * 50)
