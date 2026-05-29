import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amountInCents, currency, successUrl, cancelUrl } = await req.json()

    // 1. Fetch Yoco Private Secret Key from Environment
    const yocoSecret = Deno.env.get('YOCO_SECRET_KEY');
    if (!yocoSecret) throw new Error('YOCO_SECRET_KEY is not configured. Set it via: supabase secrets set YOCO_SECRET_KEY=sk_live_...')

    // 2. Post to Yoco's Hosted Checkout Session Creator
    const response = await fetch('https://online.yoco.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'X-Auth-Secret-Key': yocoSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amountInCents: amountInCents,
        currency: currency || 'ZAR',
        successUrl: successUrl,
        cancelUrl: cancelUrl
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Checkout session creation failed')
    }

    return new Response(
      JSON.stringify({ success: true, redirectUrl: data.redirectUrl, checkoutId: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
