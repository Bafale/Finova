import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prenom, setPrenom] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { prenom },
          },
        });
        if (error) throw error;
        toast.success(t('auth.title'));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t('common.login'));
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.coming_soon'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left visual */}
      <div className="relative hidden overflow-hidden bg-gradient-hero lg:block">
        <div className="pointer-events-none absolute inset-0">
          <div className="mesh-blob h-[400px] w-[400px] bg-white -top-20 -left-20" style={{ opacity: 0.15 }} />
          <div className="mesh-blob h-[400px] w-[400px] bg-white bottom-0 right-0" style={{ opacity: 0.15, animationDelay: "-7s" }} />
        </div>
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link to="/" className="hover:opacity-80 transition-opacity inline-flex"><Logo className="[&_span]:text-white" /></Link>
          <div>
            <h2 className="font-display text-5xl font-bold leading-tight">
              {t('auth.title')}
            </h2>
            <ul className="mt-10 space-y-4">
              {[t('auth.feature_1'), t('auth.feature_2'), t('auth.feature_3')].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20"><Check className="h-3.5 w-3.5" /></span>
                  <span className="text-base font-medium">{t}</span>
                </li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 max-w-sm rounded-2xl bg-white/15 p-5 backdrop-blur-md"
            >
              <p className="text-sm italic">"{t('auth.testimonial_quote')}"</p>
              <p className="mt-3 text-xs font-semibold opacity-90">— {t('auth.testimonial_author')}</p>
            </motion.div>
          </div>
          <div />
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center justify-between">
            <Link to="/" className="hover:opacity-80 transition-opacity"><Logo /></Link>
            <Link to="/" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Retour
            </Link>
          </div>
          <h1 className="font-display text-3xl font-bold">
            {mode === "signup" ? t('auth.create_account') : t('common.login')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup" ? t('auth.signup_description') : t('auth.signin_description')}
          </p>

          <div className="mt-6 inline-flex rounded-full bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${mode === "signup" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              {t('common.signup')}
            </button>
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${mode === "signin" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              {t('common.login')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold">{t('auth.firstname')}</label>
                <input
                  type="text" required value={prenom} onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Marie"
                  className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-semibold">{t('auth.email')}</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="toi@entreprise.ca"
                className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">{t('auth.password')}</label>
              <input
                type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signup" ? t('auth.create_account') : t('common.login')}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            En continuant, tu acceptes les conditions d'utilisation.
          </p>
        </div>
      </div>
    </div>
  );
}
