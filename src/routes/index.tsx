import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Play, Check, BarChart3, Droplets, Receipt, Users, Home, Car } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/Logo";
import { CountUp } from "@/components/CountUp";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  { icon: BarChart3, emoji: "📊", title: "Comptabilité Pro", desc: "Factures, TVA, exports. Tout est automatique.", grad: "bg-gradient-primary", href: "/comptabilite" },
  { icon: Droplets, emoji: "💧", title: "Trésorerie Live", desc: "Prévisions à 30/60/90 jours pilotées par IA.", grad: "bg-gradient-emerald", href: "/tresorerie" },
  { icon: Receipt, emoji: "🧾", title: "Dépenses & Notes", desc: "Capture, catégorise, rembourse en un clic.", grad: "bg-gradient-warm", href: "/depenses" },
  { icon: Users, emoji: "🤝", title: "CRM & Opérations", desc: "Tes clients, tes deals, ton pipeline.", grad: "bg-gradient-emerald", href: "/crm" },
  { icon: Home, emoji: "🏠", title: "Acheter une Maison", desc: "Annonces filtrées par ton vrai budget.", grad: "bg-gradient-pink", href: "/immobilier" },
  { icon: Car, emoji: "🚗", title: "Acheter un Véhicule", desc: "Simulateur de crédit en temps réel.", grad: "bg-gradient-warm", href: "/vehicule" },
];

const testimonials = [
  { 
    name: "Sarah Lemieux", 
    company: "Boutique Mode SL", 
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    link: "https://example.com/sarah",
    color: "bg-gradient-primary" 
  },
  { 
    name: "Marc Deschênes", 
    company: "Électricité Pro Inc", 
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    link: "https://example.com/marc",
    color: "bg-gradient-emerald" 
  },
  { 
    name: "Julie Fournier", 
    company: "Café Artisanal 95", 
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    link: "https://example.com/julie",
    color: "bg-gradient-warm" 
  },
  { 
    name: "Antoine Gagnon", 
    company: "Tech Solutions MTL", 
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    link: "https://example.com/antoine",
    color: "bg-gradient-pink" 
  },
  { 
    name: "Marie-Claire Bouchard", 
    company: "Design Studio QC", 
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    link: "https://example.com/marie",
    color: "bg-gradient-emerald" 
  },
  { 
    name: "Philippe Leclerc", 
    company: "Construction & Co", 
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    link: "https://example.com/philippe",
    color: "bg-gradient-warm" 
  },
];

function Landing() {
  const { t, i18n } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="hover:opacity-80 transition-opacity"><Logo /></Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Fonctionnalités</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Tarifs</a>
            <Link to="/auth" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Connexion</Link>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const next = i18n.language === 'fr' ? 'en' : 'fr';
                i18n.changeLanguage(next);
                localStorage.setItem('finova-lang', next);
              }}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-background-alt transition"
            >
              {i18n.language === 'fr' ? '🇫🇷 FR' : '🇨🇦 EN'}
            </button>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-105"
            >
              Commencer <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="mesh-blob h-[500px] w-[500px] bg-primary -top-20 -left-20" />
          <div className="mesh-blob h-[400px] w-[400px] bg-secondary top-40 right-10" style={{ animationDelay: "-5s" }} />
          <div className="mesh-blob h-[450px] w-[450px] bg-emerald bottom-0 left-1/3" style={{ animationDelay: "-10s" }} />
        </div>
        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-medium backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
              Nouveau — IA financière pour PME canadiennes
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              Toutes tes finances.<br />
              <span className="text-gradient-hero">Une seule plateforme.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Compta, trésorerie, dépenses, CRM — et on t'aide à acheter ta maison et ta voiture.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105"
              >
                Démarrer gratuitement <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-base font-semibold transition-all hover:border-primary hover:text-primary">
                <Play className="h-4 w-4" /> Voir la démo
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4"
          >
            {[
              { n: 6, l: "Logiciels remplacés" },
              { n: 1, l: "Abonnement unique" },
              { n: 100, l: "Alimenté par IA", suffix: "%" },
              { n: 2, l: "Langues supportées" },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
                <div className="font-display text-4xl font-bold text-gradient-primary">
                  <CountUp end={s.n} format={(v) => Math.round(v).toString() + (s.suffix ?? "")} />
                </div>
                <div className="mt-1 text-xs font-medium text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 bg-background-alt">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-bold md:text-5xl">
              6 modules. <span className="text-gradient-primary">1 plateforme.</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tout ce dont ta PME a besoin. Connecté, intelligent, simple.
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Link
                key={f.title}
                to={f.href}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-glow hover:border-primary cursor-pointer h-full"
                >
                  <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${f.grad} text-2xl shadow-card`}>
                    {f.emoji}
                  </div>
                  <h3 className="font-display text-xl font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-100 transition-opacity group-hover:opacity-100">
                    En savoir plus <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-bold md:text-5xl">
              Tarification <span className="text-gradient-primary">simple</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">Sans frais cachés. Sans engagement.</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { name: "Starter", price: 29, items: ["Comptabilité de base", "Jusqu'à 50 transactions/mois", "1 utilisateur"], featured: false },
              { name: "Pro", price: 79, items: ["Tous les modules", "IA & prévisions illimitées", "Immobilier + Véhicule", "Support prioritaire"], featured: true },
              { name: "Business", price: 149, items: ["Tout Pro inclus", "Utilisateurs illimités", "API & intégrations", "Account manager dédié"], featured: false },
            ].map((p) => (
              <div
                key={p.name}
                className={`relative rounded-3xl border p-8 shadow-card ${p.featured ? "border-primary bg-gradient-primary text-primary-foreground scale-105" : "border-border bg-card"}`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber px-3 py-1 text-xs font-bold text-foreground">
                    ⭐ Plus populaire
                  </span>
                )}
                <h3 className="font-display text-2xl font-bold">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold">{p.price}$</span>
                  <span className={p.featured ? "text-primary-foreground/80" : "text-muted-foreground"}>/mois</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-sm">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${p.featured ? "text-emerald" : "text-emerald"}`} />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  className={`mt-8 block rounded-full px-5 py-3 text-center text-sm font-semibold transition-transform hover:scale-[1.02] ${p.featured ? "bg-background text-foreground" : "bg-gradient-primary text-primary-foreground"}`}
                >
                  Choisir {p.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="relative py-24 bg-background-alt">
        <div className="pointer-events-none absolute inset-0">
          <div className="mesh-blob h-[500px] w-[500px] bg-emerald -bottom-32 -right-32" style={{ opacity: 0.15 }} />
          <div className="mesh-blob h-[400px] w-[400px] bg-primary -top-32 left-20" style={{ opacity: 0.12, animationDelay: "-8s" }} />
        </div>
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-display text-4xl font-bold md:text-5xl">
              Les PME et les particuliers <span className="text-gradient-primary">du Canada</span> nous adorent
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Rejoins les centaines d'entrepreneurs et particuliers qui transforment leurs finances avec nous.
            </p>
          </div>

          {/* Carousel */}
          <div className="relative overflow-hidden">
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: -2400 }}
              transition={{
                duration: 60,
                repeat: Infinity,
                ease: "linear",
              }}
              className="flex gap-6 w-max"
            >
              {[...testimonials, ...testimonials].map((person, i) => (
                <motion.div
                  key={i}
                  className="flex-shrink-0 w-80 rounded-3xl border border-border bg-card p-8 shadow-card hover:shadow-glow transition-all"
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <a 
                      href={person.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                      <img 
                        src={person.image} 
                        alt={person.name}
                        className="h-16 w-16 rounded-full object-cover shadow-card border-2 border-primary/20"
                      />
                    </a>
                    <div>
                      <a 
                        href={person.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        <h3 className="font-display font-bold text-lg">{person.name}</h3>
                      </a>
                      <p className="text-sm text-muted-foreground">{person.company}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xl">⭐</span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    "FinOva m'a simplifié la gestion de ma PME. Enfin une solution complète et intuitive!"
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Fade effect */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background-alt to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background-alt to-transparent" />
        </div>
      </section>

      {/* Partners Section */}
      <section className="relative py-16 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <h3 className="text-center text-sm font-semibold text-muted-foreground mb-12 uppercase tracking-wide">
            Nos partenaires de confiance
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
            {[
              { name: "RBC Royal Bank", logo: "🏦" },
              { name: "Stripe", logo: "💳" },
              { name: "Microsoft", logo: "🪟" },
              { name: "Google Cloud", logo: "☁️" },
              { name: "AWS", logo: "⚙️" },
              { name: "Supabase", logo: "🔐" },
              { name: "Interac", logo: "🔄" },
              { name: "Shopify", logo: "🛍️" },
            ].map((partner) => (
              <div
                key={partner.name}
                className="flex flex-col items-center gap-3"
              >
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-3xl opacity-70 hover:opacity-100 transition-opacity">
                  {partner.logo}
                </div>
                <span className="text-xs font-medium text-muted-foreground text-center max-w-[80px]">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border bg-background-alt">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-hero" />
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <Logo />
            <p className="text-sm text-muted-foreground">© 2026 FinOva. Conçu au Canada 🍁</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
