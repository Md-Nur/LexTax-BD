import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: docs, error: fetchError } = await supabase.from('legal_documents').select('*').limit(1);
  if (docs && docs.length > 0) {
    const docId = docs[0].id;
    const { data: updatedData, error } = await supabase.from('legal_documents').update({ title: docs[0].title + ' test' }).eq('id', docId).select();
    console.log("Update test data:", updatedData);
    console.log("Update test error:", error ? error.message : "None");
  }
}
check();
