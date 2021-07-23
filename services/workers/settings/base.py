import json

import boto3
from environs import Env

env = Env()

AWS_ENDPOINT_URL = env('AWS_ENDPOINT_URL', None)
AWS_DEFAULT_REGION = env('AWS_DEFAULT_REGION', None)
SMTP_HOST = env('SMTP_HOST', None)
EMAIL_ENABLED = env.bool('EMAIL_ENABLED', default=True)

secrets_manager_client = boto3.client('secretsmanager', endpoint_url=AWS_ENDPOINT_URL)


def fetch_db_secret(db_secret_arn):
    if db_secret_arn is None:
        return None

    response = secrets_manager_client.get_secret_value(SecretId=db_secret_arn)
    return json.loads(response['SecretString'])


ENVIRONMENT_NAME = env("ENVIRONMENT_NAME", default="")

LAMBDA_TASK_ROOT = env('LAMBDA_TASK_ROOT', '')

DB_CONNECTION = env('DB_CONNECTION', None)
DB_PROXY_ENDPOINT = env('DB_PROXY_ENDPOINT', None)

if DB_CONNECTION:
    DB_CONNECTION = json.loads(DB_CONNECTION)
else:
    DB_CONNECTION = fetch_db_secret(env('DB_SECRET_ARN', None))

    if DB_CONNECTION:
        if DB_PROXY_ENDPOINT:
            DB_CONNECTION["host"] = DB_PROXY_ENDPOINT
            DB_CONNECTION["engine"] = "postgresql"

FROM_EMAIL = env('FROM_EMAIL', None)

WEB_APP_URL = env('WEB_APP_URL', None)

SENTRY_DSN = env('SENTRY_DSN', None)

CONTENTFUL_SPACE_ID = env('CONTENTFUL_SPACE_ID', None)
CONTENTFUL_ACCESS_TOKEN = env('CONTENTFUL_ACCESS_TOKEN', None)
CONTENTFUL_ENVIRONMENT = env('CONTENTFUL_ENVIRONMENT', None)

TASK_SCHEDULING_STATE_MACHINE_ARN = env('TASK_SCHEDULING_STATE_MACHINE_ARN', None)

JWT_SECRET = env('JWT_SECRET', None)
HASHID_SALT = env('HASHID_SALT', None)
