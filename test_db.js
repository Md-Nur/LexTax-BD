import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log("URL:", supabaseUrl ? "Set" : "Not Set");
  console.log("Key:", supabaseAnonKey ? "Set" : "Not Set");
  
  if (!supabaseUrl) return;

  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log("Profiles test:", error ? error.message : "Success");
}
check();
