import json
import os
import base64
import uuid
import boto3
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p98925745_news_media_share_app')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
}

ALLOWED_TYPES = {
    'image/jpeg': ('jpg', 'image'),
    'image/png': ('png', 'image'),
    'image/gif': ('gif', 'image'),
    'image/webp': ('webp', 'image'),
    'video/mp4': ('mp4', 'video'),
    'application/pdf': ('pdf', 'file'),
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], options=f'-c search_path={SCHEMA}')

def get_user(session_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT u.id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = %s AND s.expires_at > NOW()",
        (session_id,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row[0] if row else None

def handler(event: dict, context) -> dict:
    """Media upload: принимает base64 файл, загружает в S3, возвращает URL"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    headers = event.get('headers') or {}
    session_id = headers.get('x-session-id') or headers.get('X-Session-Id', '')
    user_id = get_user(session_id)
    if not user_id:
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Unauthorized'})}

    body = json.loads(event.get('body') or '{}')
    content_type = body.get('content_type', '')
    data_b64 = body.get('data', '')

    if content_type not in ALLOWED_TYPES:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Unsupported file type'})}

    ext, media_type = ALLOWED_TYPES[content_type]
    file_data = base64.b64decode(data_b64)

    if len(file_data) > 50 * 1024 * 1024:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'File too large (max 50MB)'})}

    key = f"messenger/{user_id}/{uuid.uuid4().hex}.{ext}"

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=file_data, ContentType=content_type)

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'url': cdn_url, 'media_type': media_type})}
