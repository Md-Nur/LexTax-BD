import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.TEST_EMAIL || 'admin@example.com', // Replace with an actual admin email if needed, or we just try anon
    password: process.env.TEST_PASSWORD || 'password123'
  });
  
  console.log("Auth:", authError ? authError.message : "Success");

  const { data: docs, error: fetchError } = await supabase.from('legal_documents').select('*').limit(1);
  console.log("Fetch docs:", fetchError ? fetchError.message : `Found ${docs?.length} docs`);
  
  if (docs && docs.length > 0) {
    const docId = docs[0].id;
    const { data, error } = await supabase.from('legal_documents').update({ title: docs[0].title + ' test' }).eq('id', docId);
    console.log("Update test:", error ? error.message : "Success");
    
    // revert
    if (!error) {
       await supabase.from('legal_documents').update({ title: docs[0].title }).eq('id', docId);
    }
  }
}
check();
