import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";

export function SiteHeader() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/"><Logo /></Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="/#wisdom" className="text-muted-foreground hover:text-foreground transition-colors">Wisdom</a>
          <a href="/#how" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/chat"><Button variant="default">Open Chat</Button></Link>
              <Button variant="ghost" size="icon" onClick={() => supabase.auth.signOut()} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth"><Button variant="default">Begin Journey</Button></Link>
          )}
        </div>
      </div>
    </header>
  );
}
