import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import hero from "@/assets/hero-meditation.jpg";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Sign in — Saarthi · Bhagavad Gita AI Companion";
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/chat", { replace: true });
    });
  }, [navigate]);

  const onGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/chat` });
      if (error) toast.error(error.message ?? "Google sign-in failed");
    } finally { setLoading(false); }
  };

  const onEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/chat`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Welcome. Check your inbox to confirm — or sign in if confirmation is disabled.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/chat");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <section className="relative hidden lg:flex items-end overflow-hidden bg-night">
        <img src={hero} alt="Person meditating at sunrise" className="absolute inset-0 h-full w-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-deep via-indigo-deep/40 to-transparent" />
        <div className="relative p-12 text-ivory max-w-lg fade-up">
          <p className="text-sm tracking-[0.3em] uppercase text-gold">Saarthi · सारथि</p>
          <h2 className="mt-4 font-display text-4xl leading-tight">A calm voice, when the mind is loud.</h2>
          <p className="mt-4 text-ivory/80 italic font-display text-lg">"You have the right to action, never to its fruits." — Bhagavad Gita 2.47</p>
        </div>
      </section>
      <section className="flex items-center justify-center p-6 md:p-12 bg-temple">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center"><Logo className="justify-center" /></div>
          <Card className="p-8 shadow-soft border-primary/20">
            <h1 className="font-display text-3xl text-center">{mode === "signin" ? "Welcome back" : "Begin your journey"}</h1>
            <p className="mt-2 text-center text-muted-foreground text-sm">{mode === "signin" ? "Continue your conversation with steady wisdom." : "Create your private companion in a moment."}</p>

            <Button onClick={onGoogle} disabled={loading} variant="outline" size="lg" className="w-full mt-6">
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </Button>

            <div className="my-6 ornament-line text-xs uppercase tracking-widest">or</div>

            <form onSubmit={onEmail} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <Label htmlFor="name">Your name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Arjun" />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button type="submit" disabled={loading} variant="hero" size="lg" className="w-full">
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-sm text-center text-muted-foreground">
              {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
              <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary font-medium hover:underline">
                {mode === "signin" ? "Create account" : "Sign in"}
              </button>
            </p>
          </Card>
          <p className="mt-6 text-xs text-center text-muted-foreground italic">
            Saarthi is an AI companion inspired by wisdom traditions. It is not a substitute for licensed care or emergency services.
          </p>
        </div>
      </section>
    </main>
  );
}
