#!/usr/bin/env python
import os
import django
import shutil
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'renamennti_backend.settings')
django.setup()

# Backup database
db_file = r'c:\LOKATOR SERVCE LAPTOP\loservice_backend\db.sqlite3'
backup_dir = r'c:\LOKATOR SERVCE LAPTOP\loservice_backend\backups'

# Create backups folder if not exist
os.makedirs(backup_dir, exist_ok=True)

# Create backup with timestamp
timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
backup_file = os.path.join(backup_dir, f'db_backup_{timestamp}.sqlite3')

if os.path.exists(db_file):
    shutil.copy2(db_file, backup_file)
    print(f"✓ Database backup created: {backup_file}")
    print(f"  Size: {os.path.getsize(backup_file) / 1024:.2f} KB")
else:
    print("✗ Database file not found!")
    exit(1)

# List all backups
print("\n" + "=" * 60)
print("All backups:")
print("=" * 60)
backups = sorted(os.listdir(backup_dir), reverse=True)
for backup in backups[:5]:  # Show last 5
    backup_path = os.path.join(backup_dir, backup)
    size = os.path.getsize(backup_path) / 1024
    print(f"  {backup} ({size:.2f} KB)")
