import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bed, Bath, Maximize, Star, Phone, Mail, X, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CountUp } from "@/components/CountUp";
import { formatCAD } from "@/lib/format";

export const Route = createFileRoute("/_app/immobilier")({
  component: Immobilier,
});

interface Agent {
  id?: string;
  nom: string; agence: string; note: number;
  photo_url: string; email: string; telephone: string;
}

interface Property {
  id: string; adresse: string; ville: string; prix: number;
  chambres: number; salles_de_bain: number; superficie_sqft: number;
  photo_url: string; agents?: Agent;
}

function CreditSim({ prix }: { prix: number }) {
  const principal = prix * 0.8;
  const r = 0.052 / 12;
  const n = 300;
  const mensualite = (principal * r) / (1 - Math.pow(1 + r, -n));
  const totalPaye = mensualite * n;
  const totalInterets = totalPaye - principal;

  return (
    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5">
      <h4 className="font-bold text-amber-800 mb-3">📊 Simulation crédit</h4>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Mise de fonds (20%)</div>
          <div className="font-bold text-gray-800">{formatCAD(prix * 0.2)}</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Prêt hypothécaire</div>
          <div className="font-bold text-gray-800">{formatCAD(principal)}</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Taux</div>
          <div className="font-bold text-gray-800">5.2% / 25 ans</div>
        </div>
        <div className="bg-indigo-600 rounded-xl p-3 text-center">
          <div className="text-xs text-indigo-200 mb-1">Mensualité</div>
          <div className="font-bold text-white text-lg">{formatCAD(mensualite)}/mois</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-amber-700 text-center">
        Total intérêts estimés: {formatCAD(totalInterets)}
      </div>
    </div>
  );
}

function PropertyModal({ property, onClose, budget }: {
  property: Property; onClose: () => void; budget: number;
}) {
  const [imgIndex, setImgIndex] = useState(0);
  const photos = [
    property.photo_url,
    `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800`,
    `https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800`,
  ];
  const inBudget = property.prix <= budget;
  const agent = property.agents;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Photo gallery */}
          <div className="relative h-64 overflow-hidden rounded-t-3xl">
            <img src={photos[imgIndex]} alt="property"
              className="w-full h-full object-cover" />
            <button onClick={onClose}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
              <X className="h-5 w-5" />
            </button>
            <button onClick={() => setImgIndex((i) => (i - 1 + 3) % 3)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => setImgIndex((i) => (i + 1) % 3)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {photos.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === imgIndex ? "bg-white" : "bg-white/50"}`} />
              ))}
            </div>
            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white ${inBudget ? "bg-emerald-500" : "bg-red-500"}`}>
              {inBudget ? "✓ Dans ton budget" : "Hors budget"}
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Details */}
            <div>
              <div className="text-3xl font-bold text-indigo-600">{formatCAD(property.prix)}</div>
              <div className="text-gray-600 mt-1">{property.adresse}, {property.ville}</div>
              <div className="flex gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Bed className="h-4 w-4" />{property.chambres} ch.</span>
                <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{property.salles_de_bain} sdb.</span>
                <span className="flex items-center gap-1"><Maximize className="h-4 w-4" />{property.superficie_sqft} pi²</span>
              </div>
            </div>

            {/* Agent */}
            {agent && (
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5">
                <h4 className="font-bold text-emerald-800 mb-3">🤝 Votre agent</h4>
                <div className="flex items-center gap-4">
                  <img src={agent.photo_url} alt={agent.nom}
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-300" />
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{agent.nom}</div>
                    <div className="text-sm text-gray-500">{agent.agence}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < Math.floor(agent.note) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">{agent.note}/5</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <a href={`tel:${agent.telephone}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-emerald-700 transition">
                    <Phone className="h-4 w-4" /> Appeler
                  </a>
                  <a href={`mailto:${agent.email}`}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-emerald-600 text-emerald-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-emerald-50 transition">
                    <Mail className="h-4 w-4" /> Envoyer un message
                  </a>
                </div>
              </div>
            )}

            {/* Credit simulation */}
            <CreditSim prix={property.prix} />

            <button
              className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-2xl py-3.5 font-bold text-sm hover:opacity-90 transition"
              onClick={onClose}
            >
              Demander une pré-approbation →
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Immobilier() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selected, setSelected] = useState<Property | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    adresse: "",
    ville: "",
    prix: 350000,
    chambres: 3,
    salles_de_bain: 2,
    superficie_sqft: 1500,
    photo_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
    agent_id: ""
  });
  const [revenu, setRevenu] = useState(4800);
  const [filtreVille, setFiltreVille] = useState("Toutes");
  const [filtreChambres, setFiltreChambres] = useState(0);
  const [filtrePrix, setFiltrePrix] = useState(1000000);
  const budget = revenu * 12 * 4.5 * 0.85;

  useEffect(() => {
    supabase.from("properties")
      .select("*, agents(nom, agence, note, photo_url, email, telephone)")
      .order("prix")
      .then(({ data }) => { if (data) setProperties(data as any); });
    
    supabase.from("agents")
      .select("*")
      .then(({ data }) => { if (data) setAgents(data as Agent[]); });

    if (user) {
      supabase.from("profiles").select("revenu_mensuel_net").eq("id", user.id).maybeSingle()
        .then(({ data }) => { if (data?.revenu_mensuel_net) setRevenu(Number(data.revenu_mensuel_net)); });
    }
  }, [user]);

  const villes = ["Toutes", ...Array.from(new Set(properties.map((p) => p.ville)))];
  const filtered = properties.filter((p) =>
    (filtreVille === "Toutes" || p.ville === filtreVille) &&
    (filtreChambres === 0 || p.chambres >= filtreChambres) &&
    p.prix <= filtrePrix
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 text-white shadow-lg"
        style={{ background: "linear-gradient(120deg, #FFE66D 0%, #6BCB77 33%, #4ECDC4 66%, #E0F7FF 100%)" }}>
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl">🏠 Trouver ma maison</h1>
            <p className="mt-1 opacity-90">Annonces filtrées selon ton budget réel</p>
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
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">🧠 FinOva IA</div>
          <div className="text-sm text-indigo-700">Ton budget maximum calculé</div>
        </div>
        <div className="text-4xl font-bold text-indigo-600">
          <CountUp end={budget} format={formatCAD} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white rounded-2xl border border-gray-100 p-4">
        <select value={filtreVille} onChange={(e) => setFiltreVille(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
          {villes.map((v) => <option key={v}>{v}</option>)}
        </select>
        <select value={filtreChambres} onChange={(e) => setFiltreChambres(Number(e.target.value))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
          <option value={0}>Toutes chambres</option>
          <option value={2}>2+ chambres</option>
          <option value={3}>3+ chambres</option>
          <option value={4}>4+ chambres</option>
        </select>
        <select value={filtrePrix} onChange={(e) => setFiltrePrix(Number(e.target.value))}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
          <option value={1000000}>Tous les prix</option>
          <option value={300000}>Max 300 000 $</option>
          <option value={400000}>Max 400 000 $</option>
          <option value={500000}>Max 500 000 $</option>
        </select>
        <div className="text-sm text-gray-400 flex items-center ml-auto">
          {filtered.length} propriété{filtered.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p, i) => {
          const inBudget = p.prix <= budget;
          return (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
              onClick={() => setSelected(p)}
            >
              <div className="relative h-48">
                <img src={p.photo_url} alt={p.adresse} className="w-full h-full object-cover" />
                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold text-white ${inBudget ? "bg-emerald-500" : "bg-red-500"}`}>
                  {inBudget ? "✓ Dans ton budget" : "Hors budget"}
                </div>
              </div>
              <div className="p-4">
                <div className="text-xl font-bold text-indigo-600">{formatCAD(p.prix)}</div>
                <div className="text-sm text-gray-500 mt-0.5">{p.adresse}, {p.ville}</div>
                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{p.chambres} ch.</span>
                  <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{p.salles_de_bain} sdb.</span>
                  <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{p.superficie_sqft} pi²</span>
                </div>
                {p.agents && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <img src={p.agents.photo_url} alt={p.agents.nom}
                      className="w-7 h-7 rounded-full object-cover" />
                    <div className="text-xs text-gray-500">{p.agents.nom}</div>
                    <div className="ml-auto flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-gray-500">{p.agents.note}</span>
                    </div>
                  </div>
                )}
                <button className="mt-3 w-full bg-indigo-600 text-white rounded-xl py-2 text-xs font-semibold hover:bg-indigo-700 transition">
                  Voir les détails →
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {selected && (
        <PropertyModal property={selected} onClose={() => setSelected(null)} budget={budget} />
      )}

      {/* Add Property Form */}
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
                <h2 className="text-2xl font-bold">➕ Ajouter une propriété</h2>
                <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Adresse"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
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
                  type="number"
                  placeholder="Prix ($)"
                  value={formData.prix}
                  onChange={(e) => setFormData({ ...formData, prix: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    placeholder="Chambres"
                    value={formData.chambres}
                    onChange={(e) => setFormData({ ...formData, chambres: Number(e.target.value) })}
                    className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                  />
                  <input
                    type="number"
                    placeholder="Salles de bain"
                    value={formData.salles_de_bain}
                    onChange={(e) => setFormData({ ...formData, salles_de_bain: Number(e.target.value) })}
                    className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                  />
                  <input
                    type="number"
                    placeholder="Superficie (pi²)"
                    value={formData.superficie_sqft}
                    onChange={(e) => setFormData({ ...formData, superficie_sqft: Number(e.target.value) })}
                    className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <input
                  type="text"
                  placeholder="URL de l'image"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                />
                <select
                  value={formData.agent_id}
                  onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                >
                  <option value="">Sélectionner un agent (optionnel)</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.nom} - {agent.agence}
                    </option>
                  ))}
                </select>
                <button
                  onClick={async () => {
                    if (formData.adresse && formData.ville) {
                      await supabase.from("properties").insert([formData]);
                      setProperties([...properties, { ...formData, id: Math.random().toString() } as any]);
                      setShowAddForm(false);
                      setFormData({
                        adresse: "",
                        ville: "",
                        prix: 350000,
                        chambres: 3,
                        salles_de_bain: 2,
                        superficie_sqft: 1500,
                        photo_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
                        agent_id: ""
                      });
                    }
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-bold transition"
                >
                  Ajouter la propriété
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}