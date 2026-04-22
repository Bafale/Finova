import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CountUp } from "@/components/CountUp";
import { formatCAD } from "@/lib/format";

export const Route = createFileRoute("/_app/vehicule")({
  component: Vehicule,
});

interface Vehicle {
  id: string; marque: string; modele: string; annee: number; prix: number;
  type: "auto" | "moto"; concessionnaire: string; ville: string;
  photo_url: string; financement_disponible: boolean;
}

function CreditSimulator() {
  const [montant, setMontant] = useState(20000);
  const [mise, setMise] = useState(2000);
  const [duree, setDuree] = useState(60);
  const taux = 0.052;

  const result = useMemo(() => {
    const principal = montant - mise;
    if (principal <= 0) return { mensualite: 0, totalInterets: 0, total: 0 };
    const r = taux / 12;
    const m = (principal * r) / (1 - Math.pow(1 + r, -duree));
    return { mensualite: m, totalInterets: m * duree - principal, total: m * duree + mise };
  }, [montant, mise, duree]);

  return (
    <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-6 space-y-5">
      <h3 className="font-bold text-orange-800 text-lg">🧮 Simulateur de crédit</h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Montant du prêt</span>
            <span className="font-bold text-indigo-600">{formatCAD(montant)}</span>
          </div>
          <input type="range" min={5000} max={80000} step={500}
            value={montant} onChange={(e) => setMontant(Number(e.target.value))}
            className="w-full accent-indigo-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5 000 $</span><span>80 000 $</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Mise de fonds</span>
            <span className="font-bold text-cyan-600">{formatCAD(mise)}</span>
          </div>
          <input type="range" min={0} max={20000} step={500}
            value={mise} onChange={(e) => setMise(Number(e.target.value))}
            className="w-full accent-cyan-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 $</span><span>20 000 $</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Durée</span>
            <span className="font-bold text-amber-600">{duree} mois ({Math.round(duree/12 * 10) / 10} ans)</span>
          </div>
          <input type="range" min={12} max={84} step={12}
            value={duree} onChange={(e) => setDuree(Number(e.target.value))}
            className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>12 mois</span><span>84 mois</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Total intérêts</div>
          <div className="font-bold text-red-500 text-sm">{formatCAD(result.totalInterets)}</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Coût total</div>
          <div className="font-bold text-gray-700 text-sm">{formatCAD(result.total)}</div>
        </div>
        <div className="bg-indigo-600 rounded-xl p-3 text-center">
          <div className="text-xs text-indigo-200 mb-1">Mensualité</div>
          <div className="font-bold text-white">{formatCAD(result.mensualite)}/mois</div>
        </div>
      </div>

      <button className="w-full bg-gradient-to-r from-orange-500 to-amber-400 text-white rounded-xl py-3 font-bold text-sm hover:opacity-90 transition">
        Demander le financement →
      </button>
    </div>
  );
}

function Vehicule() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tab, setTab] = useState<"auto" | "moto">("auto");
  const [revenu, setRevenu] = useState(4800);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    marque: "",
    modele: "",
    annee: 2024,
    prix: 25000,
    type: "auto" as "auto" | "moto",
    concessionnaire: "",
    ville: "",
    photo_url: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=600",
    financement_disponible: true
  });
  const budgetMensuel = revenu * 0.08;
  const budgetMax = revenu * 12 * 0.35;

  useEffect(() => {
    supabase.from("vehicles").select("*").order("prix")
      .then(({ data }) => { if (data) setVehicles(data as Vehicle[]); });
    if (user) {
      supabase.from("profiles").select("revenu_mensuel_net").eq("id", user.id).maybeSingle()
        .then(({ data }) => { if (data?.revenu_mensuel_net) setRevenu(Number(data.revenu_mensuel_net)); });
    }
  }, [user]);

  const filtered = vehicles.filter((v) => v.type === tab);

  const getMensualite = (prix: number) => {
    const principal = prix * 0.8;
    const r = 0.052 / 12;
    const n = 60;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}>
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl">🚗 Acheter un véhicule</h1>
            <p className="mt-1 opacity-90">Offres filtrées selon ta capacité de remboursement</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-full px-4 py-2 text-sm font-semibold transition-all"
          >
            <Plus className="h-4 w-4" /> Ajouter
          </button>
        </div>
      </div>

      {/* AI Budget */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">🧠 FinOva IA</div>
          <div className="text-sm text-emerald-700">
            Tu peux soutenir <strong>{formatCAD(budgetMensuel)}/mois</strong> — budget recommandé
          </div>
        </div>
        <div className="text-4xl font-bold text-emerald-600">
          <CountUp end={budgetMax} format={formatCAD} />
        </div>
      </div>

      {/* Toggle */}
      <div className="flex gap-2 bg-gray-100 rounded-2xl p-1.5 w-fit">
        {(["auto", "moto"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
            }`}>
            {t === "auto" ? "🚗 Automobile" : "🏍️ Moto"}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Vehicle grid */}
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          {filtered.map((v, i) => {
            const mensualite = getMensualite(v.prix);
            const inBudget = mensualite <= budgetMensuel;
            return (
              <motion.div key={v.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="relative h-44">
                  <img src={v.photo_url} alt={`${v.marque} ${v.modele}`}
                    className="w-full h-full object-cover" />
                  {v.financement_disponible && (
                    <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      Financement ✓
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 text-white text-xs font-bold px-2.5 py-1 rounded-full ${inBudget ? "bg-emerald-500" : "bg-red-500"}`}>
                    {inBudget ? "✓ Dans ton budget" : "Hors budget"}
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-bold text-gray-800">{v.marque} {v.modele} {v.annee}</div>
                  <div className="text-xl font-bold text-indigo-600 mt-1">{formatCAD(v.prix)}</div>
                  <div className="mt-1 inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    ~{formatCAD(mensualite)}/mois
                  </div>
                  <div className="text-xs text-gray-400 mt-2">{v.concessionnaire} · {v.ville}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Simulator */}
        <div className="lg:col-span-1">
          <CreditSimulator />
        </div>
      </div>

      {/* Add Vehicle Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">➕ Ajouter un véhicule</h2>
                <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Marque"
                    value={formData.marque}
                    onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                    className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                  />
                  <input
                    type="text"
                    placeholder="Modèle"
                    value={formData.modele}
                    onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                    className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    placeholder="Année"
                    value={formData.annee}
                    onChange={(e) => setFormData({ ...formData, annee: Number(e.target.value) })}
                    className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                  />
                  <input
                    type="number"
                    placeholder="Prix ($)"
                    value={formData.prix}
                    onChange={(e) => setFormData({ ...formData, prix: Number(e.target.value) })}
                    className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                  />
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as "auto" | "moto" })}
                    className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                  >
                    <option value="auto">Automobile</option>
                    <option value="moto">Moto</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Concessionnaire"
                  value={formData.concessionnaire}
                  onChange={(e) => setFormData({ ...formData, concessionnaire: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                />
                <input
                  type="text"
                  placeholder="Ville"
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                />
                <input
                  type="text"
                  placeholder="URL de l'image"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                />
                <button
                  onClick={async () => {
                    if (formData.marque && formData.modele) {
                      await supabase.from("vehicles").insert([formData]);
                      setVehicles([...vehicles, { ...formData, id: Math.random().toString() }]);
                      setShowAddForm(false);
                      setFormData({
                        marque: "",
                        modele: "",
                        annee: 2024,
                        prix: 25000,
                        type: "auto",
                        concessionnaire: "",
                        ville: "",
                        photo_url: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=600",
                        financement_disponible: true
                      });
                    }
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-bold transition"
                >
                  Ajouter le véhicule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}