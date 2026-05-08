import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cloudSync } from "@/lib/cloud-sync";
import { toast } from "sonner";
import { Moon, LogOut, Sparkles } from "lucide-react";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, signOut } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { cloudSync.setUser(user?.id ?? null); }, [user]);

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-paper/60 font-hand text-2xl">opening the moonlight…</div>;
  }

  if (!user) {
    const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      setBusy(true);
      try {
        if (mode === "signup") {
          const { error } = await supabase.auth.signUp({
            email, password,
            options: { data: { display_name: name }, emailRedirectTo: `${window.location.origin}/` },
          });
          if (error) throw error;
          toast.success("welcome to the moonlit ✦");
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
        }
      } catch (err: any) {
        toast.error(err.message || "something soft went wrong");
      } finally { setBusy(false); }
    };

    return (
      <div className="min-h-screen relative grid place-items-center px-6 py-16">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-night)" }} />
        <form onSubmit={submit} className="glass-panel grain rounded-3xl p-8 w-full max-w-md animate-fade-up">
          <div className="text-center mb-6">
            <Moon className="w-10 h-10 text-cloud-pink mx-auto mb-2" />
            <p className="font-sans text-xs tracking-[0.4em] text-cloud-pink">✦  MOONLIT  ✦</p>
            <h1 className="font-serif italic text-4xl text-paper mt-2">a quiet place,<br/>just for you</h1>
            <p className="font-hand text-xl text-cloud-lilac mt-2">your diary stays private. promise.</p>
          </div>
          {mode === "signup" && (
            <div className="mb-3">
              <Label className="font-hand text-lg text-paper/80">what should i call you?</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="moonchild" className="bg-night-mid/60" />
            </div>
          )}
          <div className="mb-3">
            <Label className="font-hand text-lg text-paper/80">email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-night-mid/60" />
          </div>
          <div className="mb-5">
            <Label className="font-hand text-lg text-paper/80">password</Label>
            <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-night-mid/60" />
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-cloud-pink text-ink hover:bg-bow font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            {busy ? "…" : mode === "signup" ? "begin my dreamscape" : "step inside"}
          </Button>
          <button type="button" onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="w-full mt-4 text-paper/60 hover:text-cloud-pink font-hand text-lg">
            {mode === "signup" ? "i already have a moon ✦ sign in" : "new here? make a quiet space ✦"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2 glass-panel rounded-full px-3 py-1.5 text-xs">
        <span className="font-hand text-cloud-pink">hi, {user.user_metadata?.display_name || user.email?.split("@")[0]}</span>
        <button onClick={signOut} className="text-paper/60 hover:text-cloud-pink"><LogOut className="w-3.5 h-3.5" /></button>
      </div>
      {children}
    </>
  );
};
