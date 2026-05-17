import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sha512(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-512', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { userId, userEmail, amount: rawAmount, months: rawMonths } = await req.json();
    if (!userId) return new Response('Missing userId', { status: 400 });

    // Validate plan
    const VALID_PLANS: Record<number, number> = { 1: 250, 3: 700, 6: 1300, 12: 2400 };
    const months = Number(rawMonths) || 1;
    const amount = VALID_PLANS[months]
      ? (VALID_PLANS[months] / 100).toFixed(2)   // e.g. "250.00"
      : (Number(rawAmount) || 250).toFixed(2);

    const SITE_CODE    = Deno.env.get('OZOW_SITE_CODE')!;
    const PRIVATE_KEY  = Deno.env.get('OZOW_PRIVATE_KEY')!;
    const IS_TEST      = Deno.env.get('OZOW_IS_TEST') ?? 'true';
    const SITE_URL     = Deno.env.get('SITE_URL') ?? 'https://mementa.co.za';
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Encode months in TxRef so the webhook knows the plan duration
    // Format: MEM-{timestamp}-{userId8}-{months}M
    const txRef     = `MEM-${Date.now()}-${userId.slice(0, 8)}-${months}M`;
    const bankRef   = `Mementa ${months === 1 ? 'Monthly' : `${months} Months`}`;
    const country   = 'ZA';
    const currency  = 'ZAR';
    const cancelUrl  = `${SITE_URL}/subscribe/cancel/`;
    const errorUrl   = `${SITE_URL}/subscribe/cancel/`;
    const successUrl = `${SITE_URL}/subscribe/success/`;
    const notifyUrl  = `${SUPABASE_URL}/functions/v1/ozow-webhook`;

    // SHA512(lowercase(SiteCode+Country+Currency+Amount+TxRef+BankRef+CancelUrl+ErrorUrl+SuccessUrl+NotifyUrl+IsTest+PrivateKey))
    const hashInput = (
      SITE_CODE + country + currency + amount + txRef + bankRef +
      cancelUrl + errorUrl + successUrl + notifyUrl + IS_TEST + PRIVATE_KEY
    ).toLowerCase();

    const hashCheck = await sha512(hashInput);

    // Record pending payment
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    await supabase.from('subscriptions').upsert(
      {
        user_id:              userId,
        status:               'pending_payment',
        ozow_transaction_ref: txRef,
        trial_ends_at:        new Date().toISOString(),
        current_period_end:   null,
      },
      { onConflict: 'user_id' }
    );

    const params = new URLSearchParams({
      SiteCode:             SITE_CODE,
      CountryCode:          country,
      CurrencyCode:         currency,
      Amount:               amount,
      TransactionReference: txRef,
      BankReference:        bankRef,
      Customer:             userEmail ?? '',
      CancelUrl:            cancelUrl,
      ErrorUrl:             errorUrl,
      SuccessUrl:           successUrl,
      NotifyUrl:            notifyUrl,
      IsTest:               IS_TEST,
      HashCheck:            hashCheck,
    });

    const ozowUrl = `https://pay.ozow.com/?${params.toString()}`;
    return new Response(JSON.stringify({ url: ozowUrl, txRef }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
