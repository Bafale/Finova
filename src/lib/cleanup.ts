import { supabase } from "@/integrations/supabase/client";

/**
 * Nettoie les transactions dupliquées dans Supabase
 * Garde la première occurrence, supprime les doublons
 */
export async function cleanupDuplicateTransactions(userId: string) {
  try {
    // Récupérer toutes les transactions de l'utilisateur
    const { data: transactions, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (fetchError) throw fetchError;
    if (!transactions || transactions.length === 0) return { removed: 0, kept: 0 };

    // Détecter les doublons (même description, montant, catégorie, date)
    const seen = new Map<string, string>(); // clé -> id à garder
    const toDelete: string[] = [];

    transactions.forEach((tx) => {
      const key = `${tx.description}-${tx.montant}-${tx.categorie}-${tx.date}`;
      if (seen.has(key)) {
        // C'est un doublon, à supprimer
        toDelete.push(tx.id);
      } else {
        // Première occurrence, à garder
        seen.set(key, tx.id);
      }
    });

    // Supprimer les doublons
    let removed = 0;
    for (const id of toDelete) {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (!error) removed++;
    }

    return { removed, kept: transactions.length - removed };
  } catch (error) {
    console.error("Erreur lors du nettoyage:", error);
    throw error;
  }
}

/**
 * Nettoie les dépenses dupliquées dans Supabase
 */
export async function cleanupDuplicateExpenses(userId: string) {
  try {
    const { data: expenses, error: fetchError } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (fetchError) throw fetchError;
    if (!expenses || expenses.length === 0) return { removed: 0, kept: 0 };

    const seen = new Map<string, string>();
    const toDelete: string[] = [];

    expenses.forEach((exp) => {
      const key = `${exp.description}-${exp.montant}-${exp.categorie}-${exp.date}`;
      if (seen.has(key)) {
        toDelete.push(exp.id);
      } else {
        seen.set(key, exp.id);
      }
    });

    let removed = 0;
    for (const id of toDelete) {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (!error) removed++;
    }

    return { removed, kept: expenses.length - removed };
  } catch (error) {
    console.error("Erreur lors du nettoyage:", error);
    throw error;
  }
}
