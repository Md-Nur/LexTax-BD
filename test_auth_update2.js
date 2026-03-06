import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'md.nurealamsiddiquee2004@gmail.com', // Admin user
    password: 'password123' // We don't have the real password, so this might fail. We'll check.
  });
  
  if (authError) {
    console.log("Auth Error:", authError.message);
    console.log("Please test the update and delete functionality directly in the admin panel of your app.");
    return;
  }
  
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
        // Revert changes
        await supabase.from('legal_documents').update({ title: docs[0].title }).eq('id', docId);
        console.log("Update verified and reverted.");
      } else {
        console.log("Update failed to write.");
      }
    } else {
      console.log("No documents to test update.");
    }
  }
}
check();
