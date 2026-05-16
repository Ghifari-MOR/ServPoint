# Generated migration for adding image field to UMKMProduct

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0007_umkmbranch_operating_hours'),
    ]

    operations = [
        migrations.AddField(
            model_name='umkmproduct',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='products/'),
        ),
    ]
