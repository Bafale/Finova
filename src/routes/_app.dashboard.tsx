import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { Wallet, TrendingDown, PiggyBank, Home as HomeIcon, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CountUp } from "@/components/CountUp";
import { formatCAD } from "@/lib/format";
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

interface Tx {
  id: string;
  description: string;
  categorie: string;
  type: "entree" | "sortie";
  montant: number;
  date: string;
}

function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [revenuMensuel, setRevenuMensuel] = useState(4800);
  const [epargne, setEpargne] = useState(2100);

  useEffect(() => {
    if (!user) return;
    supabase.from("transactions").select("*").order("date", { ascending: false }).then(({ data }) => {
      if (data) setTxs(data as Tx[]);
    });
    supabase.from("profiles").select("revenu_mensuel_net, epargne_totale").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        if (data.revenu_mensuel_net) setRevenuMensuel(Number(data.revenu_mensuel_net));
        if (data.epargne_totale) setEpargne(Number(data.epargne_totale));
      }
    });
  }, [user]);

  const totalEntrees = txs.filter((t) => t.type === "entree").reduce((s, t) => s + Number(t.montant), 0);
  const totalSorties = txs.filter((t) => t.type === "sortie").reduce((s, t) => s + Number(t.montant), 0);
  const solde = totalEntrees - totalSorties + epargne;

  const budgetImmo = revenuMensuel * 12 * 4.5 * 0.85;
  const creditAuto = revenuMensuel * 0.08;

  // Charts data
  const cashflow = [
    { mois: "Jan", value: 8200 },
    { mois: "Fév", value: 9100 },
    { mois: "Mar", value: 7800 },
    { mois: "Avr", value: 10200 },
    { mois: "Mai", value: 11000 },
    { mois: "Jun", value: Math.max(solde, 12450) },
  ];

  // Aggregate by categorie (sorties only)
  const catMap = new Map<string, number>();
  txs.filter((t) => t.type === "sortie").forEach((t) => {
    catMap.set(t.categorie, (catMap.get(t.categorie) ?? 0) + Number(t.montant));
  });
  const catData = Array.from(catMap.entries()).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ["#4F46E5", "#06B6D4", "#F59E0B", "#10B981", "#EC4899", "#F97316"];

  const kpis = [
    { label: t('dashboard.total_balance'), value: solde, icon: Wallet, color: "primary", border: "border-l-primary", trend: "+5.2%", trendUp: true },
    { label: t('dashboard.expenses_month'), value: totalSorties, icon: TrendingDown, color: "destructive", border: "border-l-destructive", trend: "-2.1%", trendUp: true },
    { label: t('dashboard.savings'), value: epargne, icon: PiggyBank, color: "emerald", border: "border-l-emerald", trend: "+8%", trendUp: true },
    { label: t('dashboard.real_estate_capacity'), value: budgetImmo, icon: HomeIcon, color: "amber", border: "border-l-amber", trend: t('dashboard.auto_update'), trendUp: false },
  ];

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className={`rounded-2xl border border-l-4 ${k.border} border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-glow`}
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${k.color}/10`}>
                  <Icon className={`h-5 w-5 text-${k.color}`} />
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${k.trendUp ? "bg-emerald/10 text-emerald" : "bg-muted text-muted-foreground"}`}>
                  {k.trend}
                </span>
              </div>
              <div className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">{k.label}</div>
              <div className="mt-1 font-display text-3xl font-bold">
                <CountUp end={k.value} format={(v) => formatCAD(v)} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">{t('dashboard.cash_flow')}</h3>
              <p className="text-xs text-muted-foreground">{t('dashboard.last_6_months')}</p>
            </div>
            <div className="font-display text-2xl font-bold text-gradient-primary">
              <CountUp end={cashflow[cashflow.length - 1].value} format={formatCAD} />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflow} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cf-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                  formatter={(v) => [formatCAD(Number(v)), "Cash-flow"]}
                />
                <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={3} fill="url(#cf-grad)" animationDuration={1400} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <h3 className="font-display text-lg font-bold">{t('dashboard.expenses_by_category')}</h3>
          <p className="text-xs text-muted-foreground">{t('dashboard.this_month')}</p>
          <div className="h-64">
            {catData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3} animationDuration={1200}>
                    {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCAD(Number(v))} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{t('dashboard.no_expenses')}</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* AI Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-primary p-6 text-primary-foreground shadow-glow"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20"><Sparkles className="h-5 w-5" /></div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-90">{t('dashboard.finova_ai')}</div>
              <p className="mt-1 text-base font-medium md:text-lg">
                {t('dashboard.ai_message', { 
                  homePrice: formatCAD(budgetImmo),
                  monthlyCredit: formatCAD(creditAuto)
                })}
              </p>
            </div>
          </div>
          <Link to="/immobilier" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-transform hover:scale-105">
            {t('dashboard.explore_real_estate')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>

      {/* Recent transactions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <h3 className="font-display text-lg font-bold">{t('dashboard.recent_transactions')}</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-xs text-muted-foreground">
              <tr>
                <th className="pb-3 text-left font-medium">Description</th>
                <th className="pb-3 text-left font-medium">Catégorie</th>
                <th className="pb-3 text-left font-medium">Date</th>
                <th className="pb-3 text-right font-medium">Montant</th>
              </tr>
            </thead>
            <tbody>
              {txs.slice(0, 10).map((t) => (
                <tr key={t.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 font-medium">{t.description}</td>
                  <td className="py-3"><CategoryBadge cat={t.categorie} /></td>
                  <td className="py-3 text-muted-foreground">{new Date(t.date).toLocaleDateString("fr-CA", { day: "numeric", month: "short" })}</td>
                  <td className={`py-3 text-right font-semibold ${t.type === "entree" ? "text-emerald" : "text-destructive"}`}>
                    {t.type === "entree" ? "+" : "−"}{formatCAD(Number(t.montant))}
                  </td>
                </tr>
              ))}
              {txs.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">{t('common.no_data')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

const catColors: Record<string, string> = {
  Revenus: "bg-emerald/10 text-emerald",
  Loyer: "bg-primary/10 text-primary",
  Alimentation: "bg-amber/10 text-amber",
  Abonnements: "bg-secondary/10 text-secondary",
  Transport: "bg-orange/10 text-orange",
  Loisirs: "bg-pink/10 text-pink",
  Autre: "bg-muted text-muted-foreground",
};

function CategoryBadge({ cat }: { cat: string }) {
  const cls = catColors[cat] ?? "bg-muted text-muted-foreground";
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{cat}</span>;
}
