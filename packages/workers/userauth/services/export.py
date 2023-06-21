import datetime
import io
import json
import zipfile
from typing import Union

import boto3
import settings
from common.protocols import UserDataExportable, UserFilesExportable
from demo.services.export import CrudDemoItemDataExport, DocumentDemoItemFileExport
from ..models import User
from ..types import UserType
from utils import hashid
from ..constants import ExportUserArchiveRootPaths


class UserDataExport(UserDataExportable):
    export_key = "user"
    schema_class = UserType

    @classmethod
    def export(cls, user: User) -> Union[str, list[str]]:
        return cls.schema_class.from_orm(user).json()


class ExportUserArchive:
    _DATA_EXPORTS: list[UserDataExportable] = [UserDataExport, CrudDemoItemDataExport]
    _FILES_EXPORTS: list[UserFilesExportable] = [DocumentDemoItemFileExport]

    def __init__(self, user: User):
        self._user = user

    @property
    def _user_id(self) -> str:
        return hashid.encode(self._user.id)

    def run(self) -> str:
        user_data = self._export_user_data()
        user_files = self._export_user_files()

        archive_filename = self._export_user_archive_to_zip(user_data, user_files)
        export_url = self._export_zip_archive_to_s3(archive_filename)

        return export_url

    def _export_user_data(self) -> dict:
        export_data = {}

        for user_data_export in self._DATA_EXPORTS:
            export_data[user_data_export.export_key] = user_data_export.export(self._user)

        return export_data

    def _export_user_files(self) -> list:
        export_files_paths = []

        for user_file_export in self._FILES_EXPORTS:
            export_files_paths.extend(user_file_export.export(self._user))

        return export_files_paths

    def _export_user_archive_to_zip(self, user_data: dict, user_files: list[str]) -> str:
        s3 = boto3.client("s3", endpoint_url=settings.AWS_S3_ENDPOINT_URL)
        archive_filename = f"/{ExportUserArchiveRootPaths.LOCAL_ROOT.value}/{self._user_id}.zip"

        with zipfile.ZipFile(archive_filename, "w", zipfile.ZIP_DEFLATED) as zf:
            json_data_filename = f"{self._user_id}/{self._user_id}.json"
            zf.writestr(json_data_filename, json.dumps(user_data).encode('utf-8'))

            for file_path in user_files:
                with io.BytesIO() as buffer:
                    s3.download_fileobj(settings.AWS_STORAGE_BUCKET_NAME, file_path, buffer)
                    zf.writestr(f"{self._user_id}/{file_path}", buffer.getvalue())

        return archive_filename

    def _export_zip_archive_to_s3(self, user_archive_filename: str) -> str:
        s3 = boto3.client("s3", endpoint_url=settings.AWS_S3_ENDPOINT_URL)
        user_archive_obj_key = self._get_user_archive_obj_key()

        s3.upload_file(user_archive_filename, settings.AWS_EXPORTS_STORAGE_BUCKET_NAME, user_archive_obj_key)
        export_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': settings.AWS_EXPORTS_STORAGE_BUCKET_NAME, 'Key': user_archive_obj_key},
            ExpiresIn=settings.USER_DATA_EXPORT_EXPIRY_SECONDS,
        )

        return export_url

    def _get_user_archive_obj_key(self) -> str:
        timestamp = datetime.datetime.now().strftime("%d-%m-%y_%H-%M-%S")
        return f"{ExportUserArchiveRootPaths.S3_ROOT.value}/{self._user_id}_{timestamp}.zip"
