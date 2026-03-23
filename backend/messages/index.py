import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p98925745_news_media_share_app')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], options=f'-c search_path={SCHEMA}')

def get_user(cur, session_id):
    cur.execute(
        "SELECT u.id, u.display_name, u.avatar_url FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = %s AND s.expires_at > NOW()",
        (session_id,)
    )
    return cur.fetchone()

def handler(event: dict, context) -> dict:
    """Messages: get/send messages in conversations and channel"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    path = event.get('path', '/')
    method = event.get('httpMethod', 'GET')
    headers = event.get('headers') or {}
    session_id = headers.get('x-session-id') or headers.get('X-Session-Id', '')
    params = event.get('queryStringParameters') or {}

    conn = get_conn()
    cur = conn.cursor()

    try:
        user = get_user(cur, session_id)
        if not user:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Unauthorized'})}
        user_id, display_name, avatar_url = user

        # GET /conversations — список всех диалогов текущего пользователя
        if method == 'GET' and path.endswith('/conversations'):
            cur.execute("""
                SELECT c.id,
                       u.id, u.display_name, u.avatar_url,
                       (SELECT text FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1),
                       (SELECT media_type FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1),
                       (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1)
                FROM conversations c
                JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = %s
                JOIN conversation_members cm2 ON cm2.conversation_id = c.id AND cm2.user_id != %s
                JOIN users u ON u.id = cm2.user_id
                ORDER BY 7 DESC NULLS LAST
            """, (user_id, user_id))
            rows = cur.fetchall()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps([{
                'conversation_id': r[0],
                'peer': {'id': r[1], 'display_name': r[2], 'avatar_url': r[3]},
                'last_text': r[4],
                'last_media_type': r[5],
                'last_at': r[6].isoformat() if r[6] else None,
            } for r in rows])}

        # POST /conversations — создать или получить диалог с пользователем
        if method == 'POST' and path.endswith('/conversations'):
            body = json.loads(event.get('body') or '{}')
            peer_id = int(body.get('peer_id'))
            if peer_id == user_id:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Cannot chat with yourself'})}

            # ищем существующий диалог
            cur.execute("""
                SELECT c.id FROM conversations c
                JOIN conversation_members cm1 ON cm1.conversation_id = c.id AND cm1.user_id = %s
                JOIN conversation_members cm2 ON cm2.conversation_id = c.id AND cm2.user_id = %s
            """, (user_id, peer_id))
            row = cur.fetchone()
            if row:
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'conversation_id': row[0]})}

            cur.execute("INSERT INTO conversations DEFAULT VALUES RETURNING id")
            conv_id = cur.fetchone()[0]
            cur.execute("INSERT INTO conversation_members (conversation_id, user_id) VALUES (%s, %s)", (conv_id, user_id))
            cur.execute("INSERT INTO conversation_members (conversation_id, user_id) VALUES (%s, %s)", (conv_id, peer_id))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'conversation_id': conv_id})}

        # GET /messages?conversation_id=X&after_id=Y
        if method == 'GET' and path.endswith('/messages'):
            conv_id = params.get('conversation_id')
            after_id = params.get('after_id', '0')
            if not conv_id:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'conversation_id required'})}

            # проверяем доступ
            cur.execute("SELECT 1 FROM conversation_members WHERE conversation_id = %s AND user_id = %s", (conv_id, user_id))
            if not cur.fetchone():
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Access denied'})}

            cur.execute("""
                SELECT m.id, m.sender_id, u.display_name, u.avatar_url, m.text, m.media_url, m.media_type, m.created_at
                FROM messages m JOIN users u ON u.id = m.sender_id
                WHERE m.conversation_id = %s AND m.id > %s
                ORDER BY m.created_at ASC
                LIMIT 100
            """, (conv_id, after_id))
            rows = cur.fetchall()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps([{
                'id': r[0], 'sender_id': r[1], 'sender_name': r[2], 'sender_avatar': r[3],
                'text': r[4], 'media_url': r[5], 'media_type': r[6],
                'created_at': r[7].isoformat()
            } for r in rows])}

        # POST /messages — отправить сообщение
        if method == 'POST' and path.endswith('/messages'):
            body = json.loads(event.get('body') or '{}')
            conv_id = body.get('conversation_id')
            text = body.get('text', '').strip()
            media_url = body.get('media_url')
            media_type = body.get('media_type')

            if not conv_id or (not text and not media_url):
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Empty message'})}

            cur.execute("SELECT 1 FROM conversation_members WHERE conversation_id = %s AND user_id = %s", (conv_id, user_id))
            if not cur.fetchone():
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Access denied'})}

            cur.execute(
                "INSERT INTO messages (conversation_id, sender_id, text, media_url, media_type) VALUES (%s, %s, %s, %s, %s) RETURNING id, created_at",
                (conv_id, user_id, text or None, media_url, media_type)
            )
            msg_id, created_at = cur.fetchone()
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                'id': msg_id, 'sender_id': user_id, 'sender_name': display_name,
                'sender_avatar': avatar_url, 'text': text, 'media_url': media_url,
                'media_type': media_type, 'created_at': created_at.isoformat()
            })}

        # GET /channel — посты канала
        if method == 'GET' and path.endswith('/channel'):
            after_id = params.get('after_id', '0')
            cur.execute("""
                SELECT p.id, u.id, u.display_name, u.avatar_url, p.title, p.text, p.media_url, p.media_type, p.tags, p.created_at
                FROM channel_posts p JOIN users u ON u.id = p.author_id
                WHERE p.id > %s
                ORDER BY p.created_at DESC
                LIMIT 50
            """, (after_id,))
            rows = cur.fetchall()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps([{
                'id': r[0], 'author_id': r[1], 'author_name': r[2], 'author_avatar': r[3],
                'title': r[4], 'text': r[5], 'media_url': r[6], 'media_type': r[7],
                'tags': r[8] or [], 'created_at': r[9].isoformat()
            } for r in rows])}

        # POST /channel — создать пост в канале
        if method == 'POST' and path.endswith('/channel'):
            body = json.loads(event.get('body') or '{}')
            title = body.get('title', '').strip()
            text = body.get('text', '').strip()
            media_url = body.get('media_url')
            media_type = body.get('media_type')
            tags = body.get('tags', [])

            if not text and not media_url:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Empty post'})}

            cur.execute(
                "INSERT INTO channel_posts (author_id, title, text, media_url, media_type, tags) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, created_at",
                (user_id, title or None, text or None, media_url, media_type, tags)
            )
            post_id, created_at = cur.fetchone()
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                'id': post_id, 'author_id': user_id, 'author_name': display_name,
                'title': title, 'text': text, 'media_url': media_url,
                'media_type': media_type, 'tags': tags, 'created_at': created_at.isoformat()
            })}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()
