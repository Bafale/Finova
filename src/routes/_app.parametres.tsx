import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, User, MapPin, DollarSign, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatCAD } from "@/lib/format";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cleanupDuplicateTransactions } from "@/lib/cleanup";

export const Route = createFileRoute("/_app/parametres")({
  component: Parametres,
});

function Parametres() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    prenom: "", nom: "", ville: "Ottawa",
    revenu_mensuel_net: 4800, epargne_totale: 2100, langue: "fr",
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) setForm({
          prenom: data.prenom || "",
          nom: data.nom || "",
          ville: data.ville || "Ottawa",
          revenu_mensuel_net: Number(data.revenu_mensuel_net) || 4800,
          epargne_totale: Number(data.epargne_totale) || 2100,
          langue: data.langue || "fr",
        });
      });
  }, [user]);

  const budgetImmo = form.revenu_mensuel_net * 12 * 4.5 * 0.85;
  const budgetAuto = form.revenu_mensuel_net * 0.08;

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    await supabase.from("profiles").upsert({
      id: user.id,
      prenom: form.prenom,
      nom: form.nom,
      ville: form.ville,
      revenu_mensuel_net: form.revenu_mensuel_net,
      epargne_totale: form.epargne_totale,
      langue: form.langue,
    }).eq("id", user.id);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  function handleCleanup(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
    throw new Error("Function not implemented.");
  }

  /*const handleCleanup = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [txResult, expResult] = await Promise.all([
        cleanupDuplicateTransactions(user.id),
        cleanupDuplicateExpenses(user.id),
      ]);

      const totalRemoved = txResult.removed + expResult.removed;
      if (totalRemoved > 0) {
        toast.success(`✓ ${totalRemoved} doublon(s) supprimé(s)`);
      } else {
        toast.info("Aucun doublon trouvé");
      }
    } catch (err) {
      toast.error("Erreur lors du nettoyage");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };*/

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, #8B5CF6, #4F46E5)" }}>
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <h1 className="font-bold text-3xl">⚙️ Paramètres</h1>
        <p className="mt-1 opacity-90">Mets à jour ton profil pour des calculs précis</p>
      </div>

      {/* Aperçu budget */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5">
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">🏠 Budget immobilier</div>
          <div className="text-2xl font-bold text-indigo-600">{formatCAD(budgetImmo)}</div>
          <div className="text-xs text-indigo-400 mt-1">Calculé automatiquement</div>
        </div>
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">🚗 Budget auto/mois</div>
          <div className="text-2xl font-bold text-emerald-600">{formatCAD(budgetAuto)}</div>
          <div className="text-xs text-emerald-400 mt-1">Mis à jour en temps réel</div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

        {/* Identité */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100">
              <User className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-800">Identité</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Prénom", key: "prenom", placeholder: "Ex: Bafale" },
              { label: "Nom", key: "nom", placeholder: "Ex: Tremblay" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                <input value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
            ))}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Finances */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-800">Finances</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Revenu mensuel net ($)</label>
              <input type="number" value={form.revenu_mensuel_net}
                onChange={(e) => setForm({ ...form, revenu_mensuel_net: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Épargne totale ($)</label>
              <input type="number" value={form.epargne_totale}
                onChange={(e) => setForm({ ...form, epargne_totale: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            💡 Ces chiffres mettent à jour automatiquement ton budget immobilier et véhicule partout dans l'app.
          </p>
        </div>

        <hr className="border-gray-100" />

        {/* Localisation & Langue */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100">
              <Globe className="h-4 w-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-gray-800">Localisation & Langue</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                <MapPin className="h-3.5 w-3.5 inline mr-1" />Ville
              </label>
              <select value={form.ville}
                onChange={(e) => setForm({ ...form, ville: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
                {["Ottawa", "Montreal", "Toronto", "Quebec", "Gatineau", "Laval", "Calgary", "Vancouver"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Langue</label>
              <select value={form.langue}
                onChange={(e) => setForm({ ...form, langue: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇨🇦 English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save button */}
        <motion.button
          onClick={handleSave} disabled={loading}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-sm transition ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:opacity-90"
          } disabled:opacity-50`}>
          <Save className="h-4 w-4" />
          {loading ? "Enregistrement..." : saved ? "✓ Profil mis à jour !" : "Sauvegarder les paramètres"}
        </motion.button>
      </div>

      {/* Email info */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
        <div className="text-sm font-medium text-gray-700 mb-1">Compte connecté</div>
        <div className="text-sm text-gray-500">{user?.email}</div>
      </div>

      {/* Maintenance */}
      <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="h-5 w-5 text-red-600" />
          <h3 className="font-bold text-gray-800">Maintenance & Nettoyage</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Supprime automatiquement les transactions et dépenses dupliquées. Cette action est sûre et ne garde que les premières occurrences.
        </p>
        <button
          onClick={handleCleanup}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-2.5 font-bold text-sm transition disabled:opacity-50"
        >
          {loading ? "Nettoyage en cours..." : "🧹 Nettoyer les doublons"}
        </button>
      </div>
    </div>
  );
}