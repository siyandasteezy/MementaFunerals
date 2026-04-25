import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

async function sha512(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-512', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  // Ozow sends POST with application/x-www-form-urlencoded body
  const body = await req.text();
  const p = new URLSearchParams(body);

  const status     = p.get('Status')               ?? '';
  const txId       = p.get('TransactionId')         ?? '';
  const txRef      = p.get('TransactionReference')  ?? '';
  const amount     = p.get('Amount')                ?? '';
  const hash       = p.get('Hash')                  ?? '';

  const SITE_CODE   = Deno.env.get('OZOW_SITE_CODE')!;
  const PRIVATE_KEY = Deno.env.get('OZOW_PRIVATE_KEY')!;
  const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_KEY     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Verify Ozow's signature: SHA512(lower(SiteCode+TransactionId+TransactionReference+Amount+Status+PrivateKey))
  const expected = await sha512(
    (SITE_CODE + txId + txRef + amount + status + PRIVATE_KEY).toLowerCase()
  );

  if (expected.toLowerCase() !== hash.toLowerCase()) {
    console.error('Hash mismatch — possible spoofed request');
    return new Response('Forbidden', { status: 403 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  if (status === 'Complete') {
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status:              'active',
        current_period_end:  periodEnd.toISOString(),
        ozow_transaction_id: txId,
      })
      .eq('ozow_transaction_ref', txRef);

    if (error) {
      console.error('DB update failed:', error);
      return new Response('DB error', { status: 500 });
    }

    console.log(`✅ Subscription activated — ref: ${txRef}`);
  } else if (status === 'Cancelled' || status === 'Error') {
    // Roll back to previous state so user can try again
    await supabase
      .from('subscriptions')
      .update({ status: 'expired', ozow_transaction_ref: null })
      .eq('ozow_transaction_ref', txRef);

    console.log(`❌ Payment ${status} — ref: ${txRef}`);
  }

  // Ozow expects a 200 OK
  return new Response('OK', { status: 200 });
});
