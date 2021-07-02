from typing import Optional

import hashid_field
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models

from apps.content import models as content_models
from common.storages import UniqueFilePathGenerator

User = get_user_model()


class CrudDemoItem(models.Model):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.edited_by: Optional[User] = None

    id = hashid_field.HashidAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)


class ContentfulDemoItemFavorite(models.Model):
    id = hashid_field.HashidAutoField(primary_key=True)
    item = models.ForeignKey(content_models.DemoItem, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['item', 'user']]


class DocumentDemoItem(models.Model):
    file = models.FileField(upload_to=UniqueFilePathGenerator("documents"))
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, related_name="documents"
    )
    created_at = models.DateTimeField(auto_now_add=True)
