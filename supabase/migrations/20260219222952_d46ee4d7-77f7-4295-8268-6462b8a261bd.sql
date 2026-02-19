
-- Add new columns to projects table
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS due_date date,
  ADD COLUMN IF NOT EXISTS template_key text;

-- Migrate existing admin_tasks data into projects
-- We need a default section_id, so we pick the first section available
INSERT INTO public.projects (title, description, status, priority, due_date, template_key, section_id, created_at, updated_at)
SELECT 
  at.title,
  at.description,
  CASE at.status
    WHEN 'todo' THEN 'planned'::project_status
    WHEN 'in_progress' THEN 'in_progress'::project_status
    WHEN 'done' THEN 'completed'::project_status
    ELSE 'planned'::project_status
  END,
  COALESCE(at.priority, 'medium'),
  at.due_date,
  at.template_key,
  (SELECT id FROM public.sections ORDER BY display_order ASC LIMIT 1),
  at.created_at,
  at.updated_at
FROM public.admin_tasks at
WHERE EXISTS (SELECT 1 FROM public.sections LIMIT 1);
