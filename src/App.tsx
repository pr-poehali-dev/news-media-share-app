import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";
import {
  apiLogin, apiRegister, apiMe, apiLogout,
  apiUsers, apiConversations, apiCreateConversation,
  apiGetMessages, apiSendMessage,
  apiGetChannel, apiPostChannel,
  apiUploadMedia,
} from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string | null;
  is_admin: boolean;
}

interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_avatar: string | null;
  text: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
}

interface Conversation {
  conversation_id: number;
  peer: { id: number; display_name: string; avatar_url: string | null };
  last_text: string | null;
  last_media_type: string | null;
  last_at: string | null;
}

interface ChannelPost {
  id: number;
  author_id: number;
  author_name: string;
  author_avatar: string | null;
  title: string | null;
  text: string | null;
  media_url: string | null;
  media_type: string | null;
  tags: string[];
  created_at: string;
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч`;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({ name, url, size = 40 }: { name: string; url?: string | null; size?: number }) {
  const colors = ["#f0a030", "#e0407a", "#40b8e0", "#7c5cbf", "#30c060"];
  const color = colors[name.charCodeAt(0) % colors.length];
  if (url) return <img src={url} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover flex-shrink-0" />;
  return (
    <div style={{ width: size, height: size, background: color }} className="rounded-full flex items-center justify-center flex-shrink-0 text-black font-bold text-sm">
      {initials(name)}
    </div>
  );
}

// ─── Auth Screen ─────────────────────────────────────────────────────────────

function AuthScreen({ onAuth }: { onAuth: (user: User, sid: string) => void }) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [invite, setInvite] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    if (tab === "login") {
      const { status, data } = await apiLogin(username, password);
      if (status === 200) {
        localStorage.setItem("session_id", data.session_id);
        onAuth(data.user, data.session_id);
      } else {
        setError(data.error || "Ошибка входа");
      }
    } else {
      const { status, data } = await apiRegister(username, displayName, password, invite);
      if (status === 200) {
        localStorage.setItem("session_id", data.session_id);
        const me = await apiMe();
        if (me.status === 200) onAuth(me.data, data.session_id);
      } else {
        setError(data.error || "Ошибка регистрации");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-neon rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="MessageCircle" size={32} className="text-black" />
          </div>
          <h1 className="font-display text-3xl font-bold">Мессенджер</h1>
          <p className="text-muted-foreground text-sm mt-1">Только для своих</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-secondary rounded-lg p-1">
          {(["login", "register"] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === t ? "bg-background text-foreground shadow" : "text-muted-foreground"}`}
            >
              {t === "login" ? "Войти" : "Регистрация"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-3">
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Логин"
            className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon transition-colors"
          />
          {tab === "register" && (
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Имя (как будет отображаться)"
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon transition-colors"
            />
          )}
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="Пароль"
            onKeyDown={e => e.key === "Enter" && submit()}
            className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon transition-colors"
          />
          {tab === "register" && (
            <input
              value={invite}
              onChange={e => setInvite(e.target.value)}
              placeholder="Код приглашения"
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon transition-colors"
            />
          )}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-3 bg-neon text-black font-semibold rounded-lg hover:bg-neon/90 transition-all disabled:opacity-50"
          >
            {loading ? "Загрузка..." : tab === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Message Bubble ──────────────────────────────────────────────────────────

function MsgBubble({ msg, isMe }: { msg: Message; isMe: boolean }) {
  return (
    <div className={`flex gap-2 mb-3 ${isMe ? "flex-row-reverse" : ""}`}>
      {!isMe && <Avatar name={msg.sender_name} url={msg.sender_avatar} size={32} />}
      <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
        {!isMe && <span className="text-xs text-muted-foreground mb-1 ml-1">{msg.sender_name}</span>}
        <div className={`rounded-2xl px-4 py-2.5 ${isMe ? "bg-neon text-black rounded-tr-sm" : "bg-card border border-border rounded-tl-sm"}`}>
          {msg.media_url && msg.media_type === "image" && (
            <img src={msg.media_url} alt="" className="rounded-xl max-w-xs mb-2 cursor-pointer" onClick={() => window.open(msg.media_url!, "_blank")} />
          )}
          {msg.media_url && msg.media_type === "video" && (
            <video src={msg.media_url} controls className="rounded-xl max-w-xs mb-2" />
          )}
          {msg.media_url && msg.media_type === "file" && (
            <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm underline mb-2">
              <Icon name="FileText" size={16} /> Открыть файл
            </a>
          )}
          {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
        </div>
        <span className="text-[10px] text-muted-foreground mt-1 mx-1">{timeAgo(msg.created_at)}</span>
      </div>
    </div>
  );
}

// ─── Chat Window ─────────────────────────────────────────────────────────────

function ChatWindow({ convId, peer, currentUser }: { convId: number; peer: { id: number; display_name: string; avatar_url: string | null }; currentUser: User }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMessages = useCallback(async (initial = false) => {
    const after = initial ? 0 : lastIdRef.current;
    const { status, data } = await apiGetMessages(convId, after);
    if (status === 200 && data.length > 0) {
      if (initial) setMessages(data);
      else setMessages(prev => [...prev, ...data]);
      lastIdRef.current = data[data.length - 1].id;
    }
  }, [convId]);

  useEffect(() => {
    setMessages([]);
    lastIdRef.current = 0;
    loadMessages(true);
    const interval = setInterval(() => loadMessages(false), 2000);
    return () => clearInterval(interval);
  }, [convId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    await apiSendMessage(convId, text.trim());
    setText("");
    await loadMessages(false);
    setSending(false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await apiUploadMedia(file);
    if (result) {
      await apiSendMessage(convId, "", result.url, result.media_type);
      await loadMessages(false);
    }
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50">
        <Avatar name={peer.display_name} url={peer.avatar_url} size={40} />
        <div>
          <p className="font-semibold">{peer.display_name}</p>
          <p className="text-xs text-muted-foreground">в сети</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm mt-20">
            Начните общение — напишите первое сообщение
          </div>
        )}
        {messages.map(msg => (
          <MsgBubble key={msg.id} msg={msg} isMe={msg.sender_id === currentUser.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card/50">
        <div className="flex items-end gap-2">
          <input ref={fileInputRef} type="file" accept="image/*,video/mp4,application/pdf" className="hidden" onChange={handleFile} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2.5 text-muted-foreground hover:text-neon transition-colors flex-shrink-0"
          >
            {uploading ? <Icon name="Loader" size={20} className="animate-spin" /> : <Icon name="Paperclip" size={20} />}
          </button>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Сообщение..."
            rows={1}
            className="flex-1 bg-background border border-border rounded-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon resize-none transition-colors"
            style={{ maxHeight: 120 }}
          />
          <button
            onClick={send}
            disabled={!text.trim() || sending}
            className="p-2.5 bg-neon text-black rounded-full hover:bg-neon/90 transition-all disabled:opacity-40 flex-shrink-0"
          >
            <Icon name="Send" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Channel View ─────────────────────────────────────────────────────────────

function ChannelView({ currentUser }: { currentUser: User }) {
  const [posts, setPosts] = useState<ChannelPost[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<{ url: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { status, data } = await apiGetChannel();
    if (status === 200) setPosts(data);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  const post = async () => {
    if (!text.trim() && !pendingMedia) return;
    setPosting(true);
    const tagList = tags.split(/[\s,]+/).filter(t => t.startsWith("#") || t.startsWith("№")).map(t => t.trim());
    await apiPostChannel(text, title, pendingMedia?.url, pendingMedia?.type, tagList);
    setText(""); setTitle(""); setTags(""); setPendingMedia(null);
    setShowCompose(false);
    await load();
    setPosting(false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await apiUploadMedia(file);
    if (result) setPendingMedia({ url: result.url, type: result.media_type });
    setUploading(false);
    e.target.value = "";
  };

  const sharePost = (post: ChannelPost) => {
    const text = `${post.title ? post.title + "\n" : ""}${post.text || ""}\n\n${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: post.title || "Пост", text });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neon rounded-xl flex items-center justify-center">
            <Icon name="Megaphone" size={20} className="text-black" />
          </div>
          <div>
            <p className="font-semibold">Общий канал</p>
            <p className="text-xs text-muted-foreground">для всех участников</p>
          </div>
        </div>
        <button onClick={() => setShowCompose(!showCompose)} className="p-2 bg-neon text-black rounded-lg hover:bg-neon/90 transition-all">
          <Icon name="Plus" size={20} />
        </button>
      </div>

      {/* Compose */}
      {showCompose && (
        <div className="border-b border-border bg-card/80 p-4 space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Заголовок (необязательно)" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon transition-colors" />
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Текст публикации..." rows={4} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon transition-colors resize-none" />
          <input value={tags} onChange={e => setTags(e.target.value)} placeholder="#хештег #ещё" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-neon transition-colors" />
          {pendingMedia && (
            <div className="flex items-center gap-2 text-sm text-neon">
              <Icon name="CheckCircle" size={16} /> Медиафайл прикреплён
              <button onClick={() => setPendingMedia(null)} className="ml-auto text-muted-foreground hover:text-foreground">✕</button>
            </div>
          )}
          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" accept="image/*,video/mp4,application/pdf" className="hidden" onChange={handleFile} />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex-1 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:border-neon/50 flex items-center justify-center gap-2">
              {uploading ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Image" size={14} />}
              {uploading ? "Загрузка..." : "Медиа"}
            </button>
            <button onClick={post} disabled={posting || (!text.trim() && !pendingMedia)} className="flex-1 py-2 bg-neon text-black rounded-lg text-sm font-medium hover:bg-neon/90 disabled:opacity-50">
              {posting ? "Публикую..." : "Опубликовать"}
            </button>
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="flex-1 overflow-y-auto">
        {posts.length === 0 && (
          <div className="text-center text-muted-foreground text-sm mt-20">
            Нет публикаций — нажмите + чтобы создать первую
          </div>
        )}
        {posts.map(p => (
          <div key={p.id} className="border-b border-border px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Avatar name={p.author_name} url={p.author_avatar} size={32} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{p.author_name}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(p.created_at)}</p>
              </div>
              <button onClick={() => sharePost(p)} className="p-1.5 text-muted-foreground hover:text-neon transition-colors">
                <Icon name="Share2" size={16} />
              </button>
            </div>
            {p.title && <h3 className="font-display text-xl font-semibold mb-2">{p.title}</h3>}
            {p.media_url && p.media_type === "image" && (
              <img src={p.media_url} alt="" className="rounded-xl mb-3 w-full max-h-80 object-cover cursor-pointer" onClick={() => window.open(p.media_url!, "_blank")} />
            )}
            {p.media_url && p.media_type === "video" && (
              <video src={p.media_url} controls className="rounded-xl mb-3 w-full" />
            )}
            {p.text && <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">{p.text}</p>}
            {p.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {p.tags.map(t => (
                  <span key={t} className="text-xs text-neon font-mono bg-neon/10 border border-neon/20 px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  currentUser,
  conversations,
  activeConvId,
  onSelectConv,
  onSelectChannel,
  onNewChat,
  onLogout,
  channelActive,
}: {
  currentUser: User;
  conversations: Conversation[];
  activeConvId: number | null;
  onSelectConv: (c: Conversation) => void;
  onSelectChannel: () => void;
  onNewChat: () => void;
  onLogout: () => void;
  channelActive: boolean;
}) {
  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neon rounded-lg flex items-center justify-center">
              <Icon name="MessageCircle" size={16} className="text-black" />
            </div>
            <span className="font-bold text-lg">Мессенджер</span>
          </div>
          <div className="flex gap-1">
            <button onClick={onNewChat} className="p-2 text-muted-foreground hover:text-neon transition-colors" title="Новый чат">
              <Icon name="PencilLine" size={18} />
            </button>
            <button onClick={onLogout} className="p-2 text-muted-foreground hover:text-destructive transition-colors" title="Выйти">
              <Icon name="LogOut" size={18} />
            </button>
          </div>
        </div>
        {/* Current user */}
        <div className="flex items-center gap-2">
          <Avatar name={currentUser.display_name} url={currentUser.avatar_url} size={32} />
          <span className="text-sm font-medium truncate">{currentUser.display_name}</span>
        </div>
      </div>

      {/* Channel */}
      <button
        onClick={onSelectChannel}
        className={`flex items-center gap-3 px-4 py-3 border-b border-border text-left transition-colors ${channelActive ? "bg-neon/10 border-l-2 border-l-neon" : "hover:bg-secondary/50"}`}
      >
        <div className="w-10 h-10 bg-neon/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon name="Megaphone" size={20} className="text-neon" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">Общий канал</p>
          <p className="text-xs text-muted-foreground truncate">Новости и объявления</p>
        </div>
      </button>

      {/* Chats list */}
      <div className="flex-1 overflow-y-auto">
        <p className="text-xs text-muted-foreground uppercase tracking-widest px-4 py-2 font-mono">Чаты</p>
        {conversations.length === 0 && (
          <p className="text-xs text-muted-foreground px-4 py-2">Нет активных чатов</p>
        )}
        {conversations.map(conv => (
          <button
            key={conv.conversation_id}
            onClick={() => onSelectConv(conv)}
            className={`flex items-center gap-3 px-4 py-3 w-full text-left transition-colors border-l-2 ${activeConvId === conv.conversation_id ? "bg-secondary border-l-neon" : "border-l-transparent hover:bg-secondary/50"}`}
          >
            <Avatar name={conv.peer.display_name} url={conv.peer.avatar_url} size={40} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <p className="font-medium text-sm truncate">{conv.peer.display_name}</p>
                {conv.last_at && <span className="text-xs text-muted-foreground flex-shrink-0 ml-1">{timeAgo(conv.last_at)}</span>}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {conv.last_text || (conv.last_media_type ? "📎 Медиафайл" : "Нет сообщений")}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── New Chat Modal ───────────────────────────────────────────────────────────

function NewChatModal({ currentUser, onSelect, onClose }: { currentUser: User; onSelect: (userId: number) => void; onClose: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiUsers().then(({ data }) => setUsers(data || []));
  }, []);

  const filtered = users.filter(u => u.id !== currentUser.id && u.display_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <h3 className="font-semibold">Новый чат</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Icon name="X" size={20} />
          </button>
        </div>
        <div className="p-4">
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск пользователя..."
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon transition-colors mb-3"
          />
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {filtered.map(u => (
              <button
                key={u.id}
                onClick={() => onSelect(u.id)}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
              >
                <Avatar name={u.display_name} url={u.avatar_url} size={36} />
                <div>
                  <p className="text-sm font-medium">{u.display_name}</p>
                  <p className="text-xs text-muted-foreground">@{u.username}</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Пользователи не найдены</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [channelActive, setChannelActive] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Restore session
  useEffect(() => {
    const sid = localStorage.getItem("session_id");
    if (sid) {
      apiMe().then(({ status, data }) => {
        if (status === 200) setCurrentUser(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!currentUser) return;
    const { status, data } = await apiConversations();
    if (status === 200) setConversations(data);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, [currentUser, loadConversations]);

  const handleAuth = (user: User) => {
    setCurrentUser(user);
    setChannelActive(true);
  };

  const handleLogout = async () => {
    await apiLogout();
    localStorage.removeItem("session_id");
    setCurrentUser(null);
    setActiveConv(null);
    setConversations([]);
  };

  const handleSelectConv = (conv: Conversation) => {
    setActiveConv(conv);
    setChannelActive(false);
    setShowSidebar(false);
  };

  const handleSelectChannel = () => {
    setActiveConv(null);
    setChannelActive(true);
    setShowSidebar(false);
  };

  const handleNewChat = async (userId: number) => {
    setShowNewChat(false);
    const { status, data } = await apiCreateConversation(userId);
    if (status === 200) {
      await loadConversations();
      const { data: usersData } = await apiUsers();
      const peer = usersData?.find((u: User) => u.id === userId);
      if (peer) {
        setActiveConv({ conversation_id: data.conversation_id, peer, last_text: null, last_media_type: null, last_at: null });
        setChannelActive(false);
        setShowSidebar(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader" size={32} className="text-neon animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar — desktop always visible, mobile toggleable */}
      <div className={`
        flex-shrink-0 w-80 
        md:block md:relative md:translate-x-0
        ${showSidebar ? "block" : "hidden"}
        absolute inset-y-0 left-0 z-40 md:z-auto
      `}>
        <Sidebar
          currentUser={currentUser}
          conversations={conversations}
          activeConvId={activeConv?.conversation_id ?? null}
          onSelectConv={handleSelectConv}
          onSelectChannel={handleSelectChannel}
          onNewChat={() => setShowNewChat(true)}
          onLogout={handleLogout}
          channelActive={channelActive}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50">
          <button onClick={() => setShowSidebar(!showSidebar)} className="text-muted-foreground">
            <Icon name="Menu" size={22} />
          </button>
          <span className="font-semibold text-sm truncate">
            {channelActive ? "Общий канал" : activeConv?.peer.display_name || "Мессенджер"}
          </span>
        </div>

        {/* Content */}
        {channelActive && currentUser && (
          <div className="flex-1 overflow-hidden">
            <ChannelView currentUser={currentUser} />
          </div>
        )}
        {activeConv && currentUser && (
          <div className="flex-1 overflow-hidden">
            <ChatWindow convId={activeConv.conversation_id} peer={activeConv.peer} currentUser={currentUser} />
          </div>
        )}
        {!channelActive && !activeConv && (
          <div className="flex-1 flex items-center justify-center flex-col gap-4 text-muted-foreground">
            <Icon name="MessageCircle" size={48} className="opacity-20" />
            <p className="text-sm">Выберите чат или канал</p>
          </div>
        )}
      </div>

      {/* New chat modal */}
      {showNewChat && currentUser && (
        <NewChatModal
          currentUser={currentUser}
          onSelect={handleNewChat}
          onClose={() => setShowNewChat(false)}
        />
      )}
    </div>
  );
}
