import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, BarChart3, Droplets, Receipt, Users, Building2, Car, Settings, Bell, LogOut, Menu, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/Logo";
import { formatDateFR } from "@/lib/format";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const NAV_KEYS = [
  { to: "/dashboard", key: "nav.dashboard", icon: Home, color: "text-primary" },
  { to: "/comptabilite", key: "nav.accounting", icon: BarChart3, color: "text-secondary" },
  { to: "/tresorerie", key: "nav.treasury", icon: Droplets, color: "text-secondary" },
  { to: "/depenses", key: "nav.expenses", icon: Receipt, color: "text-amber" },
  { to: "/crm", key: "nav.crm", icon: Users, color: "text-emerald" },
  { to: "/immobilier", key: "nav.real_estate", icon: Building2, color: "text-pink" },
  { to: "/vehicule", key: "nav.vehicle", icon: Car, color: "text-orange" },
  { to: "/parametres", key: "nav.settings", icon: Settings, color: "text-primary" },
] as const;
function AppLayout() {
  const { user, loading } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [prenom, setPrenom] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("prenom").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.prenom) setPrenom(data.prenom);
    });
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(t('common.hello'));
    navigate({ to: "/" });
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background-alt">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <Link to="/dashboard" className="flex h-16 items-center px-6 hover:opacity-80 transition-opacity"><Logo /></Link>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_KEYS.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-background-alt shadow-sm"
                    : "text-muted-foreground hover:bg-background-alt hover:text-foreground"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${active ? item.color : ""}`} />
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3 space-y-1">
          <Link to="/" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-background-alt hover:text-foreground transition-all">
            <ExternalLink className="h-4.5 w-4.5" /> {t('nav.back_to_home')}
          </Link>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-background-alt hover:text-foreground transition-all">
            <LogOut className="h-4.5 w-4.5" /> {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-background-alt lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-display font-bold leading-tight">
                Bonjour {prenom || "👋"} <span className="inline-block">👋</span>
              </h1>
              <p className="text-xs text-muted-foreground">{formatDateFR(new Date())}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
  onClick={() => {
    const next = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(next);
    localStorage.setItem('finova-lang', next);
  }}
  className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-background-alt transition"
>
  {i18n.language === 'fr' ? '🇫🇷 FR' : '🇨🇦 EN'}
</button>
            
            <button className="relative rounded-full p-2 hover:bg-background-alt">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
              {(prenom?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
            </div>
          </div>
        </header>
        <main className="p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
