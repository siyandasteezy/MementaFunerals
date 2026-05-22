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

// ── Valid plans: key = months, value = price in ZAR (Rands) ──────────────────
const VALID_PLANS: Record<number, number> = {
  1:  250,
  3:  700,
  6:  1300,
  12: 2400,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { userId, userEmail, months: rawMonths } = await req.json();
    if (!userId) return new Response('Missing userId', { status: 400 });

    // Validate plan — always derive amount server-side from the plan table
    const months   = VALID_PLANS[Number(rawMonths)] !== undefined ? Number(rawMonths) : 1;
    const amountZAR = VALID_PLANS[months]; // e.g. 250 (Rands)
    const amount    = amountZAR.toFixed(2); // e.g. "250.00" — Ozow expects Rands, NOT cents

    const SITE_CODE    = Deno.env.get('OZOW_SITE_CODE')!;
    const PRIVATE_KEY  = Deno.env.get('OZOW_PRIVATE_KEY')!;
    const IS_TEST      = Deno.env.get('OZOW_IS_TEST') ?? 'true';
    const SITE_URL     = Deno.env.get('SITE_URL') ?? 'https://mementa.co.za';
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // TxRef encodes plan duration so the webhook knows how many months to activate
    // Format: MEM-{timestamp}-{userId8}-{months}M
    const txRef   = `MEM-${Date.now()}-${userId.slice(0, 8)}-${months}M`;
    const bankRef = `Mementa ${months === 1 ? 'Monthly' : `${months}-Month Plan`}`;

    const country    = 'ZA';
    const currency   = 'ZAR';
    const cancelUrl  = `${SITE_URL}/subscribe/cancel/`;
    const errorUrl   = `${SITE_URL}/subscribe/cancel/`;
    const successUrl = `${SITE_URL}/subscribe/success/`;
    const notifyUrl  = `${SUPABASE_URL}/functions/v1/ozow-webhook`;

    // Ozow hash: SHA512(lowercase concat of all required fields + private key)
    // Field order MUST match exactly: SiteCode+Country+Currency+Amount+TxRef+BankRef+
    //                                  CancelUrl+ErrorUrl+SuccessUrl+NotifyUrl+IsTest+PrivateKey
    const hashInput = (
      SITE_CODE + country + currency + amount + txRef + bankRef +
      cancelUrl + errorUrl + successUrl + notifyUrl + IS_TEST + PRIVATE_KEY
    ).toLowerCase();

    const hashCheck = await sha512(hashInput);

    // Debug log — prints every field going into the hash (private key hidden)
    console.log('🔐 Hash input breakdown:');
    console.log('  SiteCode:   ', SITE_CODE);
    console.log('  Country:    ', country);
    console.log('  Currency:   ', currency);
    console.log('  Amount:     ', amount);
    console.log('  TxRef:      ', txRef);
    console.log('  BankRef:    ', bankRef);
    console.log('  CancelUrl:  ', cancelUrl);
    console.log('  ErrorUrl:   ', errorUrl);
    console.log('  SuccessUrl: ', successUrl);
    console.log('  NotifyUrl:  ', notifyUrl);
    console.log('  IsTest:     ', IS_TEST);
    console.log('  PrivateKey: ', PRIVATE_KEY ? `[SET — ${PRIVATE_KEY.length} chars, starts: ${PRIVATE_KEY.slice(0, 4)}...]` : '[NOT SET ❌]');
    console.log('  HashCheck:  ', hashCheck.slice(0, 20) + '...');

    // Persist a pending subscription row so the webhook can match on txRef
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { error: upsertError } = await supabase.from('subscriptions').upsert(
      {
        user_id:              userId,
        status:               'pending_payment',
        ozow_transaction_ref: txRef,
        trial_ends_at:        new Date().toISOString(),
        current_period_end:   null,
      },
      { onConflict: 'user_id' }
    );
    if (upsertError) console.error('Subscription upsert error:', upsertError);

    // Build the Ozow payment URL
    // NOTE: to restrict payment methods to EFT + Card only, go to:
    //   Ozow Merchant Portal → Sites → K20-MEM-001 → Payment Methods
    //   and disable any methods you don't want (e.g. QR, EWallet, etc.)
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

    console.log(`💳 Payment URL created — ref: ${txRef} | plan: ${months}M | amount: R${amount}`);

    return new Response(JSON.stringify({ url: ozowUrl, txRef, amount, months }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('create-ozow-payment error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
