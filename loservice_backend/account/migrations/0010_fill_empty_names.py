# Generated migration to fill empty user names with email

from django.db import migrations


def fill_empty_names(apps, schema_editor):
    """Fill empty user names with their email addresses"""
    User = apps.get_model('account', 'User')
    
    empty_names = User.objects.filter(name='')
    updated_count = 0
    
    for user in empty_names:
        user.name = user.email
        user.save(update_fields=['name'])
        updated_count += 1
    
    if updated_count > 0:
        print(f"\n✅ Updated {updated_count} users with empty names")
    else:
        print("\n✅ All users already have names")


def reverse_fill_names(apps, schema_editor):
    """Reverse migration - not recommended, but keeping for safety"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0009_fix_admin_permissions'),
    ]

    operations = [
        migrations.RunPython(fill_empty_names, reverse_fill_names),
    ]
