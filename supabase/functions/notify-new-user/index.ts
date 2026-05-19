import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NOTIFY_ADDRESSES = ['siyandaedwana@gmail.com', 'support@mementa.co.za'];

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { name, email, phone, businessName } = await req.json();

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set — skipping notification');
      return new Response('Email service not configured', { status: 200, headers: cors });
    }

    const subject = `New Mementa Registration — ${name || email}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
    .wrap { max-width: 520px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .header { background: #0F2B5B; padding: 24px 32px; }
    .header h1 { color: #fff; margin: 0; font-size: 20px; }
    .header p  { color: #93b4d9; margin: 4px 0 0; font-size: 13px; }
    .body { padding: 28px 32px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    td { padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    td:first-child { color: #888; width: 130px; }
    td:last-child { font-weight: 600; color: #0F2B5B; }
    .footer { background: #f9f9f9; padding: 16px 32px; font-size: 12px; color: #aaa; text-align: center; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>New User Registration</h1>
      <p>Someone just signed up on Mementa</p>
    </div>
    <div class="body">
      <table>
        <tr><td>Full Name</td><td>${name        || '—'}</td></tr>
        <tr><td>Email</td>    <td>${email       || '—'}</td></tr>
        <tr><td>Phone</td>    <td>${phone       || '—'}</td></tr>
        <tr><td>Business</td> <td>${businessName || '—'}</td></tr>
      </table>
    </div>
    <div class="footer">Mementa · mementa.co.za</div>
  </div>
</body>
</html>`;

    // Send to all notify addresses in parallel
    const results = await Promise.allSettled(
      NOTIFY_ADDRESSES.map((to) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from:    'Mementa <noreply@mementa.co.za>',
            to,
            subject,
            html,
          }),
        }).then(async (r) => {
          if (!r.ok) {
            const txt = await r.text();
            throw new Error(`Resend error ${r.status}: ${txt}`);
          }
          return r.json();
        })
      )
    );

    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`Failed to notify ${NOTIFY_ADDRESSES[i]}:`, r.reason);
      } else {
        console.log(`Notified ${NOTIFY_ADDRESSES[i]} ✓`);
      }
    });

    return new Response('OK', { status: 200, headers: cors });
  } catch (err) {
    console.error('notify-new-user error:', err);
    // Return 200 so the client registration flow is never blocked
    return new Response(String(err), { status: 200, headers: cors });
  }
});
