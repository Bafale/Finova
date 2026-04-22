import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, TrendingUp, TrendingDown, DollarSign, Receipt } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatCAD } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/comptabilite")({
  component: Comptabilite,
});

interface Tx {
  id: string; description: string; categorie: string;
  type: "entree" | "sortie"; montant: number; date: string;
}

function NewTransactionModal({ onClose, onSaved, categories }: { onClose: () => void; onSaved: () => void; categories: string[] }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState({
    description: "", montant: "", categorie: categories[0] ?? "Revenus",
    type: "entree" as "entree" | "sortie", date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.description || !form.montant || !user) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        description: form.description,
        montant: Number(form.montant),
        categorie: form.categorie,
        type: form.type,
        date: form.date,
      });
      
      if (error) throw error;
      
      toast.success("Transaction ajoutée avec succès");
      setForm({
        description: "",
        montant: "",
        categorie: categories[0] ?? "Revenus",
        type: "entree",
        date: new Date().toISOString().split("T")[0],
      });
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl">{t('accounting.new_transaction')}</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('accounting.description')}</label>
              <input value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ex: Salaire, Loyer..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{t('accounting.amount')}</label>
                <input type="number" value={form.montant}
                  onChange={(e) => setForm({ ...form, montant: e.target.value })}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{t('accounting.date')}</label>
                <input type="date" value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('accounting.category')}</label>
              <select value={form.categorie}
                onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">{t('accounting.type')}</label>
              <div className="flex gap-2">
                {(["entree", "sortie"] as const).map((type) => (
                  <button key={type} onClick={() => setForm({ ...form, type })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      form.type === type
                        ? type === "entree" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                    {type === "entree" ? "✅ " + t('accounting.income') : "❌ " + t('accounting.expense')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl py-3 font-bold text-sm hover:opacity-90 transition disabled:opacity-50">
            {loading ? t('common.loading') : t('accounting.new_transaction')}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const catColors: Record<string, string> = {
  Revenus: "bg-emerald-100 text-emerald-700",
  Loyer: "bg-indigo-100 text-indigo-700",
  Alimentation: "bg-amber-100 text-amber-700",
  Abonnements: "bg-cyan-100 text-cyan-700",
  Transport: "bg-orange-100 text-orange-700",
  Loisirs: "bg-pink-100 text-pink-700",
  Autre: "bg-gray-100 text-gray-600",
};

const CATEGORY_KEYS = ["Revenus", "Loyer", "Alimentation", "Transport", "Abonnements", "Loisirs", "Autre"];

export default function Comptabilite() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filtre, setFiltre] = useState("Tous");

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("transactions")
      .select("*").eq("user_id", user.id).order("date", { ascending: false });
    if (error) {
      console.error("Erreur lors du chargement:", error);
      return;
    }
    // Éliminer les doublons par ID
    if (data) {
      const uniqueTxs = Array.from(new Map(data.map(t => [t.id, t])).values()) as Tx[];
      setTxs(uniqueTxs);
    }
  };

  useEffect(() => { load(); }, [user]);

  const revenus = txs.filter((t) => t.type === "entree").reduce((s, t) => s + Number(t.montant), 0);
  const depenses = txs.filter((t) => t.type === "sortie").reduce((s, t) => s + Number(t.montant), 0);
  const benefice = revenus - depenses;

  const filtered = filtre === "Tous" ? txs : txs.filter((t) => t.categorie === filtre);

  const kpis = [
    { label: t('accounting.total_income'), value: revenus, icon: TrendingUp, color: "emerald", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600" },
    { label: t('accounting.total_expenses'), value: depenses, icon: TrendingDown, color: "red", bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
    { label: t('accounting.net_result'), value: benefice, icon: DollarSign, color: "indigo", bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-600" },
    { label: t('accounting.transactions'), value: txs.length, icon: Receipt, color: "amber", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, #4F46E5, #06B6D4)" }}>
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-bold text-3xl">{t('accounting.title')}</h1>
            <p className="mt-1 opacity-90">{t('accounting.subtitle')}</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white text-indigo-600 rounded-xl px-5 py-2.5 font-bold text-sm hover:bg-indigo-50 transition">
            <Plus className="h-4 w-4" /> {t('accounting.new_transaction')}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div key={k.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-2xl border-2 ${k.border} ${k.bg} p-5`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white mb-3`}>
                <Icon className={`h-5 w-5 ${k.text}`} />
              </div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{k.label}</div>
              <div className={`text-2xl font-bold mt-1 ${k.text}`}>
                {k.label === t('accounting.transactions') ? k.value : formatCAD(k.value)}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-bold text-lg">{t('accounting.transactions')}</h3>
          <div className="flex gap-2 flex-wrap">
            {["Tous", ...CATEGORY_KEYS].map((c) => (
              <button key={c} onClick={() => setFiltre(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filtre === c ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{t('accounting.description')}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{t('accounting.category')}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{t('accounting.date')}</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{t('accounting.amount')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{t.description}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${catColors[t.categorie] ?? "bg-gray-100 text-gray-600"}`}>
                      {t.categorie}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {new Date(t.date).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className={`px-5 py-3.5 text-right font-bold ${t.type === "entree" ? "text-emerald-600" : "text-red-500"}`}>
                    {t.type === "entree" ? "+" : "−"}{formatCAD(Number(t.montant))}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">{t('common.no_data')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <NewTransactionModal onClose={() => setShowModal(false)} onSaved={load} categories={CATEGORY_KEYS} />
      )}
    </div>
  );
}