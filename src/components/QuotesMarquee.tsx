import { useEffect, useState } from "react";
import { allQuotes } from "@/lib/quotes";

export function QuotesMarquee({ reverse = false }: { reverse?: boolean }) {
  const items = [...allQuotes, ...allQuotes];
  return (
    <div className="relative overflow-hidden border-y border-primary/20 bg-gradient-to-r from-cream via-ivory to-cream py-4">
      <div className={`flex gap-12 whitespace-nowrap ${reverse ? "marquee-reverse" : "marquee"}`}>
        {items.map((q, i) => (
          <span key={i} className="inline-flex items-center gap-3 text-sm md:text-base">
            <span className="text-primary">✦</span>
            <span className="font-display italic text-foreground/80">"{q.text}"</span>
            <span className="text-muted-foreground">— {q.source}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function RotatingQuote() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % allQuotes.length), 6000);
    return () => clearInterval(id);
  }, []);
  const q = allQuotes[idx];
  return (
    <div key={idx} className="fade-up text-center">
      <p className="font-display text-2xl md:text-3xl italic text-foreground leading-relaxed">"{q.text}"</p>
      <p className="mt-3 text-sm tracking-widest uppercase text-primary">— {q.source}</p>
    </div>
  );
}
