"""
Script untuk memperbaiki permission Admin
Jalankan dengan: python manage.py shell < fix_admin_permission.py
"""

from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 60)
print("FIXING ADMIN PERMISSIONS")
print("=" * 60)

# Cari semua user dengan role ADMIN
admin_users = User.objects.filter(role='ADMIN')

if not admin_users.exists():
    print("\n❌ TIDAK ADA USER DENGAN ROLE='ADMIN'")
    print("\nCek semua user:")
    for u in User.objects.all():
        print(f"  - {u.email} | role={u.role} | is_staff={u.is_staff} | is_superuser={u.is_superuser}")
    
    print("\n💡 Untuk membuat admin baru, jalankan:")
    print("   python manage.py createsuperuser")
else:
    print(f"\n✅ Ditemukan {admin_users.count()} user dengan role ADMIN")
    
    # Fix setiap admin user
    for admin in admin_users:
        print(f"\n📝 Memperbaiki user: {admin.email}")
        print(f"   SEBELUM: role={admin.role}, is_staff={admin.is_staff}, is_superuser={admin.is_superuser}")
        
        # Set is_staff = True agar bisa akses Django Admin
        # Set is_superuser = True agar punya semua permission
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()
        
        print(f"   SESUDAH: role={admin.role}, is_staff={admin.is_staff}, is_superuser={admin.is_superuser}")
        print("   ✅ BERHASIL DIPERBAIKI!")

print("\n" + "=" * 60)
print("SELESAI!")
print("=" * 60)
print("\n💡 Silakan logout dan login kembali di frontend")
