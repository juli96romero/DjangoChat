# Generated by Django 5.0.1 on 2024-03-08 04:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('image_loader', '0003_message'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='sender',
            field=models.CharField(max_length=50, unique=True),
        ),
    ]
