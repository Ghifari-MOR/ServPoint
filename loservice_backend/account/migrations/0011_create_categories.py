# Generated migration to create Handphone and PC&Laptop categories

from django.db import migrations
import uuid


def create_categories(apps, schema_editor):
    """Create required categories"""
    Kategori = apps.get_model('account', 'Kategori')
    
    categories = [
        {'nama_kategori': 'Handphone', 'deskripsi': 'Servis dan reparasi handphone'},
        {'nama_kategori': 'PC&Laptop', 'deskripsi': 'Servis dan reparasi PC dan Laptop'},
    ]
    
    for cat_data in categories:
        # Check if already exists (case-insensitive)
        existing = Kategori.objects.filter(nama_kategori__iexact=cat_data['nama_kategori']).first()
        if not existing:
            Kategori.objects.create(**cat_data)
            print(f"✅ Created category: {cat_data['nama_kategori']}")
        else:
            print(f"✅ Category already exists: {cat_data['nama_kategori']}")


def reverse_categories(apps, schema_editor):
    """Remove categories on reverse"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0010_fill_empty_names'),
    ]

    operations = [
        migrations.RunPython(create_categories, reverse_categories),
    ]
