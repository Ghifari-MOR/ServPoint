# Script untuk menjalankan migration dan memperbaiki database

import os
import sys

# Tambahkan path project ke sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'renamennti_backend.settings')

import django
django.setup()

from django.core.management import call_command

print("=" * 50)
print("RUNNING MIGRATIONS")
print("=" * 50)

try:
    # Run migrations
    call_command('migrate', verbosity=2)
    print("\n✅ Migrations completed successfully!")
except Exception as e:
    print(f"\n❌ Error running migrations: {e}")
    sys.exit(1)

print("\n" + "=" * 50)
print("CHECKING DATABASE STATE")
print("=" * 50)

from account.models import UMKMBranch

# Check if fields exist
try:
    branch = UMKMBranch.objects.first()
    if branch:
        print(f"✅ Sample branch found: {branch.umkm.nama_umkm}")
        print(f"   - Jam Buka: {getattr(branch, 'jam_buka', 'NOT FOUND')}")
        print(f"   - Jam Tutup: {getattr(branch, 'jam_tutup', 'NOT FOUND')}")
        print(f"   - Hari Operasional: {getattr(branch, 'hari_operasional', 'NOT FOUND')}")
    else:
        print("⚠️  No branches found in database")
except Exception as e:
    print(f"❌ Error checking database: {e}")

print("\n✅ Script completed!")
