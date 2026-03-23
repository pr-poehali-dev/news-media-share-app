import { useState } from "react";
import Icon from "@/components/ui/icon";

type Page = "home" | "my-news" | "create" | "gallery" | "search" | "settings" | "socials";

const SAMPLE_POSTS = [
  {
    id: 1,
    title: "Рассвет над городом: репортаж с крыши",
    excerpt: "Каждое утро мегаполис преображается. Я провёл три часа на крыше 22-этажного здания, чтобы поймать этот момент.",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
    author: "Алексей Морозов",
    date: "23 марта 2026",
    tags: ["#город", "#фото", "#рассвет"],
    category: "Фотография",
    views: 1842,
    shares: 234,
    featured: true,
  },
  {
    id: 2,
    title: "Тихие улицы Токио в 3 ночи",
    excerpt: "Когда засыпает последний клерк, город открывает своё настоящее лицо — без масок и суеты.",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    author: "Юлия Кравцова",
    date: "22 марта 2026",
    tags: ["#токио", "#ночь", "#путешествия"],
    category: "Путешествия",
    views: 3201,
    shares: 512,
    featured: true,
  },
  {
    id: 3,
    title: "Музыкальный андеграунд: новые голоса",
    excerpt: "Подземные сцены Москвы и Петербурга рождают артистов, которых скоро услышит весь мир.",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    author: "Дмитрий Волков",
    date: "21 марта 2026",
    tags: ["#музыка", "#андеграунд", "#культура"],
    category: "Музыка",
    views: 987,
    shares: 178,
    featured: false,
  },
  {
    id: 4,
    title: "Архитектура будущего: формы без компромиссов",
    excerpt: "Три архитектурных бюро, три разных взгляда на то, каким должен быть город 2040 года.",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    author: "Марина Сорокина",
    date: "20 марта 2026",
    tags: ["#архитектура", "#урбанистика", "#дизайн"],
    category: "Дизайн",
    views: 2156,
    shares: 389,
    featured: false,
  },
  {
    id: 5,
    title: "Кухня без правил: манифест свободного повара",
    excerpt: "Что происходит, когда шеф-повар отказывается от меню и готовит исключительно из интуиции?",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    author: "Антон Лисицын",
    date: "19 марта 2026",
    tags: ["#еда", "#кулинария", "#эксперимент"],
    category: "Еда",
    views: 1543,
    shares: 201,
    featured: false,
  },
  {
    id: 6,
    title: "Цифровой арт: когда алгоритм становится художником",
    excerpt: "Нейросети создают шедевры — но кто автор, человек или машина?",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    author: "Ева Черникова",
    date: "18 марта 2026",
    tags: ["#ИИ", "#искусство", "#технологии"],
    category: "Технологии",
    views: 4102,
    shares: 876,
    featured: false,
  },
];

const ALL_TAGS = ["#город", "#фото", "#рассвет", "#токио", "#ночь", "#путешествия", "#музыка", "#андеграунд", "#культура", "#архитектура", "#урбанистика", "#дизайн", "#еда", "#кулинария", "#ИИ", "#искусство", "#технологии"];

const MY_POSTS = SAMPLE_POSTS.slice(0, 3);

const GALLERY_IMAGES = [
  { id: 1, url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80", tags: ["#город", "#рассвет"] },
  { id: 2, url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80", tags: ["#токио", "#ночь"] },
  { id: 3, url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80", tags: ["#музыка"] },
  { id: 4, url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80", tags: ["#архитектура"] },
  { id: 5, url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80", tags: ["#еда"] },
  { id: 6, url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80", tags: ["#ИИ", "#искусство"] },
  { id: 7, url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80", tags: ["#природа"] },
  { id: 8, url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", tags: ["#мода"] },
  { id: 9, url: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&q=80", tags: ["#люди"] },
];

const TICKER_ITEMS = ["МЕДИА", "НОВОСТИ", "РЕПОРТАЖИ", "ФОТОГРАФИИ", "ИСТОРИИ", "ТРЕНДЫ", "CULTURE", "VISION"];

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-y border-border py-2 bg-secondary/30">
      <div className="flex ticker-animate whitespace-nowrap">
        {items.map((item, i) => (
          <span key={i} className="font-mono-custom text-xs text-muted-foreground mx-6 tracking-widest uppercase">
            <span className="text-neon mr-6">✦</span>{item}
          </span>
        ))}
      </div>
    </div>
  );
}

function HashtagBadge({ tag, active, onClick }: { tag: string; active?: boolean; onClick?: () => void }) {
  return (
    <span className={`hashtag ${active ? "active" : ""}`} onClick={onClick}>
      {tag}
    </span>
  );
}

function PostCard({ post, index, big = false }: { post: typeof SAMPLE_POSTS[0]; index: number; big?: boolean }) {
  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = encodeURIComponent(post.title);
    const urls: Record<string, string> = {
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`,
      vk: `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${text}`,
    };
    if (urls[platform]) window.open(urls[platform], "_blank");
  };

  return (
    <div className={`card-hover bg-card border border-border overflow-hidden animate-slide-up stagger-${Math.min(index + 1, 5)} ${big ? "h-full" : ""}`}>
      <div className={`relative overflow-hidden ${big ? "h-72" : "h-44"}`}>
        <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
        <div className="image-overlay absolute inset-0" />
        <div className="absolute top-3 left-3">
          <span className="font-mono-custom text-xs px-2 py-1 bg-black/60 border border-neon/30 text-neon tracking-widest">
            {post.category.toUpperCase()}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tags.map((t) => (
              <HashtagBadge key={t} tag={t} />
            ))}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className={`font-display font-semibold leading-tight mb-2 ${big ? "text-2xl" : "text-lg"}`}>
          {post.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-foreground/80">{post.author}</p>
            <p className="text-xs text-muted-foreground">{post.date}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Icon name="Eye" size={12} /> {formatNumber(post.views)}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => handleShare("telegram")}
                className="p-1.5 rounded bg-secondary hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-neon"
                title="Telegram"
              >
                <Icon name="Send" size={12} />
              </button>
              <button
                onClick={() => handleShare("vk")}
                className="p-1.5 rounded bg-secondary hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-neon"
                title="ВКонтакте"
              >
                <Icon name="Share2" size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomePage({ onTagFilter }: { onTagFilter: (tag: string) => void }) {
  return (
    <div className="animate-fade-in">
      <div className="relative px-6 py-16 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-neon/5 via-transparent to-neon-pink/5" />
        <div className="relative max-w-5xl mx-auto">
          <p className="font-mono-custom text-xs text-neon tracking-widest mb-4 uppercase">Медиа платформа · 2026</p>
          <h1 className="font-display text-7xl md:text-9xl font-bold leading-none mb-6 tracking-tight">
            ТВОИ<br />
            <span className="text-neon italic">ИСТОРИИ</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
            Публикуй новости, фото и репортажи. Делись с миром через хештеги и соцсети.
          </p>
        </div>
        <div className="absolute right-10 top-10 w-32 h-32 border border-neon/20 rounded-full opacity-50" />
        <div className="absolute right-16 top-16 w-16 h-16 border border-neon/30 rounded-full opacity-50" />
      </div>

      <Ticker />

      <div className="px-6 py-6 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono-custom text-xs text-muted-foreground tracking-widest uppercase mb-3">Популярные теги</p>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.slice(0, 12).map((tag) => (
              <HashtagBadge key={tag} tag={tag} onClick={() => onTagFilter(tag)} />
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-3xl font-semibold">Главное сегодня</h2>
            <span className="font-mono-custom text-xs text-muted-foreground">{SAMPLE_POSTS.length} материалов</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border mb-px">
            <div className="md:col-span-2 bg-background">
              <PostCard post={SAMPLE_POSTS[0]} index={0} big />
            </div>
            <div className="bg-background flex flex-col gap-px">
              <div className="flex-1 bg-background"><PostCard post={SAMPLE_POSTS[1]} index={1} /></div>
              <div className="flex-1 bg-background"><PostCard post={SAMPLE_POSTS[2]} index={2} /></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
            {SAMPLE_POSTS.slice(3).map((post, i) => (
              <div key={post.id} className="bg-background"><PostCard post={post} index={i + 3} /></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MyNewsPage() {
  return (
    <div className="animate-fade-in px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono-custom text-xs text-neon tracking-widest uppercase mb-1">Личный кабинет</p>
            <h2 className="font-display text-5xl font-bold">Мои новости</h2>
          </div>
          <div className="text-right">
            <p className="text-3xl font-display font-bold text-neon">{MY_POSTS.length}</p>
            <p className="text-xs text-muted-foreground">публикаций</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-px bg-border mb-10">
          {[
            { label: "Просмотры", value: "7.0k", icon: "Eye" },
            { label: "Поделились", value: "924", icon: "Share2" },
            { label: "Хештегов", value: "9", icon: "Hash" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card p-6 text-center">
              <Icon name={stat.icon} size={20} className="text-neon mx-auto mb-2" />
              <p className="font-display text-3xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="section-divider mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {MY_POSTS.map((post, i) => (
            <div key={post.id} className="bg-background">
              <PostCard post={post} index={i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CreatePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["#репортаж"]);
  const [category, setCategory] = useState("Фотография");

  const addTag = () => {
    const t = tagInput.trim().startsWith("#") ? tagInput.trim() : "#" + tagInput.trim();
    if (t.length > 1 && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  return (
    <div className="animate-fade-in px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono-custom text-xs text-neon tracking-widest uppercase mb-2">Новая публикация</p>
        <h2 className="font-display text-5xl font-bold mb-10">Создать пост</h2>

        <div className="space-y-6">
          <div>
            <label className="font-mono-custom text-xs text-muted-foreground uppercase tracking-widest block mb-2">Категория</label>
            <div className="flex flex-wrap gap-2">
              {["Фотография", "Путешествия", "Музыка", "Дизайн", "Еда", "Технологии"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 text-sm border transition-all ${
                    category === c
                      ? "border-neon text-neon bg-neon/10"
                      : "border-border text-muted-foreground hover:border-neon/50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono-custom text-xs text-muted-foreground uppercase tracking-widest block mb-2">Заголовок</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Захватывающий заголовок вашей истории..."
              className="w-full bg-card border border-border px-4 py-4 font-display text-2xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon transition-colors"
            />
          </div>

          <div>
            <label className="font-mono-custom text-xs text-muted-foreground uppercase tracking-widest block mb-2">Медиафайл</label>
            <div className="border border-dashed border-border hover:border-neon/50 transition-colors p-12 text-center cursor-pointer group">
              <Icon name="Upload" size={32} className="text-muted-foreground group-hover:text-neon mx-auto mb-3 transition-colors" />
              <p className="text-muted-foreground text-sm">Перетащите фото или видео</p>
              <p className="text-muted-foreground/50 text-xs mt-1">PNG, JPG, MP4 · до 50MB</p>
            </div>
          </div>

          <div>
            <label className="font-mono-custom text-xs text-muted-foreground uppercase tracking-widest block mb-2">Текст</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Расскажите вашу историю..."
              rows={8}
              className="w-full bg-card border border-border px-4 py-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon transition-colors resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="font-mono-custom text-xs text-muted-foreground uppercase tracking-widest block mb-2">Хештеги</label>
            <div className="flex gap-2 mb-3">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                placeholder="#добавить тег"
                className="flex-1 bg-card border border-border px-4 py-2 font-mono-custom text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon transition-colors"
              />
              <button onClick={addTag} className="px-4 py-2 bg-neon text-black font-mono-custom text-xs font-medium tracking-widest hover:bg-neon/90 transition-colors">
                + ДОБАВИТЬ
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="hashtag active flex items-center gap-1">
                  {t}
                  <button onClick={() => removeTag(t)} className="ml-1 hover:text-red-400">×</button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono-custom text-xs text-muted-foreground uppercase tracking-widest block mb-2">Поделиться в</label>
            <div className="flex gap-3">
              {[
                { name: "Telegram", icon: "Send" },
                { name: "ВКонтакте", icon: "Users" },
                { name: "Twitter/X", icon: "Twitter" },
              ].map((s) => (
                <button key={s.name} className="flex items-center gap-2 px-4 py-2 border border-border text-muted-foreground text-sm transition-all hover:border-neon/50 hover:text-neon">
                  <Icon name={s.icon} size={14} />
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button className="flex-1 py-4 bg-neon text-black font-mono-custom font-medium tracking-widest text-sm hover:bg-neon/90 transition-all glow-neon flex items-center justify-center gap-2">
              <Icon name="Zap" size={16} />
              ОПУБЛИКОВАТЬ
            </button>
            <button className="px-8 py-4 border border-border text-muted-foreground font-mono-custom text-sm hover:border-neon/50 transition-colors">
              ЧЕРНОВИК
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GalleryPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const allTags = Array.from(new Set(GALLERY_IMAGES.flatMap((i) => i.tags)));
  const filtered = activeTag ? GALLERY_IMAGES.filter((i) => i.tags.includes(activeTag)) : GALLERY_IMAGES;

  return (
    <div className="animate-fade-in px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <p className="font-mono-custom text-xs text-neon tracking-widest uppercase mb-2">Медиатека</p>
        <h2 className="font-display text-5xl font-bold mb-8">Галерея</h2>

        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setActiveTag(null)} className={`hashtag ${activeTag === null ? "active" : ""}`}>#все</button>
          {allTags.map((t) => (
            <HashtagBadge key={t} tag={t} active={activeTag === t} onClick={() => setActiveTag(activeTag === t ? null : t)} />
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border">
          {filtered.map((img, i) => (
            <div key={img.id} className={`relative overflow-hidden group cursor-pointer animate-slide-up stagger-${Math.min(i + 1, 5)}`} style={{ aspectRatio: "4/3" }}>
              <img src={img.url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 image-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="flex flex-wrap gap-1">
                  {img.tags.map((t) => <HashtagBadge key={t} tag={t} />)}
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="p-2 bg-black/60 border border-neon/30 text-neon hover:bg-neon/20 transition-colors">
                    <Icon name="Share2" size={14} />
                  </button>
                  <button className="p-2 bg-black/60 border border-white/20 text-white hover:bg-white/20 transition-colors">
                    <Icon name="Download" size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = SAMPLE_POSTS.filter((p) => {
    const matchQuery = !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.excerpt.toLowerCase().includes(query.toLowerCase());
    const matchTag = !activeTag || p.tags.includes(activeTag);
    return matchQuery && matchTag;
  });

  return (
    <div className="animate-fade-in px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <p className="font-mono-custom text-xs text-neon tracking-widest uppercase mb-2">Поиск</p>
        <h2 className="font-display text-5xl font-bold mb-8">Найти</h2>

        <div className="relative mb-6">
          <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по заголовку, тексту..."
            className="w-full bg-card border border-border pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon transition-colors text-lg"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-8 items-center">
          <p className="font-mono-custom text-xs text-muted-foreground mr-2 uppercase tracking-widest">Теги:</p>
          {ALL_TAGS.map((t) => (
            <HashtagBadge key={t} tag={t} active={activeTag === t} onClick={() => setActiveTag(activeTag === t ? null : t)} />
          ))}
        </div>

        <p className="font-mono-custom text-xs text-muted-foreground mb-4 uppercase tracking-widest">
          Найдено: {filtered.length}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {filtered.map((post, i) => (
            <div key={post.id} className="bg-background">
              <PostCard post={post} index={i} />
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Icon name="Search" size={40} className="text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Ничего не найдено</p>
            <p className="text-xs text-muted-foreground/50 mt-1">Попробуйте другие теги или запрос</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsPage() {
  const [name, setName] = useState("Алексей Морозов");
  const [bio, setBio] = useState("Фотограф и репортёр. Снимаю города и людей.");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [autoShare, setAutoShare] = useState(false);

  return (
    <div className="animate-fade-in px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <p className="font-mono-custom text-xs text-neon tracking-widest uppercase mb-2">Аккаунт</p>
        <h2 className="font-display text-5xl font-bold mb-10">Настройки</h2>

        <div className="space-y-8">
          <div className="bg-card border border-border p-6">
            <h3 className="font-mono-custom text-xs text-muted-foreground uppercase tracking-widest mb-5">Профиль</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-neon/20 border border-neon/40 flex items-center justify-center">
                <Icon name="User" size={24} className="text-neon" />
              </div>
              <button className="text-sm text-neon border border-neon/40 px-4 py-2 hover:bg-neon/10 transition-colors font-mono-custom">
                ИЗМЕНИТЬ ФОТО
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-mono-custom text-xs text-muted-foreground uppercase tracking-widest block mb-2">Имя</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-background border border-border px-4 py-3 text-foreground focus:outline-none focus:border-neon transition-colors" />
              </div>
              <div>
                <label className="font-mono-custom text-xs text-muted-foreground uppercase tracking-widest block mb-2">О себе</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full bg-background border border-border px-4 py-3 text-foreground focus:outline-none focus:border-neon transition-colors resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-6">
            <h3 className="font-mono-custom text-xs text-muted-foreground uppercase tracking-widest mb-5">Уведомления</h3>
            <div className="space-y-4">
              {[
                { label: "Email уведомления", sub: "При новых просмотрах", value: emailNotifs, set: setEmailNotifs },
                { label: "Авто-репост", sub: "Делиться в соцсетях автоматически", value: autoShare, set: setAutoShare },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                  </div>
                  <button
                    onClick={() => item.set(!item.value)}
                    className={`w-12 h-6 rounded-full transition-all relative ${item.value ? "bg-neon" : "bg-secondary"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-all ${item.value ? "left-7" : "left-1"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full py-4 bg-neon text-black font-mono-custom font-medium tracking-widest hover:bg-neon/90 transition-all glow-neon">
            СОХРАНИТЬ ИЗМЕНЕНИЯ
          </button>
        </div>
      </div>
    </div>
  );
}

function SocialsPage() {
  const shareUrl = window.location.href;

  const platforms = [
    { name: "Telegram", desc: "Поделитесь в каналах и чатах", icon: "Send", color: "#29B6F6", link: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=Смотрите мои новости на МЕДИА` },
    { name: "ВКонтакте", desc: "Опубликуйте на странице или в группе", icon: "Users", color: "#4A76A8", link: `https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}` },
    { name: "Twitter / X", desc: "Твитните ссылку на ваш материал", icon: "Twitter", color: "#1DA1F2", link: `https://twitter.com/intent/tweet?text=Смотрите мои новости&url=${encodeURIComponent(shareUrl)}` },
    { name: "WhatsApp", desc: "Отправьте в личку или группу", icon: "MessageCircle", color: "#25D366", link: `https://wa.me/?text=Смотрите мои новости ${encodeURIComponent(shareUrl)}` },
    { name: "Одноклассники", desc: "Поделитесь в социальной сети", icon: "Star", color: "#EE8208", link: `https://ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=${encodeURIComponent(shareUrl)}` },
  ];

  const copyLink = () => navigator.clipboard.writeText(shareUrl);

  return (
    <div className="animate-fade-in px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono-custom text-xs text-neon tracking-widest uppercase mb-2">Распространение</p>
        <h2 className="font-display text-5xl font-bold mb-10">Соцсети</h2>

        <div className="bg-card border border-border p-5 mb-8 flex items-center gap-3">
          <Icon name="Link" size={18} className="text-neon flex-shrink-0" />
          <p className="text-sm text-muted-foreground flex-1 font-mono-custom truncate">{shareUrl}</p>
          <button onClick={copyLink} className="px-4 py-2 bg-neon text-black text-xs font-mono-custom font-medium tracking-widest hover:bg-neon/90 transition-all whitespace-nowrap">
            КОПИРОВАТЬ
          </button>
        </div>

        <div className="space-y-px bg-border">
          {platforms.map((p) => (
            <div key={p.name} className="bg-card p-5 flex items-center justify-between card-hover">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center" style={{ background: p.color + "20", border: `1px solid ${p.color}40` }}>
                  <Icon name={p.icon} size={18} style={{ color: p.color }} />
                </div>
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                </div>
              </div>
              <a href={p.link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-border text-muted-foreground text-xs font-mono-custom hover:border-neon/50 hover:text-neon transition-all tracking-widest">
                ОТКРЫТЬ →
              </a>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-card border border-border p-6">
          <h3 className="font-mono-custom text-xs text-muted-foreground uppercase tracking-widest mb-5">Статистика распространения</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-display text-3xl font-bold text-neon">924</p>
              <p className="text-xs text-muted-foreground mt-1">Репостов</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-neon">5</p>
              <p className="text-xs text-muted-foreground mt-1">Платформы</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-neon">7.0k</p>
              <p className="text-xs text-muted-foreground mt-1">Охват</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const NAV_ITEMS: { id: Page; label: string; icon: string; short: string }[] = [
  { id: "home", label: "Главная", icon: "Newspaper", short: "Главная" },
  { id: "my-news", label: "Мои новости", icon: "BookOpen", short: "Мои" },
  { id: "create", label: "Создать пост", icon: "PlusSquare", short: "Создать" },
  { id: "gallery", label: "Галерея", icon: "Image", short: "Галерея" },
  { id: "search", label: "Поиск", icon: "Search", short: "Поиск" },
  { id: "settings", label: "Настройки", icon: "Settings", short: "Настройки" },
  { id: "socials", label: "Соцсети", icon: "Share2", short: "Соцсети" },
];

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTagFilter = (_tag: string) => {
    setPage("search");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-6 py-3">
          <button onClick={() => setPage("home")} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-neon flex items-center justify-center">
              <span className="font-mono-custom text-xs font-bold text-black">М</span>
            </div>
            <span className="font-display text-xl font-bold tracking-tight">МЕДИА</span>
          </button>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`nav-item font-mono-custom text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors py-1 ${page === item.id ? "active" : ""}`}
              >
                {item.short}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage("create")}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-neon text-black font-mono-custom text-xs font-medium tracking-widest hover:bg-neon/90 transition-all"
            >
              <Icon name="Plus" size={12} />
              СОЗДАТЬ
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-muted-foreground">
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card animate-fade-in">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => { setPage(item.id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-6 py-4 border-b border-border text-left transition-colors ${page === item.id ? "text-neon bg-neon/5" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon name={item.icon} size={16} />
                <span className="font-mono-custom text-sm tracking-widest uppercase">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="scrollbar-thin">
        {page === "home" && <HomePage onTagFilter={handleTagFilter} />}
        {page === "my-news" && <MyNewsPage />}
        {page === "create" && <CreatePage />}
        {page === "gallery" && <GalleryPage />}
        {page === "search" && <SearchPage />}
        {page === "settings" && <SettingsPage />}
        {page === "socials" && <SocialsPage />}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50">
        <div className="flex">
          {NAV_ITEMS.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${page === item.id ? "text-neon" : "text-muted-foreground"}`}
            >
              <Icon name={item.icon} size={18} />
              <span className="text-[9px] font-mono-custom uppercase tracking-wide">{item.short}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="md:hidden h-16" />
    </div>
  );
}