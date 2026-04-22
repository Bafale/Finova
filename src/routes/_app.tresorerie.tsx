import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatCAD } from "@/lib/format";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

export const Route = createFileRoute("/_app/tresorerie")({
  component: Tresorerie,
});

const generateForecast = (solde: number, jours: number) => {
  const data = [];
  let optimiste = solde;
  let pessimiste = solde;
  let actuel = solde;
  for (let i = 0; i <= jours; i += 5) {
    optimiste += Math.random() * 800 - 100;
    pessimiste += Math.random() * 200 - 400;
    actuel += Math.random() * 500 - 150;
    data.push({
      jour: `J+${i}`,
      optimiste: Math.round(optimiste),
      pessimiste: Math.round(pessimiste),
      actuel: Math.round(actuel),
    });
  }
  return data;
};

const alerts = [
  {
    type: "urgent",
    border: "border-l-red-500",
    bg: "bg-red-50",
    icon: "🔴",
    title: "Risque de rupture",
    desc: "Risque de rupture de trésorerie dans 18 jours si la facture client #004 n'est pas payée.",
  },
  {
    type: "attention",
    border: "border-l-amber-500",
    bg: "bg-amber-50",
    icon: "🟡",
    title: "Paiement à venir",
    desc: "Facture fournisseur de 3 200 $ due le 30 avril — prévoir la provision.",
  },
  {
    type: "info",
    border: "border-l-emerald-500",
    bg: "bg-emerald-50",
    icon: "🟢",
    title: "Paiement attendu",
    desc: "Paiement client ABC de +5 500 $ attendu d'ici le 25 avril.",
  },
];

const payments = [
  { label: "Loyer bureau", date: "1 mai 2026", montant: -1500, type: "sortie" },
  { label: "Facture fournisseur", date: "30 avr 2026", montant: -3200, type: "sortie" },
  { label: "Paiement client ABC", date: "25 avr 2026", montant: 5500, type: "entree" },
  { label: "Abonnements SaaS", date: "28 avr 2026", montant: -320, type: "sortie" },
  { label: "Salaire employé", date: "30 avr 2026", montant: -2800, type: "sortie" },
];

export default function Tresorerie() {
  const { user } = useAuth();
  const [periode, setPeriode] = useState(30);
  const [solde, setSolde] = useState(12450);
  const [data, setData] = useState(generateForecast(12450, 30));

  useEffect(() => {
    setData(generateForecast(solde, periode));
  }, [periode, solde]);

  useEffect(() => {
    if (!user) return;
    supabase.from("transactions").select("montant, type").eq("user_id", user.id)
      .then(({ data: txs }) => {
        if (txs) {
          const total = txs.reduce((s, t) =>
            s + (t.type === "entree" ? Number(t.montant) : -Number(t.montant)), 0);
          if (total > 0) setSolde(total);
        }
      });
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, #06B6D4, #3B82F6)" }}>
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <h1 className="font-bold text-3xl">💧 Trésorerie</h1>
        <p className="mt-1 opacity-90">Prévisions de cash-flow sur 30, 60 et 90 jours</p>
      </div>

      {/* Période toggle */}
      <div className="flex gap-2 bg-gray-100 rounded-2xl p-1.5 w-fit">
        {[30, 60, 90].map((p) => (
          <button key={p} onClick={() => setPeriode(p)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              periode === p ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
            }`}>
            {p} jours
          </button>
        ))}
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-4">
          <h3 className="font-bold text-lg">Prévision cash-flow — {periode} jours</h3>
          <p className="text-xs text-gray-400">Solde actuel: {formatCAD(solde)}</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="opt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="act" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="jour" axisLine={false} tickLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                formatter={(v: number) => [formatCAD(v), ""]} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Area type="monotone" dataKey="optimiste" name="Optimiste"
                stroke="#10B981" strokeWidth={2} fill="url(#opt)" animationDuration={1200} />
              <Area type="monotone" dataKey="actuel" name="Actuel"
                stroke="#4F46E5" strokeWidth={2.5} fill="url(#act)" animationDuration={1200} />
              <Area type="monotone" dataKey="pessimiste" name="Pessimiste"
                stroke="#F59E0B" strokeWidth={2} fill="url(#pes)" animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alertes */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg">⚠️ Alertes</h3>
          {alerts.map((a, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`border-l-4 ${a.border} ${a.bg} rounded-r-2xl p-4`}>
              <div className="flex items-start gap-3">
                <span className="text-lg">{a.icon}</span>
                <div>
                  <div className="font-bold text-sm text-gray-800">{a.title}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{a.desc}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Paiements à venir */}
        <div>
          <h3 className="font-bold text-lg mb-3">📅 Paiements à venir</h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {payments.map((p, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                <div>
                  <div className="font-medium text-sm text-gray-800">{p.label}</div>
                  <div className="text-xs text-gray-400">{p.date}</div>
                </div>
                <div className={`font-bold text-sm ${p.type === "entree" ? "text-emerald-600" : "text-red-500"}`}>
                  {p.type === "entree" ? "+" : "−"}{formatCAD(Math.abs(p.montant))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}