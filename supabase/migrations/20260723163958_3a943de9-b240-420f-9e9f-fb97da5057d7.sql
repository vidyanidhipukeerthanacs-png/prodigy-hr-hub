
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  department TEXT NOT NULL,
  job_role TEXT NOT NULL,
  salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  joining_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
  photo_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view employees" ON public.employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert employees" ON public.employees FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update employees" ON public.employees FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete employees" ON public.employees FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER employees_set_updated_at BEFORE UPDATE ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view activities" ON public.activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert activities" ON public.activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_id);
