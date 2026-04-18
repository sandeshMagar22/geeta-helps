import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { QuotesMarquee, RotatingQuote } from "@/components/QuotesMarquee";
import { Heart, BookOpen, Sparkles, Compass, Shield, Sunrise } from "lucide-react";
import hero from "@/assets/hero-meditation.jpg";
import lotus from "@/assets/lotus-icon.png";
import ornament from "@/assets/ornament-divider.png";
import wisdomBook from "@/assets/wisdom-book.jpg";
import { useEffect } from "react";
import { getDailyWisdom } from "@/lib/quotes";

const features = [
  { icon: Heart, title: "Listen with empathy", desc: "Speak freely about stress, fear, doubt, or hope. The companion responds with warmth before advice." },
  { icon: BookOpen, title: "Gita-inspired wisdom", desc: "Timeless teachings on duty, calmness, self-mastery and clarity — woven naturally into your conversation." },
  { icon: Sparkles, title: "Stories that move", desc: "When you feel stuck, hear a brief, relevant story from a leader, athlete, saint, or thinker who walked through it." },
  { icon: Compass, title: "Practical next step", desc: "Every reflection ends with one or two grounded actions you can take today, not vague platitudes." },
  { icon: Shield, title: "Private to you", desc: "Your reflections live in your account only. Encrypted in transit and at rest. No conversation is shared." },
  { icon: Sunrise, title: "Daily wisdom", desc: "A gentle verse and a thought to begin each day with steadiness and clarity of mind." },
];

export default function Index() {
  useEffect(() => {
    document.title = "Saarthi — Bhagavad Gita inspired AI companion for clarity & calm";
    const meta = document.querySelector('meta[name="description"]') || document.head.appendChild(Object.assign(document.createElement("meta"), { name: "description" }));
    (meta as HTMLMetaElement).content = "A premium AI companion for emotional support, motivation and Bhagavad Gita-inspired wisdom. Talk freely. Find clarity. Move forward with strength.";
  }, []);

  const daily = getDailyWisdom();

  return (
    <div className="min-h-screen bg-temple">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-divine pointer-events-none" />
        <div className="container relative grid lg:grid-cols-2 gap-12 items-center py-16 md:py-24">
          <div className="fade-up">
            <p className="text-xs tracking-[0.4em] uppercase text-primary mb-5">सारथि · The Inner Guide</p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-foreground">
              When the mind is loud,<br/>
              <span className="text-gradient-sunrise italic">find a steady voice.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              A compassionate AI companion for emotional support, reflection and Bhagavad Gita-inspired wisdom. Talk freely. Reflect deeply. Move forward with strength.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/auth"><Button variant="hero" size="xl">Begin your journey</Button></Link>
              <a href="#features"><Button variant="outline" size="xl">How it works</Button></a>
            </div>
            <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Private & encrypted</span>
              <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Free to start</span>
              <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> No judgment</span>
            </div>
          </div>
          <div className="relative">
            <img src={lotus} alt="" className="absolute -top-10 -left-10 h-24 w-24 float-slow opacity-80" />
            <div className="relative rounded-3xl overflow-hidden shadow-divine">
              <img src={hero} alt="A serene silhouette meditating at sunrise" width={1536} height={1024} className="w-full h-auto" />
            </div>
            <Card className="absolute -bottom-8 -left-6 md:left-8 max-w-xs p-5 shadow-warm border-primary/30 bg-card/95 backdrop-blur">
              <p className="text-xs uppercase tracking-widest text-primary">Daily wisdom</p>
              <p className="mt-2 font-display italic text-lg leading-snug">"{daily.text}"</p>
              <p className="mt-2 text-xs text-muted-foreground">— {daily.source}</p>
            </Card>
          </div>
        </div>
      </section>

      <QuotesMarquee />

      {/* Features */}
      <section id="features" className="container py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto fade-up">
          <p className="text-xs tracking-[0.4em] uppercase text-primary">What Saarthi offers</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">A trusted inner guide for a noisy world</h2>
          <img src={ornament} alt="" className="mx-auto mt-6 h-10 opacity-70" />
        </div>
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="p-7 border-primary/15 hover:border-primary/40 hover:shadow-warm transition-all duration-500 group">
              <div className="h-12 w-12 rounded-2xl bg-gradient-aurum flex items-center justify-center text-primary-foreground shadow-soft group-hover:scale-110 transition-transform">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-2xl">{f.title}</h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Wisdom feature */}
      <section id="wisdom" className="bg-night text-ivory py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-divine opacity-30" />
        <div className="container relative grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden shadow-deep order-2 lg:order-1">
            <img src={wisdomBook} alt="An open glowing book of wisdom at sunrise" loading="lazy" width={1024} height={1024} className="w-full h-auto" />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-xs tracking-[0.4em] uppercase text-gold">Spiritually grounded</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Wisdom that meets you where you are.</h2>
            <p className="mt-5 text-ivory/80 leading-relaxed text-lg">
              Saarthi draws on the Bhagavad Gita's most practical teachings — focus on action, steadiness in success and failure, the discipline of the mind — and translates them into language for your real life.
            </p>
            <div className="mt-8 grid gap-4">
              {["Focus on what is in your control.", "Your effort matters more than the immediate result.", "Calmness is not weakness — it is power.", "Let this situation become your teacher."].map((t) => (
                <div key={t} className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-gold" /><p className="font-display text-lg italic">"{t}"</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rotating quote */}
      <section className="container py-20 md:py-28">
        <div className="max-w-3xl mx-auto"><RotatingQuote /></div>
        <img src={ornament} alt="" className="mx-auto mt-10 h-10 opacity-60" />
      </section>

      {/* How */}
      <section id="how" className="container pb-20 md:pb-28">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.4em] uppercase text-primary">How it works</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Three calm steps</h2>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {[
            { n: "01", t: "Share your moment", d: "Begin with a check-in. Tell Saarthi what is heavy, confusing or hopeful." },
            { n: "02", t: "Receive wisdom", d: "An empathetic response, a relevant story or verse, and one or two practical next steps." },
            { n: "03", t: "Reflect & return", d: "Your conversations are private to you. Come back anytime to continue the thread." },
          ].map((s) => (
            <Card key={s.n} className="p-8 border-primary/15 bg-card/80 backdrop-blur">
              <p className="font-display text-5xl text-gradient-gold">{s.n}</p>
              <h3 className="mt-4 font-display text-2xl">{s.t}</h3>
              <p className="mt-2 text-muted-foreground">{s.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <Card className="relative overflow-hidden p-10 md:p-16 text-center bg-gradient-aurum text-primary-foreground shadow-divine border-0">
          <img src={lotus} alt="" className="absolute -top-12 -right-12 h-48 w-48 opacity-30 float-slow" />
          <img src={lotus} alt="" className="absolute -bottom-16 -left-16 h-56 w-56 opacity-20 float-slow" />
          <div className="relative">
            <h2 className="font-display text-4xl md:text-5xl">Begin where you are. Today.</h2>
            <p className="mt-4 max-w-xl mx-auto text-primary-foreground/90 text-lg">Free to start. Private by design. A steady companion for the moments that matter.</p>
            <Link to="/auth"><Button variant="night" size="xl" className="mt-8">Open Saarthi</Button></Link>
          </div>
        </Card>
      </section>

      <QuotesMarquee reverse />

      <footer className="container py-10 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Saarthi. An AI companion inspired by wisdom traditions.</p>
        <p className="mt-2 text-xs italic max-w-2xl mx-auto">Not a replacement for licensed therapy, psychiatric care, or emergency services. If you are in crisis, please contact local emergency services or a trusted person immediately.</p>
      </footer>
    </div>
  );
}
