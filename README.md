# Free3 Chat: A Multi-Model Conversational AI Experience

> Engineered in just one week, Free3 Chat is a feature-rich, multi-provider chat platform with deep user customization and a pixel-perfect interface based on T3 Chat.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
</p>

---

## 🚀 Introduction

Free3 Chat seamlessly integrates multiple leading AI models, offers robust user management, and delivers a deeply personalized experience—all wrapped in a fluid, animated UI.

---

## ✨ Core Features

### 💬 Real-time Streaming Conversations
- **Token-by-token rendering** for a natural, live chat feel.

### 🤖 Multi-Model Support
- **Switch on the fly** between providers like Google Gemini, Groq (LLaMA, Qwen, etc.), and more.

### 🎨 Deep UI Customization
- **Themes**: Light & Dark modes, crafted with care.  
- **Visual Filters**: Adjust Hue, Contrast, Saturation in real-time.  
- **Custom Fonts**: Proxima Nova, Inter, Comic Sans, and more.

### 🔐 Authentication & Anonymous Mode
- **Full user auth** plus anonymous chat with local-storage history.

### 📝 Full Chat Control
- **Edit & retry** prompts and AI responses instantly.

### 💻 Rich Markdown & Code Support
- **Syntax highlighting**, copy toggles, and word-wrap options.

### 🗂️ Persistent History
- **Supabase-backed** for logged-in users; **localStorage** for anonymous users.

### 📱 Fully Responsive
- Slick experience on desktop **and** mobile.

---

## 🛠️ Engineering Showcase

### 1. Full-Stack Architecture with Next.js 14  
- **Server & Client Components**  
  - Hybrid rendering: SSR for static UI, “use client” for interactivity.  
- **Clean API Routes** under `/app/api/` for auth, streaming, DB ops, etc.

### 2. Real-time Streaming & Multi-Provider Backend  
- **ReadableStream** pipes tokens directly to the client.  
- **Provider-Agnostic Abstraction** with a `modelMapping` layer.  
- **Atomic DB Writes**: Only save once the full stream completes.

```typescript
// /app/api/chats/[chatId]/messages/[messageId]/stream/route.ts
const stream = new ReadableStream({
  async start(controller) {
    let fullResponse = '';
    for await (const chunk of apiStream) {
      const text = provider === 'google'
        ? chunk.text()
        : chunk.choices[0]?.delta?.content ?? '';
      if (text) {
        fullResponse += text;
        controller.enqueue(new TextEncoder().encode(text));
      }
    }
    await supabase
      .from('messages')
      .update({ content: fullResponse })
      .eq('id', messageId);
    controller.close();
  },
});
````

### 3. Robust Data Layer with Supabase & RLS

* **PostgreSQL** via Supabase for database, auth, and API.
* **Schema**: UUIDs, foreign keys, indexed for performance.
* **Row Level Security**: Scaffolded for production-grade isolation.
* **Dual User Mode**: Authenticated `user_id` vs. anonymous `anonymous_id`.

### 4. Advanced Component-Driven UI

* **Reusable React Components**: `ModelPickerModal`, `CodeBlock`, `HoldTooltip`, etc.
* **Global State** via React Context for theming and fonts.
* **Custom Hooks**: `useFont`, `useCopyToClipboard`, etc.
* **Animations** with Framer Motion for fluidity.

### 5. Dynamic Theming & Customization Engine

* **CSS Variables** in `globals.css` drive the entire palette.
* **Live Style Manipulation** via sliders on the Settings page.
* **Font-Swapping** with FontProvider, persisted to `localStorage`.

---

## 💻 Getting Started

### Prerequisites

* **Node.js** v18+
* **npm**, **yarn**, or **pnpm**
* **Supabase** account (free tier)
* **Google Gemini** & **Groq** API keys
* **NextAuth** secret for sessions

### Clone & Install

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
npm install
```

### Supabase Setup

1. Create a new project at [Supabase](https://app.supabase.com).
2. In **SQL Editor**, run the contents of `db/schema.sql`.
3. Copy your **Project URL** & **anon key**.

### Environment Variables

Create a `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY
GROQ_API_KEY=YOUR_GROQ_API_KEY

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=YOUR_RANDOM_SECRET
```

### Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔮 Future Improvements

* **Full RLS** enforcement so users only access their own data
* **Image & File Uploads** via vision models
* **Web Search Integration** for up-to-date info
* **Shareable Conversations**
* **Team/Workspace** collaboration
* **Unit & Integration Tests** (Jest, React Testing Library)