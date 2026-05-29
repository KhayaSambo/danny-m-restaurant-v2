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
    const { token, amountInCents, currency } = await req.json()

    // 1. Process with Yoco API
    const yocoSecret = Deno.env.get('YOCO_SECRET_KEY') || 'sk_test_placeholder';
    if (!yocoSecret) throw new Error('Yoco secret key not configured')

    const response = await fetch('https://online.yoco.com/v1/charges/', {
      method: 'POST',
      headers: {
        'X-Auth-Secret-Key': yocoSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
        amountInCents: amountInCents,
        currency: currency || 'ZAR'
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Payment processing failed')
    }

    return new Response(
      JSON.stringify({ success: true, chargeId: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
