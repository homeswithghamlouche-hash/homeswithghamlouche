// api/lead.js
//
// Vercel serverless function — handles both the home-valuation form
// and the general contact form. Sends a formatted email to
// homeswithghamlouche@gmail.com via Resend.
//
// Setup required (see README.md):
//   1. Create a free account at https://resend.com
//   2. Get an API key
//   3. In your Vercel project: Settings > Environment Variables
//      add RESEND_API_KEY = <your key>
//   4. (Optional, recommended once you're live) verify your own
//      sending domain in Resend and update FROM_ADDRESS below —
//      until then this uses Resend's shared test address, which
//      works immediately but is best for getting started.
//
// To add CRM push later (HubSpot / Follow Up Boss): see the
// clearly marked block near the bottom of this file.

const TO_ADDRESS = "homeswithghamlouche@gmail.com";
const FROM_ADDRESS = "homeswithghamlouche <onboarding@resend.dev>"; // swap once a custom domain is verified in Resend

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // Honeypot: a hidden field named "company" that real visitors never fill in.
  // If it has a value, silently pretend success — don't tip off the bot.
  if (body.company) {
    return res.status(200).json({ ok: true });
  }

  const formType = body.formType === "valuation" ? "Home Valuation Request" : "Contact Form Message";

  const name = escapeHtml(body.name || "");
  const email = escapeHtml(body.email || "");
  const phone = escapeHtml(body.phone || "");

  if (!name || !email || !phone) {
    return res.status(400).json({ ok: false, error: "Missing required fields." });
  }

  const rows = [];
  rows.push(["Name", name]);
  rows.push(["Email", email]);
  rows.push(["Phone", phone]);

  if (body.formType === "valuation") {
    rows.push(["Address", escapeHtml(body.address || "")]);
    rows.push(["City", escapeHtml(body.city || "")]);
    rows.push(["Sqft", escapeHtml(body.sqft || "")]);
    rows.push(["Bedrooms", escapeHtml(body.beds || "")]);
    rows.push(["Condition", escapeHtml(body.condition || "")]);
    rows.push(["Estimate shown", escapeHtml(body.estimate || "")]);
  } else {
    rows.push(["Interested in", escapeHtml(body.interest || "")]);
    rows.push(["Message", escapeHtml(body.message || "").replace(/\n/g, "<br>")]);
  }

  const htmlRows = rows
    .map(([label, value]) => `<tr><td style="padding:6px 12px;color:#4B5563;font-family:sans-serif;font-size:13px;">${label}</td><td style="padding:6px 12px;font-family:sans-serif;font-size:14px;">${value || "—"}</td></tr>`)
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:520px;">
      <h2 style="font-family:sans-serif;">${formType}</h2>
      <p style="color:#4B5563;">New submission from homeswithghamlouche.com</p>
      <table style="border-collapse:collapse;width:100%;">${htmlRows}</table>
    </div>
  `;

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set — see README.md setup steps.");
    return res.status(500).json({ ok: false, error: "Email service is not configured yet." });
  }

  try {
    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [TO_ADDRESS],
        reply_to: email,
        subject: `${formType} — ${name}`,
        html,
      }),
    });

    if (!resendResp.ok) {
      const errText = await resendResp.text();
      console.error("Resend error:", errText);
      return res.status(502).json({ ok: false, error: "Email failed to send." });
    }
  } catch (err) {
    console.error("Email send exception:", err);
    return res.status(502).json({ ok: false, error: "Email failed to send." });
  }

  // -------------------------------------------------------------
  // OPTIONAL: push the same lead into a CRM (HubSpot / Follow Up Boss).
  // Once you share which CRM + API key, this becomes a second
  // fetch() call right here, e.g. for HubSpot Forms API:
  //
  // await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/PORTAL_ID/FORM_GUID`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     fields: [
  //       { name: "email", value: email },
  //       { name: "firstname", value: name },
  //       { name: "phone", value: phone },
  //     ],
  //   }),
  // });
  //
  // Wrap it in its own try/catch so a CRM hiccup never blocks the
  // email from sending.
  // -------------------------------------------------------------

  return res.status(200).json({ ok: true });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
