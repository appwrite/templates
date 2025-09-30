import os
from .appwrite import AppwriteService
from .utils import throw_if_missing


def main(context):
    throw_if_missing(
        os.environ,
        ['RETENTION_PERIOD_DAYS', 'APPWRITE_BUCKET_ID']
    )

    appwrite = AppwriteService(context.req.headers['x-appwrite-key'])

    appwrite.clean_bucket(os.environ['APPWRITE_BUCKET_ID'])

    return context.res.text('Buckets cleaned', 200)
