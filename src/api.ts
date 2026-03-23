const URLS = {
  auth: "https://functions.poehali.dev/419bbf45-4424-4e85-a09f-2768bb695c11",
  messages: "https://functions.poehali.dev/82e48e45-caf1-4f08-a98f-cecc73a4b76a",
  media: "https://functions.poehali.dev/59f708d3-bb3f-45c1-99c1-e5ae4f93de4c",
};

function getSession() {
  return localStorage.getItem("session_id") || "";
}

async function req(base: "auth" | "messages" | "media", path: string, options: RequestInit = {}) {
  const url = URLS[base] + path;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Session-Id": getSession(),
    ...(options.headers as Record<string, string> || {}),
  };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  return { status: res.status, data };
}

// Auth
export async function apiRegister(username: string, display_name: string, password: string, invite_code: string) {
  return req("auth", "/register", { method: "POST", body: JSON.stringify({ username, display_name, password, invite_code }) });
}

export async function apiLogin(username: string, password: string) {
  return req("auth", "/login", { method: "POST", body: JSON.stringify({ username, password }) });
}

export async function apiMe() {
  return req("auth", "/me", { method: "GET" });
}

export async function apiLogout() {
  return req("auth", "/logout", { method: "POST" });
}

export async function apiUsers() {
  return req("auth", "/users", { method: "GET" });
}

// Conversations
export async function apiConversations() {
  return req("messages", "/conversations", { method: "GET" });
}

export async function apiCreateConversation(peer_id: number) {
  return req("messages", "/conversations", { method: "POST", body: JSON.stringify({ peer_id }) });
}

// Messages
export async function apiGetMessages(conversation_id: number, after_id = 0) {
  return req("messages", `/messages?conversation_id=${conversation_id}&after_id=${after_id}`, { method: "GET" });
}

export async function apiSendMessage(conversation_id: number, text: string, media_url?: string, media_type?: string) {
  return req("messages", "/messages", { method: "POST", body: JSON.stringify({ conversation_id, text, media_url, media_type }) });
}

// Channel
export async function apiGetChannel(after_id = 0) {
  return req("messages", `/channel?after_id=${after_id}`, { method: "GET" });
}

export async function apiPostChannel(text: string, title?: string, media_url?: string, media_type?: string, tags: string[] = []) {
  return req("messages", "/channel", { method: "POST", body: JSON.stringify({ text, title, media_url, media_type, tags }) });
}

// Media upload
export async function apiUploadMedia(file: File): Promise<{ url: string; media_type: string } | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const { status, data } = await req("media", "/", {
        method: "POST",
        body: JSON.stringify({ content_type: file.type, data: base64 }),
      });
      if (status === 200) resolve(data);
      else resolve(null);
    };
    reader.readAsDataURL(file);
  });
}
