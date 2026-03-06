import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'md.nurealamsiddiquee2004@gmail.com',
    password: 'password123' // assuming simple test password, if wrong we won't get far
  });
  
  console.log("Auth:", authError ? authError.message : "Success");
  
  if (authData?.session) {
    const { data: docs, error: fetchError } = await supabase.from('legal_documents').select('*').limit(1);
    if (docs && docs.length > 0) {
      const docId = docs[0].id;
      const { data: updatedData, error } = await supabase
        .from('legal_documents')
        .update({ title: docs[0].title + ' tested' })
        .eq('id', docId)
        .select();
        
      console.log("Update result:", updatedData);
      console.log("Update error:", error ? error.message : "None");
      
      if (!error && updatedData && updatedData.length > 0) {
        await supabase.from('legal_documents').update({ title: docs[0].title }).eq('id', docId);
      }
    }
  }
}
check();
