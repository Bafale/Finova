-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom TEXT,
  nom TEXT,
  revenu_mensuel_net NUMERIC DEFAULT 4800,
  epargne_totale NUMERIC DEFAULT 2100,
  ville TEXT DEFAULT 'Ottawa',
  langue TEXT DEFAULT 'fr',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  montant NUMERIC NOT NULL,
  description TEXT NOT NULL,
  categorie TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entree','sortie')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own tx" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own tx" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own tx" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own tx" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Agents (public read)
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  agence TEXT,
  email TEXT,
  telephone TEXT,
  note NUMERIC DEFAULT 4.8,
  photo_url TEXT,
  ville TEXT
);
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents readable by all" ON public.agents FOR SELECT USING (true);

-- Properties (public read)
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adresse TEXT NOT NULL,
  ville TEXT NOT NULL,
  prix NUMERIC NOT NULL,
  chambres INTEGER,
  salles_de_bain INTEGER,
  superficie_sqft INTEGER,
  photo_url TEXT,
  agent_id UUID REFERENCES public.agents(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Properties readable by all" ON public.properties FOR SELECT USING (true);

-- Vehicles (public read)
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marque TEXT NOT NULL,
  modele TEXT NOT NULL,
  annee INTEGER,
  prix NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('auto','moto')),
  concessionnaire TEXT,
  ville TEXT,
  photo_url TEXT,
  financement_disponible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vehicles readable by all" ON public.vehicles FOR SELECT USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + seed transactions on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, prenom, nom)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'prenom', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'nom', '')
  );
  -- Seed sample transactions for the new user
  INSERT INTO public.transactions (user_id, montant, description, categorie, type, date) VALUES
    (NEW.id, 4800, 'Salaire Net', 'Revenus', 'entree', CURRENT_DATE - INTERVAL '17 days'),
    (NEW.id, 1500, 'Loyer', 'Loyer', 'sortie', CURRENT_DATE - INTERVAL '17 days'),
    (NEW.id, 320, 'Épicerie Metro', 'Alimentation', 'sortie', CURRENT_DATE - INTERVAL '15 days'),
    (NEW.id, 145, 'Hydro-Québec', 'Abonnements', 'sortie', CURRENT_DATE - INTERVAL '13 days'),
    (NEW.id, 2200, 'Client ABC', 'Revenus', 'entree', CURRENT_DATE - INTERVAL '11 days'),
    (NEW.id, 95, 'Essence', 'Transport', 'sortie', CURRENT_DATE - INTERVAL '10 days'),
    (NEW.id, 28, 'Netflix + Spotify', 'Abonnements', 'sortie', CURRENT_DATE - INTERVAL '8 days'),
    (NEW.id, 67, 'Restaurant', 'Loisirs', 'sortie', CURRENT_DATE - INTERVAL '6 days'),
    (NEW.id, 800, 'Freelance design', 'Revenus', 'entree', CURRENT_DATE - INTERVAL '4 days'),
    (NEW.id, 43, 'Pharmacie', 'Autre', 'sortie', CURRENT_DATE - INTERVAL '3 days');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();