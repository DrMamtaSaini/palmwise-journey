
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables for Supabase connection');
    }

    console.log("Creating Supabase client with admin privileges");
    
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Checking if detailed_reports table exists");
    
    // Check if table exists
    const { data: tableExists, error: tableExistsError } = await supabase
      .from('detailed_reports')
      .select('id')
      .limit(1);
      
    if (tableExistsError && tableExistsError.message.includes('does not exist')) {
      console.log("Table doesn't exist, creating it now");
      
      // Create the detailed_reports table
      const { error: createTableError } = await supabase
        .rpc('create_detailed_reports_table') as any;
        
      if (createTableError) {
        console.error("Error creating table via RPC:", createTableError);
        
        // Try direct SQL as fallback
        const { error: sqlError } = await supabase.sql(`
          CREATE TABLE public.detailed_reports (
            id UUID PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) NOT NULL,
            reading_id UUID NOT NULL,
            title TEXT NOT NULL,
            sections JSONB NOT NULL,
            language TEXT NOT NULL DEFAULT 'english',
            page_count INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            download_url TEXT,
            translation_note TEXT
          );
          
          ALTER TABLE public.detailed_reports ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Users can view their own reports"
          ON public.detailed_reports
          FOR SELECT
          USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can insert their own reports"
          ON public.detailed_reports
          FOR INSERT
          WITH CHECK (auth.uid() = user_id);
        `) as any;
        
        if (sqlError) {
          throw new Error(`Failed to create table via SQL: ${sqlError.message}`);
        }
        
        console.log("Successfully created detailed_reports table via SQL");
      } else {
        console.log("Successfully created detailed_reports table via RPC");
      }
    } else {
      console.log("Table already exists");
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Detailed reports table checked/created successfully"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error("Error in function:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
