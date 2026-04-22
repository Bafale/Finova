import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";
import appCss from "../styles.css?url";
import "../i18n/index";


function NotFoundComponent() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-gradient-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">{t('common.not_found')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('common.page_not_found_desc')}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105"
          >
            {t('common.back_home')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FinOva — Toutes tes finances. Une seule plateforme." },
      { name: "description", content: "Compta, trésorerie, dépenses, CRM et IA pour PME canadiennes. Achète ta maison et ta voiture avec ton vrai pouvoir d'achat." },
      { name: "author", content: "FinOva" },
      { property: "og:title", content: "FinOva — La plateforme financière tout-en-un" },
      { property: "og:description", content: "Compta, trésorerie, immobilier, véhicule. Toutes tes finances en un seul endroit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
