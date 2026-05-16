# Generated migration to fix ADMIN user permissions

from django.db import migrations


def fix_admin_permissions(apps, schema_editor):
    """Auto-set is_staff and is_superuser for all ADMIN users"""
    User = apps.get_model('account', 'User')
    
    admin_users = User.objects.filter(role='ADMIN')
    updated_count = 0
    
    for admin in admin_users:
        if not admin.is_staff or not admin.is_superuser:
            admin.is_staff = True
            admin.is_superuser = True
            admin.save(update_fields=['is_staff', 'is_superuser'])
            updated_count += 1
            print(f"✅ Fixed: {admin.email}")
    
    if updated_count > 0:
        print(f"\n🎉 Total {updated_count} ADMIN user(s) fixed!")
    else:
        print("\n✅ All ADMIN users already have correct permissions.")


def reverse_fix_admin_permissions(apps, schema_editor):
    """Reverse migration - not recommended, but keeping for safety"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0008_umkmproduct_image'),
    ]

    operations = [
        migrations.RunPython(fix_admin_permissions, reverse_fix_admin_permissions),
    ]
