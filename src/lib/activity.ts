import { supabase } from "@/integrations/supabase/client";

export async function logActivity(action: string, target?: string) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("activities" as never).insert({
    actor_id: data.user.id,
    action,
    target: target ?? null,
  } as never);
}
