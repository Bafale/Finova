import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Phone, Mail, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_app/crm")({
  component: CRM,
});

interface Client {
  id: string; nom: string; email: string;
  telephone: string; entreprise: string;
  statut: "Prospect" | "Devis envoyé" | "Négociation" | "Gagné" | "Perdu";
  valeur: number;
}

const STATUTS = ["Prospect", "Devis envoyé", "Négociation", "Gagné", "Perdu"] as const;

const statutColors: Record<string, string> = {
  "Prospect":      "bg-gray-100 text-gray-600",
  "Devis envoyé":  "bg-cyan-100 text-cyan-700",
  "Négociation":   "bg-amber-100 text-amber-700",
  "Gagné":         "bg-emerald-100 text-emerald-700",
  "Perdu":         "bg-red-100 text-red-600",
};

const colonneColors: Record<string, string> = {
  "Prospect":      "border-gray-300 bg-gray-50",
  "Devis envoyé":  "border-cyan-300 bg-cyan-50",
  "Négociation":   "border-amber-300 bg-amber-50",
  "Gagné":         "border-emerald-300 bg-emerald-50",
  "Perdu":         "border-red-300 bg-red-50",
};

const INITIAL_CLIENTS: Client[] = [
  { id: "1", nom: "Sophie Martin", email: "sophie@abc.ca", telephone: "613-555-0201", entreprise: "ABC Corp", statut: "Gagné", valeur: 12000 },
  { id: "2", nom: "Pierre Dubois", email: "pierre@xyz.ca", telephone: "514-555-0202", entreprise: "XYZ Inc", statut: "Négociation", valeur: 8500 },
  { id: "3", nom: "Laura Chen", email: "laura@startup.ca", telephone: "416-555-0203", entreprise: "StartupCA", statut: "Devis envoyé", valeur: 5200 },
  { id: "4", nom: "Marc Tremblay", email: "marc@mtl.ca", telephone: "514-555-0204", entreprise: "MTL Design", statut: "Prospect", valeur: 3000 },
  { id: "5", nom: "Anna Kowalski", email: "anna@tech.ca", telephone: "613-555-0205", entreprise: "TechOttawa", statut: "Prospect", valeur: 7800 },
];

function NewClientModal({ onClose, onSaved }: { onClose: () => void; onSaved: (c: Client) => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    nom: "", email: "", telephone: "", entreprise: "",
    statut: "Prospect" as Client["statut"], valeur: "",
  });

  const handleSubmit = () => {
    if (!form.nom || !form.email) return;
    onSaved({
      id: Date.now().toString(),
      nom: form.nom, email: form.email,
      telephone: form.telephone, entreprise: form.entreprise,
      statut: form.statut, valeur: Number(form.valeur) || 0,
    });
    onClose();
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
            <h3 className="font-bold text-xl">{t('crm.new_client')}</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { label: t('crm.contact'), key: "nom", placeholder: "Ex: Sophie Martin" },
              { label: t('common.login'), key: "email", placeholder: "sophie@email.com" },
              { label: t('crm.phone'), key: "telephone", placeholder: "613-555-0000" },
              { label: t('accounting.transactions'), key: "entreprise", placeholder: "ABC Corp" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                <input value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Statut</label>
                <select value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value as Client["statut"] })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
                  {STATUTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Valeur ($)</label>
                <input type="number" value={form.valeur}
                  onChange={(e) => setForm({ ...form, valeur: e.target.value })}
                  placeholder="5000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
            </div>
          </div>

          <button onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl py-3 font-bold text-sm hover:opacity-90 transition">
            Ajouter le client
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function CRM() {
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [showModal, setShowModal] = useState(false);
  const [vue, setVue] = useState<"kanban" | "liste">("kanban");

  const totalPipeline = clients.filter((c) => c.statut !== "Perdu")
    .reduce((s, c) => s + c.valeur, 0);
  const totalGagne = clients.filter((c) => c.statut === "Gagné")
    .reduce((s, c) => s + c.valeur, 0);

  const formatCAD = (v: number) =>
    new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, #10B981, #06B6D4)" }}>
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-bold text-3xl">{t('crm.title')}</h1>
            <p className="mt-1 opacity-90">{t('crm.subtitle')}</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white text-emerald-600 rounded-xl px-5 py-2.5 font-bold text-sm hover:bg-emerald-50 transition">
            <Plus className="h-4 w-4" /> Nouveau client
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: t('crm.total_clients'), value: clients.length, suffix: "", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
          { label: t('crm.pipeline_total'), value: formatCAD(totalPipeline), suffix: "", color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200" },
          { label: t('crm.deals_won'), value: clients.filter(c => c.statut === "Gagné").length, suffix: "", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
          { label: t('crm.revenue_won'), value: formatCAD(totalGagne), suffix: "", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
        ].map((k, i) => (
          <motion.div key={k.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`rounded-2xl border-2 ${k.border} ${k.bg} p-5`}>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{k.label}</div>
            <div className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Vue toggle */}
      <div className="flex gap-2 bg-gray-100 rounded-2xl p-1.5 w-fit">
        {(["kanban", "liste"] as const).map((v) => (
          <button key={v} onClick={() => setVue(v)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              vue === v ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
            }`}>
            {v === "kanban" ? "🗂 Kanban" : "📋 Liste"}
          </button>
        ))}
      </div>

      {/* Kanban */}
      {vue === "kanban" && (
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STATUTS.map((statut) => {
            const cols = clients.filter((c) => c.statut === statut);
            return (
              <div key={statut} className={`rounded-2xl border-2 ${colonneColors[statut]} p-4 min-h-48`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statutColors[statut]}`}>{statut}</span>
                  <span className="text-xs text-gray-400 font-medium">{cols.length}</span>
                </div>
                <div className="space-y-2">
                  {cols.map((c) => (
                    <motion.div key={c.id} layout
                      className="bg-white rounded-xl p-3 shadow-sm border border-white/80">
                      <div className="font-semibold text-sm text-gray-800">{c.nom}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3" />{c.entreprise}
                      </div>
                      <div className="text-xs font-bold text-indigo-600 mt-1">{formatCAD(c.valeur)}</div>
                      <div className="flex gap-2 mt-2">
                        <a href={`tel:${c.telephone}`} className="flex-1 flex items-center justify-center gap-1 bg-gray-100 rounded-lg py-1 text-xs text-gray-600 hover:bg-gray-200 transition">
                          <Phone className="h-3 w-3" />
                        </a>
                        <a href={`mailto:${c.email}`} className="flex-1 flex items-center justify-center gap-1 bg-gray-100 rounded-lg py-1 text-xs text-gray-600 hover:bg-gray-200 transition">
                          <Mail className="h-3 w-3" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Liste */}
      {vue === "liste" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Client", "Entreprise", "Contact", "Statut", "Valeur"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{c.nom}</td>
                  <td className="px-5 py-3.5 text-gray-500 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />{c.entreprise}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <a href={`mailto:${c.email}`} className="text-indigo-500 hover:text-indigo-700"><Mail className="h-4 w-4" /></a>
                      <a href={`tel:${c.telephone}`} className="text-emerald-500 hover:text-emerald-700"><Phone className="h-4 w-4" /></a>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statutColors[c.statut]}`}>{c.statut}</span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-indigo-600">{formatCAD(c.valeur)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <NewClientModal onClose={() => setShowModal(false)}
          onSaved={(c) => setClients((prev) => [c, ...prev])} />
      )}
    </div>
  );
}