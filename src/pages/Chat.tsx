import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/Logo";
import { Send, Plus, LogOut, Heart, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { getDailyWisdom } from "@/lib/quotes";
import lotus from "@/assets/lotus-icon.png";

type Msg = { id?: string; role: "user" | "assistant"; content: string };
type Conv = { id: string; title: string; mood: string | null; updated_at: string };

const MOODS = [
  { v: "calm", l: "Calm", e: "🌿" },
  { v: "anxious", l: "Anxious", e: "🌊" },
  { v: "sad", l: "Sad", e: "🌧" },
  { v: "stressed", l: "Stressed", e: "🔥" },
  { v: "lonely", l: "Lonely", e: "🌙" },
  { v: "hopeful", l: "Hopeful", e: "🌅" },
  { v: "lost", l: "Lost", e: "🧭" },
  { v: "grateful", l: "Grateful", e: "🪷" },
];

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conv[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [moodSelected, setMoodSelected] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const daily = getDailyWisdom();

  useEffect(() => {
    document.title = "Your Saarthi — Reflect, find clarity";
  }, []);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  async function loadConversations() {
    const { data } = await supabase.from("conversations").select("id,title,mood,updated_at").order("updated_at", { ascending: false });
    setConversations(data ?? []);
  }

  async function loadMessages(conversationId: string) {
    setActiveId(conversationId);
    const { data } = await supabase.from("messages").select("id,role,content").eq("conversation_id", conversationId).order("created_at");
    setMessages((data ?? []).map((m: any) => ({ id: m.id, role: m.role, content: m.content })));
    setMoodSelected(null);
  }

  async function newConversation(mood?: string) {
    if (!user) return null;
    const { data, error } = await supabase.from("conversations").insert({ user_id: user.id, title: "New reflection", mood: mood ?? null }).select().single();
    if (error || !data) { toast.error("Could not start a new reflection"); return null; }
    if (mood) {
      await supabase.from("mood_entries").insert({ user_id: user.id, mood, intensity: 5 });
    }
    await loadConversations();
    setActiveId(data.id);
    setMessages([]);
    setMoodSelected(mood ?? null);
    return data.id as string;
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || streaming || !user) return;
    let convId = activeId;
    if (!convId) {
      convId = await newConversation(moodSelected ?? undefined);
      if (!convId) return;
    }
    const userMsg: Msg = { role: "user", content: text };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setStreaming(true);

    // Persist user message
    await supabase.from("messages").insert({ conversation_id: convId, user_id: user.id, role: "user", content: text });

    // Build history for AI
    const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: history, mood: moodSelected }),
      });
      if (resp.status === 429) { toast.error("A breath, then try again — you're going faster than the rate limit allows."); setStreaming(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted. Please add credits in Settings → Workspace → Usage."); setStreaming(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ""; let assistantSoFar = ""; let done = false;
      setMessages((p) => [...p, { role: "assistant", content: "" }]);

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (c) {
              assistantSoFar += c;
              setMessages((p) => p.map((m, i) => i === p.length - 1 ? { ...m, content: assistantSoFar } : m));
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Persist assistant message + update conversation title from first user msg
      await supabase.from("messages").insert({ conversation_id: convId, user_id: user.id, role: "assistant", content: assistantSoFar });
      if (history.length === 1) {
        const title = text.slice(0, 60) + (text.length > 60 ? "…" : "");
        await supabase.from("conversations").update({ title, updated_at: new Date().toISOString() }).eq("id", convId);
        loadConversations();
      } else {
        await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
      }
    } catch (e: any) {
      toast.error("The connection wavered. Please try again.");
      console.error(e);
    } finally {
      setStreaming(false);
    }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-temple"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-temple flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r border-border/60 bg-card/40 backdrop-blur">
        <div className="p-5 border-b border-border/50"><Logo /></div>
        <div className="p-4">
          <Button variant="hero" className="w-full" onClick={() => { setActiveId(null); setMessages([]); setMoodSelected(null); }}>
            <Plus className="h-4 w-4" /> New reflection
          </Button>
        </div>
        <div className="px-3 pb-2 text-xs uppercase tracking-widest text-muted-foreground">Your reflections</div>
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {conversations.length === 0 && <p className="px-3 text-sm text-muted-foreground italic">Your conversations will appear here.</p>}
          {conversations.map((c) => (
            <button key={c.id} onClick={() => loadMessages(c.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors ${activeId === c.id ? "bg-primary/15 text-foreground" : "hover:bg-primary/5 text-muted-foreground"}`}>
              <div className="truncate font-medium text-foreground/90">{c.title}</div>
              <div className="text-xs text-muted-foreground">{new Date(c.updated_at).toLocaleDateString()}</div>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-border/50 flex items-center justify-between">
          <div className="text-xs text-muted-foreground truncate max-w-[10rem]">{user?.email}</div>
          <Button variant="ghost" size="icon" onClick={() => supabase.auth.signOut().then(() => navigate("/"))} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border/60 bg-card/60 backdrop-blur">
          <Logo />
          <Button variant="ghost" size="icon" onClick={() => supabase.auth.signOut().then(() => navigate("/"))}><LogOut className="h-4 w-4" /></Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="container max-w-3xl py-8">
            {messages.length === 0 ? (
              <div className="fade-up">
                <div className="text-center mb-10">
                  <img src={lotus} alt="" className="mx-auto h-16 w-16 float-slow" />
                  <p className="mt-4 text-xs uppercase tracking-[0.3em] text-primary">A safe space</p>
                  <h1 className="mt-2 font-display text-4xl md:text-5xl">How is your heart today?</h1>
                  <p className="mt-3 text-muted-foreground max-w-lg mx-auto">Choose what you're feeling, or simply begin writing. There is no wrong way to start.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  {MOODS.map((m) => (
                    <button key={m.v} onClick={() => setMoodSelected(m.v)}
                      className={`p-4 rounded-2xl border text-center transition-all ${moodSelected === m.v ? "bg-gradient-aurum text-primary-foreground border-primary shadow-warm scale-105" : "bg-card/60 border-border hover:border-primary/50 hover:shadow-soft"}`}>
                      <div className="text-2xl">{m.e}</div>
                      <div className="mt-1 text-sm font-medium">{m.l}</div>
                    </button>
                  ))}
                </div>

                <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-cream/40">
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs uppercase tracking-widest text-primary">Today's wisdom</p>
                      <p className="mt-2 font-display text-xl italic">"{daily.text}"</p>
                      <p className="mt-1 text-sm text-muted-foreground">— {daily.source}</p>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} fade-up`}>
                    <div className={`max-w-[85%] rounded-3xl px-5 py-4 ${m.role === "user" ? "bg-gradient-aurum text-primary-foreground shadow-soft" : "bg-card border border-primary/15 shadow-soft"}`}>
                      {m.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-display prose-strong:text-foreground prose-em:text-primary">
                          <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {streaming && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex justify-start"><div className="bg-card border border-primary/15 rounded-3xl px-5 py-4 text-muted-foreground italic">Reflecting…</div></div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-border/60 bg-card/60 backdrop-blur">
          <div className="container max-w-3xl py-4">
            <div className="flex gap-3 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Share what's on your mind… (Shift+Enter for new line)"
                rows={1}
                className="resize-none min-h-[52px] max-h-40 bg-background/80 border-primary/20 focus-visible:ring-primary rounded-2xl"
                disabled={streaming}
              />
              <Button variant="hero" size="icon" onClick={sendMessage} disabled={streaming || !input.trim()} className="h-[52px] w-[52px] rounded-2xl flex-shrink-0">
                {streaming ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
            <p className="mt-2 text-xs text-center text-muted-foreground italic">
              Saarthi is an AI companion, not a substitute for licensed care. In crisis, please reach out to local emergency services.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
