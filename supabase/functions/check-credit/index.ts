import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { creditAmount } = await req.json(); // Get creditAmount from body

    if (typeof creditAmount !== 'number' || creditAmount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid creditAmount provided.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the user ID from the request context
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const userId = user.id

    // Fetch current credit count
    const { data: creditsData, error: fetchError } = await supabaseClient
      .from('credits')
      .select('credit_count')
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
      throw fetchError
    }

    const currentCredit = creditsData?.credit_count || 0

    // Check if user has enough credits
    if (currentCredit < creditAmount) {
      return new Response(JSON.stringify({ error: 'Bạn không đủ Credit.', credit_count: currentCredit }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403, // Forbidden
      });
    }

    return new Response(JSON.stringify({ credit_count: currentCredit }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})