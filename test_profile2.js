import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  // 1. Create a test user
  const email = 'testadmin_' + Date.now() + '@example.com';
  const password = 'Password123!';
  
  console.log("Creating user...", email);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (authError) {
    console.log("Auth Error:", authError.message);
    return;
  }
  
  const userId = authData.user.id;
  
  // Wait a bit for the trigger to insert into profiles
  await new Promise(r => setTimeout(r, 1000));
  
  // 2. Make them an admin using the service role just in case
  const { error: updateRoleError } = await supabaseAdmin
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId);
    
  if (updateRoleError) {
    console.log("Role update error:", updateRoleError.message);
  }
  
  console.log("User created and role updated.");
  
  // 3. Create a test document
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('legal_documents')
    .insert({
      title: 'TEST DELETE ME',
      branch: 'Income Tax',
      type: 'ACT',
      year: 2024,
      content: 'test content'
    })
    .select();
    
  if (insertError) {
    console.log("Insert Error:", insertError.message);
    return;
  }
  
  const docId = inserted[0].id;
  console.log("Document created:", docId);
  
  // 4. Try to update it using the normal client (which is logged in)
  const { data: updated, error: updateError } = await supabase
    .from('legal_documents')
    .update({ title: 'UPDATED TITLE' })
    .eq('id', docId)
    .select();
    
  console.log("Update check:", updated, updateError?.message);
  
  // 5. Try to delete it
  const { error: deleteError } = await supabase
    .from('legal_documents')
    .delete()
    .eq('id', docId);
    
  console.log("Delete check:", deleteError ? deleteError.message : "Success");
  
  // Cleanup
  await supabaseAdmin.auth.admin.deleteUser(userId);
  await supabaseAdmin.from('legal_documents').delete().eq('id', docId);
}
check();
