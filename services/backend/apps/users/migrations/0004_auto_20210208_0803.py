# Generated by Django 3.1.6 on 2021-02-08 08:03

from django.db import migrations

default_groups = [
    "admin",
    "user"
]


def apply_migration(apps, schema_editor):
    db_alias = schema_editor.connection.alias

    Group = apps.get_model("auth", "Group")
    Group.objects.using(db_alias).bulk_create(
        [Group(name=name) for name in default_groups]
    )

    users_group = Group.objects.using(db_alias).get(name="user")
    User = apps.get_model("users", "User")
    users = User.objects.using(db_alias)
    for user in users:
        user.groups.add(users_group)


def revert_migration(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Group.objects.filter(name__in=default_groups).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('users', '0003_auto_20210208_0803'),
    ]

    operations = [
        migrations.RunPython(apply_migration, revert_migration)
    ]
