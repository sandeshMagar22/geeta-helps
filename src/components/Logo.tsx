import lotus from "@/assets/lotus-icon.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <img src={lotus} alt="" className="h-9 w-9 object-contain" />
      <span className="font-display text-2xl font-semibold tracking-tight">
        <span className="text-foreground">Sa</span>
        <span className="text-gradient-gold">ar</span>
        <span className="text-foreground">thi</span>
      </span>
    </div>
  );
}
