from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("account", "0013_rename_account_umkmv_umkm_id_visit_d5b81f_idx_account_umk_umkm_id_28e8c7_idx"),
    ]

    operations = [
        migrations.AddField(
            model_name="umkmbranch",
            name="is_open_now",
            field=models.BooleanField(default=True),
        ),
    ]