import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p98925745_news_media_share_app')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], options=f'-c search_path={SCHEMA}')

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: dict, context) -> dict:
    """Auth: register, login, logout, me"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    path = event.get('path', '/')
    method = event.get('httpMethod', 'GET')
    headers = event.get('headers') or {}
    session_id = headers.get('x-session-id') or headers.get('X-Session-Id', '')

    conn = get_conn()
    cur = conn.cursor()

    try:
        # GET /me — текущий пользователь
        if method == 'GET' and path.endswith('/me'):
            if not session_id:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'No session'})}
            cur.execute(
                "SELECT u.id, u.username, u.display_name, u.avatar_url, u.is_admin FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = %s AND s.expires_at > NOW()",
                (session_id,)
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Invalid session'})}
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                'id': row[0], 'username': row[1], 'display_name': row[2],
                'avatar_url': row[3], 'is_admin': row[4]
            })}

        body = json.loads(event.get('body') or '{}')

        # POST /register
        if method == 'POST' and path.endswith('/register'):
            username = body.get('username', '').strip().lower()
            display_name = body.get('display_name', '').strip()
            password = body.get('password', '')
            invite_code = body.get('invite_code', '')

            if invite_code != os.environ.get('INVITE_CODE', 'secret'):
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Неверный код приглашения'})}
            if len(username) < 3:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Username слишком короткий'})}
            if len(password) < 6:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Пароль минимум 6 символов'})}

            cur.execute("SELECT id FROM users WHERE username = %s", (username,))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': CORS, 'body': json.dumps({'error': 'Имя занято'})}

            cur.execute(
                "INSERT INTO users (username, display_name, password_hash) VALUES (%s, %s, %s) RETURNING id",
                (username, display_name or username, hash_password(password))
            )
            user_id = cur.fetchone()[0]
            sid = secrets.token_hex(32)
            cur.execute("INSERT INTO sessions (id, user_id) VALUES (%s, %s)", (sid, user_id))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'session_id': sid, 'user_id': user_id})}

        # POST /login
        if method == 'POST' and path.endswith('/login'):
            username = body.get('username', '').strip().lower()
            password = body.get('password', '')
            cur.execute(
                "SELECT id, display_name, avatar_url, is_admin FROM users WHERE username = %s AND password_hash = %s",
                (username, hash_password(password))
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Неверный логин или пароль'})}
            sid = secrets.token_hex(32)
            cur.execute("INSERT INTO sessions (id, user_id) VALUES (%s, %s)", (sid, row[0]))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                'session_id': sid,
                'user': {'id': row[0], 'display_name': row[1], 'avatar_url': row[2], 'is_admin': row[3]}
            })}

        # POST /logout
        if method == 'POST' and path.endswith('/logout'):
            if session_id:
                cur.execute("UPDATE sessions SET expires_at = NOW() WHERE id = %s", (session_id,))
                conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        # GET /users — список всех пользователей
        if method == 'GET' and path.endswith('/users'):
            if not session_id:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'No session'})}
            cur.execute("SELECT id, username, display_name, avatar_url FROM users ORDER BY display_name")
            rows = cur.fetchall()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps([
                {'id': r[0], 'username': r[1], 'display_name': r[2], 'avatar_url': r[3]} for r in rows
            ])}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()
