-- Table for admin tasks (Kanban)
CREATE TABLE public.admin_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID REFERENCES public.associations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  due_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  template_key TEXT, -- For auto-generated tasks like 'ag_annuelle', 'cotisations', 'agrements'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for funding opportunities/subventions
CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC,
  deadline DATE,
  region TEXT,
  category TEXT,
  application_url TEXT,
  source TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for chat messages between associations
CREATE TABLE public.association_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_association_id UUID REFERENCES public.associations(id) ON DELETE CASCADE,
  receiver_association_id UUID REFERENCES public.associations(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.association_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_tasks
CREATE POLICY "Users can view their association tasks"
ON public.admin_tasks FOR SELECT
USING (
  association_id IN (
    SELECT id FROM public.associations WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their association tasks"
ON public.admin_tasks FOR ALL
USING (
  association_id IN (
    SELECT id FROM public.associations WHERE owner_id = auth.uid()
  )
);

-- RLS Policies for opportunities (public read)
CREATE POLICY "Anyone can view active opportunities"
ON public.opportunities FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage opportunities"
ON public.opportunities FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for association_messages
CREATE POLICY "Users can view their association messages"
ON public.association_messages FOR SELECT
USING (
  sender_association_id IN (SELECT id FROM public.associations WHERE owner_id = auth.uid())
  OR receiver_association_id IN (SELECT id FROM public.associations WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can send messages from their association"
ON public.association_messages FOR INSERT
WITH CHECK (
  sender_association_id IN (SELECT id FROM public.associations WHERE owner_id = auth.uid())
);

-- Trigger for updated_at
CREATE TRIGGER update_admin_tasks_updated_at
BEFORE UPDATE ON public.admin_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
BEFORE UPDATE ON public.opportunities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample opportunities
INSERT INTO public.opportunities (title, description, amount, deadline, region, category, application_url, source) VALUES
('Subvention FDVA - Fonctionnement', 'Fonds pour le Développement de la Vie Associative - Soutien au fonctionnement', 15000, '2026-03-15', 'Auvergne-Rhône-Alpes', 'Fonctionnement', 'https://www.associations.gouv.fr/fdva.html', 'Gouvernement'),
('Leader+ Montagne', 'Programme européen pour les zones rurales de montagne', 50000, '2026-04-30', 'Alpes', 'Développement territorial', 'https://ec.europa.eu/agriculture/rural-development', 'Union Européenne'),
('Fondation de France - Culture', 'Soutien aux projets culturels locaux', 25000, '2026-02-28', 'National', 'Culture', 'https://www.fondationdefrance.org', 'Fondation'),
('Région Savoie Mont Blanc', 'Aide aux associations culturelles et patrimoniales', 10000, '2026-05-15', 'Savoie', 'Patrimoine', 'https://www.savoie.fr', 'Région');