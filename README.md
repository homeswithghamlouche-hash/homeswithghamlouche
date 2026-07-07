# homeswithghamlouche — Website + Lead Backend

This is a static website (plain HTML/CSS/JS) plus one serverless
function (`api/lead.js`) that emails form submissions to
homeswithghamlouche@gmail.com. Built for **Vercel**.

## What's in here

```
website/
  index.html, valuation.html, listings.html,
  neighborhoods.html, about.html, contact.html
  assets/style.css
  assets/script.js
  api/lead.js          <- serverless function, handles form emails
  package.json
```

## 1. Get a Resend account (free) — this sends the emails

1. Go to https://resend.com and sign up (free tier: 100 emails/day, 3,000/month — plenty for lead forms).
2. In the Resend dashboard, go to **API Keys** → create one → copy it.
3. That's it for now. Emails will send from Resend's shared test
   address (`onboarding@resend.dev`), which works immediately with
   no extra setup — good enough to launch on. When you're ready,
   come back and verify your own domain in Resend (takes ~10
   minutes, just adding DNS records) so emails come from
   `@homeswithghamlouche.com` instead — I can help with that step
   when you have a domain.

## 2. Push this to GitHub

If you don't already have a GitHub account, make one (free) at
github.com, then create a new repository and upload this `website`
folder's contents to it (GitHub's "upload files" button in the
browser works fine — no command line needed).

## 3. Deploy on Vercel

1. Go to https://vercel.com and sign up with your GitHub account.
2. Click **Add New → Project**, select the repo you just created.
3. Vercel will auto-detect the `api/` folder as serverless
   functions and the rest as static files — no build settings to
   change. Click **Deploy**.
4. Before or after deploying, go to **Project → Settings →
   Environment Variables** and add:
   - `RESEND_API_KEY` = *(the key you copied from Resend)*
5. Redeploy if you added the environment variable after the first
   deploy (Vercel → Deployments → ⋯ → Redeploy).

Your site will be live at something like
`homeswithghamlouche.vercel.app`. From there you can connect a
custom domain (e.g. `homeswithghamlouche.com`) under **Project →
Settings → Domains** — you'll need to buy the domain somewhere
like Namecheap or Google Domains first, then point it at Vercel.

## 4. Test it

Once deployed, submit the contact form and the valuation form on
the live site. Both should land in homeswithghamlouche@gmail.com
within a few seconds. Check your spam folder the first time.

## Adding your CRM later

You mentioned you already have a CRM (HubSpot or Follow Up Boss).
Whenever you're ready, send me:
- which CRM, and
- an API key or form endpoint from that CRM

and I'll add a second step inside `api/lead.js` that pushes the
same lead into your CRM automatically, right alongside the email —
there's already a marked spot in that file for it, so it's a small
follow-up, not a rebuild.

## Notes

- The listing search and home valuation tool still run on sample
  data, not a live MLS feed — that requires broker-level IDX
  access (MLSGrid/ListHub), which is a separate step through Pro
  Realty Group.
- There's a hidden "honeypot" field on both forms to filter out
  basic spam bots — don't remove it.
