# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0006_user_profile_picture'),
    ]

    operations = [
        migrations.AddField(
            model_name='umkmbranch',
            name='jam_buka',
            field=models.CharField(default='08:00', max_length=10),
        ),
        migrations.AddField(
            model_name='umkmbranch',
            name='jam_tutup',
            field=models.CharField(default='20:00', max_length=10),
        ),
        migrations.AddField(
            model_name='umkmbranch',
            name='hari_operasional',
            field=models.CharField(default='Senin - Sabtu', max_length=50),
        ),
    ]
