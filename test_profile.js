import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey);

async function check() {
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  console.log("Profiles:", profiles);
  console.log("Error:", error ? error.message : "None");
}
check();
