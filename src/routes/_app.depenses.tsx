import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

function DépensesComponent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-warm p-8 text-white shadow-glow">
        <h1 className="font-display text-3xl font-bold">{t('expenses.title')}</h1>
        <p className="mt-1 opacity-90">{t('expenses.subtitle')}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-card">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-warm flex items-center justify-center text-3xl mb-4">📸</div>
        <h2 className="font-display text-2xl font-bold">{t('expenses.coming_soon_title')}</h2>
        <p className="mt-2 text-muted-foreground">{t('expenses.coming_soon_desc')}</p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_app/depenses")({
  component: DépensesComponent,
});


