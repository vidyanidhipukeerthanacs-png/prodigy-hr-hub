
DROP POLICY IF EXISTS "Authenticated can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Authenticated can update employees" ON public.employees;
DROP POLICY IF EXISTS "Authenticated can delete employees" ON public.employees;

CREATE POLICY "Admins can insert employees" ON public.employees FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update employees" ON public.employees FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete employees" ON public.employees FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
