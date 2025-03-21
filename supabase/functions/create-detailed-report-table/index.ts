
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create the detailed_reports table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS public.detailed_reports (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES auth.users NOT NULL,
        reading_id UUID REFERENCES public.palm_readings(id) NOT NULL,
        title TEXT NOT NULL,
        sections JSONB NOT NULL,
        language TEXT NOT NULL DEFAULT 'english',
        page_count INTEGER NOT NULL DEFAULT 50,
        download_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );

      ALTER TABLE public.detailed_reports ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Users can view their own detailed reports" 
        ON public.detailed_reports 
        FOR SELECT 
        USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert their own detailed reports" 
        ON public.detailed_reports 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    `

    const { error } = await supabaseClient.rpc('pgclient', { query: createTableQuery })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ message: 'Detailed reports table created successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
