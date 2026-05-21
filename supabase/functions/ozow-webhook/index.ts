import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

async function sha512(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-512', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Parse months from TxRef formatted as MEM-{ts}-{uid8}-{n}M */
function parseMonthsFromTxRef(txRef: string): number {
  const match = txRef.match(/-(\d+)M$/);
  if (match) {
    const n = parseInt(match[1], 10);
    if ([1, 3, 6, 12].includes(n)) return n;
  }
  return 1; // fallback to monthly
}

serve(async (req) => {
  // Ozow sends POST with application/x-www-form-urlencoded body
  const body = await req.text();
  const p    = new URLSearchParams(body);

  const status = p.get('Status')              ?? '';
  const txId   = p.get('TransactionId')        ?? '';
  const txRef  = p.get('TransactionReference') ?? '';
  const amount = p.get('Amount')               ?? '';
  const hash   = p.get('Hash')                 ?? '';

  const SITE_CODE    = Deno.env.get('OZOW_SITE_CODE')!;
  const PRIVATE_KEY  = Deno.env.get('OZOW_PRIVATE_KEY')!;
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Verify Ozow signature
  const expected = await sha512(
    (SITE_CODE + txId + txRef + amount + status + PRIVATE_KEY).toLowerCase()
  );
  if (expected.toLowerCase() !== hash.toLowerCase()) {
    console.error('Hash mismatch — possible spoofed request');
    return new Response('Forbidden', { status: 403 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Resolve the user_id from the subscription row matching this txRef
  const { data: subRow } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('ozow_transaction_ref', txRef)
    .maybeSingle();

  const userId  = subRow?.user_id ?? null;
  const months  = parseMonthsFromTxRef(txRef);
  const amountNum = parseFloat(amount) || null;

  if (status === 'Complete') {
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + months);

    // Update subscription to active
    const { error: subError } = await supabase
      .from('subscriptions')
      .update({
        status:              'active',
        current_period_end:  periodEnd.toISOString(),
        ozow_transaction_id: txId,
      })
      .eq('ozow_transaction_ref', txRef);

    if (subError) {
      console.error('Subscription update failed:', subError);
      return new Response('DB error', { status: 500 });
    }

    // Log payment record
    if (userId) {
      await supabase.from('payments').insert({
        user_id:              userId,
        ozow_transaction_id:  txId,
        ozow_transaction_ref: txRef,
        amount:               amountNum,
        months,
        status:               'completed',
      });
    }

    console.log(`✅ Subscription activated — ref: ${txRef} | ${months} month(s) | expires: ${periodEnd.toISOString()}`);

  } else if (status === 'Cancelled' || status === 'Error') {
    await supabase
      .from('subscriptions')
      .update({ status: 'expired', ozow_transaction_ref: null })
      .eq('ozow_transaction_ref', txRef);

    // Log failed payment
    if (userId) {
      await supabase.from('payments').insert({
        user_id:              userId,
        ozow_transaction_id:  txId,
        ozow_transaction_ref: txRef,
        amount:               amountNum,
        months,
        status:               status === 'Cancelled' ? 'cancelled' : 'failed',
      });
    }

    console.log(`❌ Payment ${status} — ref: ${txRef}`);
  }

  // Ozow expects 200 OK
  return new Response('OK', { status: 200 });
});
