-- Création de la table des profils utilisateurs
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  location TEXT,
  website TEXT,
  bio TEXT,
  sector TEXT,
  experience TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  
  PRIMARY KEY (id)
);

-- Table des compétences
CREATE TABLE IF NOT EXISTS public.skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Table de liaison utilisateur-compétences
CREATE TABLE IF NOT EXISTS public.user_skills (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id INTEGER REFERENCES public.skills(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, skill_id)
);

-- Table des intérêts de recherche
CREATE TABLE IF NOT EXISTS public.looking_for (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Table de liaison utilisateur-intérêts
CREATE TABLE IF NOT EXISTS public.user_looking_for (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  looking_for_id INTEGER REFERENCES public.looking_for(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, looking_for_id)
);

-- Table des messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE
);

-- Table des événements
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  max_participants INTEGER,
  cover_url TEXT
);

-- Table des participants aux événements
CREATE TABLE IF NOT EXISTS public.event_participants (
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  PRIMARY KEY (event_id, user_id)
);

-- Fonction pour mettre à jour le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheurs pour mettre à jour automatiquement les champs updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques de sécurité RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Politiques pour les profils
CREATE POLICY "Les utilisateurs peuvent voir tous les profils"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Politiques pour les messages
CREATE POLICY "Les utilisateurs peuvent voir les messages qu'ils ont envoyés ou reçus"
ON public.messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Les utilisateurs peuvent envoyer des messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Politiques pour les événements
CREATE POLICY "Tout le monde peut voir les événements"
ON public.events FOR SELECT
USING (true);

CREATE POLICY "Les utilisateurs peuvent créer des événements"
ON public.events FOR INSERT
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Les organisateurs peuvent mettre à jour leurs événements"
ON public.events FOR UPDATE
USING (auth.uid() = organizer_id);

-- Fonction pour créer automatiquement un profil lors de l'inscription d'un nouvel utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1),
    split_part(NEW.raw_user_meta_data->>'full_name', ' ', 2)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Déclencheur pour créer automatiquement un profil lors de l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
