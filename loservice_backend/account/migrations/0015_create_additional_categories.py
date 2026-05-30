# Generated migration to seed additional UMKM categories

from django.db import migrations


def create_categories(apps, schema_editor):
    Kategori = apps.get_model('account', 'Kategori')

    categories = [
        {'nama_kategori': 'Laptop & PC', 'deskripsi': 'Servis dan reparasi laptop dan PC'},
        {'nama_kategori': 'Smartwatch', 'deskripsi': 'Servis smartwatch dan wearable'},
        {'nama_kategori': 'Tablet', 'deskripsi': 'Servis tablet'},
        {'nama_kategori': 'TWS & Headphone', 'deskripsi': 'Servis audio nirkabel dan headphone'},
        {'nama_kategori': 'Kamera Digital', 'deskripsi': 'Servis kamera digital'},
        {'nama_kategori': 'Printer & Scanner', 'deskripsi': 'Servis printer dan scanner'},
        {'nama_kategori': 'Konsol Game', 'deskripsi': 'Servis konsol game'},
        {'nama_kategori': 'TV & Monitor', 'deskripsi': 'Servis TV dan monitor'},
    ]

    for cat_data in categories:
        existing = Kategori.objects.filter(nama_kategori__iexact=cat_data['nama_kategori']).first()
        if not existing:
            Kategori.objects.create(**cat_data)


def reverse_categories(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0014_umkmbranch_is_open_now'),
    ]

    operations = [
        migrations.RunPython(create_categories, reverse_categories),
    ]