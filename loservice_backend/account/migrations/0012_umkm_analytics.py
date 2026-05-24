from django.db import migrations, models
from django.db.models import deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0011_create_categories'),
    ]

    operations = [
        migrations.AddField(
            model_name='umkm',
            name='total_views',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='umkm',
            name='unique_visitors',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='umkm',
            name='whatsapp_clicks',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.CreateModel(
            name='UMKMVisit',
            fields=[
                ('visit_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('visitor_key', models.CharField(max_length=64)),
                ('visit_date', models.DateField(default=django.utils.timezone.localdate)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('umkm', models.ForeignKey(on_delete=deletion.CASCADE, related_name='visit_logs', to='account.umkm')),
            ],
            options={
                'indexes': [models.Index(fields=['umkm', 'visit_date'], name='account_umkmv_umkm_id_visit_d5b81f_idx')],
                'constraints': [models.UniqueConstraint(fields=('umkm', 'visitor_key', 'visit_date'), name='unique_umkm_visitor_per_day')],
            },
        ),
    ]
