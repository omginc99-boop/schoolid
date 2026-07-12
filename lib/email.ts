// Transactional email via Resend (Agodi email-infra standard).
// Server-side only. Requires RESEND_API_KEY; EMAIL_FROM optional
// (defaults to Resend's onboarding sender until the SchoolID domain
// is verified at Resend).

const BRAND = '#4f46e5';
const BRAND_DARK = '#3730a3';
const GOLD = '#d97706';
const INK = '#0e1330';
const MUTED = '#5a6285';

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? 'SchoolID <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    return { ok: false, error: `Resend ${res.status}: ${detail.slice(0, 300)}` };
  }
  return { ok: true };
}

function shell(bodyHtml: string, preheader: string): string {
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f8fb;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fb;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- header -->
        <tr><td style="background:${BRAND};border-radius:16px 16px 0 0;padding:28px 36px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="background:#ffffff;border-radius:10px;width:40px;height:40px;text-align:center;font-size:22px;line-height:40px;">🎓</td>
            <td style="padding-left:12px;font-size:22px;font-weight:700;color:#ffffff;">School<span style="color:#c7ccf5;">ID</span></td>
          </tr></table>
        </td></tr>
        <!-- body -->
        <tr><td style="background:#ffffff;padding:36px;border:1px solid #e3e7f0;border-top:none;">
          ${bodyHtml}
        </td></tr>
        <!-- footer -->
        <tr><td style="background:#ffffff;border-radius:0 0 16px 16px;border:1px solid #e3e7f0;border-top:1px solid #eef1f7;padding:22px 36px;">
          <p style="margin:0;font-size:12px;color:${MUTED};line-height:1.6;">
            SchoolID — The Digital Operating System for Education<br>
            An <strong>Agodi Technologies</strong> product · <a href="mailto:info@agoditechnologies.com" style="color:${BRAND};text-decoration:none;">info@agoditechnologies.com</a> · <a href="https://agoditechnologies.com" style="color:${BRAND};text-decoration:none;">agoditechnologies.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendSchoolWelcomeEmail(opts: {
  to: string;
  adminName: string;
  schoolName: string;
  schoolSlug: string;
  appUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const firstName = opts.adminName.split(/\s+/)[0] || 'there';
  const dash = `${opts.appUrl}/dashboard`;
  const body = `
    <h1 style="margin:0 0 6px;font-size:24px;color:${INK};">Welcome to SchoolID, ${firstName} 🎉</h1>
    <p style="margin:0 0 22px;font-size:15px;color:${MUTED};line-height:1.65;">
      <strong style="color:${INK};">${opts.schoolName}</strong> is now live on SchoolID —
      one platform for records, fees, identity, communication and AI.
      You're the school administrator, and everything below is ready today.
    </p>

    <a href="${dash}" style="display:inline-block;background:${BRAND};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:13px 28px;border-radius:10px;">Open your dashboard →</a>

    <h2 style="margin:30px 0 4px;font-size:16px;color:${INK};">Your first week, in four steps</h2>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:10px;">
      ${[
        ['1', 'Set up your school year', 'Create the academic year, terms and your first classes.'],
        ['2', 'Enroll your people', 'Add students, teachers and parents — each one automatically receives a verified SchoolID with a QR ID card.'],
        ['3', 'Invite parents & staff', 'They sign up with the same email you enrolled them with, and their profile links itself. Same app, right dashboard.'],
        ['4', 'Switch on fees', 'Define your fee structure and start sending invoices — parents pay online and you watch collection live.'],
      ].map(([n, t, d]) => `
      <tr>
        <td valign="top" style="padding:0 14px 16px 0;">
          <div style="background:#eef0fe;color:${BRAND};font-weight:700;font-size:14px;border-radius:999px;width:28px;height:28px;line-height:28px;text-align:center;">${n}</div>
        </td>
        <td style="padding-bottom:16px;">
          <p style="margin:0;font-size:14.5px;font-weight:700;color:${INK};">${t}</p>
          <p style="margin:2px 0 0;font-size:13.5px;color:${MUTED};line-height:1.55;">${d}</p>
        </td>
      </tr>`).join('')}
    </table>

    <div style="background:#fdf3e3;border-radius:12px;padding:16px 20px;margin-top:8px;">
      <p style="margin:0;font-size:13.5px;color:${GOLD};line-height:1.6;">
        <strong>Your school's first term on SchoolID is free.</strong>
        No card required — bring your classes on board and see it work.
      </p>
    </div>

    <p style="margin:26px 0 0;font-size:13.5px;color:${MUTED};line-height:1.65;">
      Questions? Just reply to this email — a real person at Agodi reads it.<br>
      Your school's page name: <strong style="color:${INK};">/${opts.schoolSlug}</strong>
    </p>`;
  return sendEmail(
    opts.to,
    `${opts.schoolName} is live on SchoolID 🎓`,
    shell(body, `${opts.schoolName} is now on SchoolID — here's how to get set up in your first week.`),
  );
}
