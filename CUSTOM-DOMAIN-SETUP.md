# Custom Domain Setup: emcogma.ai

Step-by-step guide to connect your **emcogma.ai** domain to Vercel hosting.

---

## Prerequisites

- ✅ Domain purchased: **emcogma.ai**
- ✅ Vercel project deployed (see [VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md))
- ✅ Access to your domain registrar's DNS settings

---

## Where Did You Buy emcogma.ai?

First, identify your domain registrar (where you purchased the domain). Common registrars:

- **Namecheap** ([namecheap.com](https://namecheap.com))
- **GoDaddy** ([godaddy.com](https://godaddy.com))
- **Google Domains** (now **Squarespace Domains**)
- **Cloudflare Registrar** ([cloudflare.com](https://cloudflare.com))
- **Porkbun** ([porkbun.com](https://porkbun.com))
- **Name.com** ([name.com](https://name.com))

**Find your registrar:**
1. Go to [whois.domaintools.com](https://whois.domaintools.com)
2. Enter: `emcogma.ai`
3. Look for **"Registrar"** field

---

## Step 1: Add Domain to Vercel (5 minutes)

### 1.1 Navigate to Domains

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project (e.g., `EmcogmaWebsite`)
3. Click **"Settings"** → **"Domains"**

### 1.2 Add Root Domain

1. Click **"Add Domain"**
2. Enter: `emcogma.ai`
3. Click **"Add"**

Vercel will show you one of these options:

#### Option A: Domain Not Found (Most Common)
```
⚠️ Invalid Configuration
Add the following DNS records to your domain registrar:

Type: A
Name: @
Value: 76.76.21.21
```

**Action:** Continue to Step 2 to add DNS records.

#### Option B: Domain Found (If You Already Have DNS Records)
```
✅ Valid Configuration
Your domain is already pointing to Vercel.
```

**Action:** Skip to Step 3.

### 1.3 Add www Subdomain (Recommended)

1. Click **"Add Domain"** again
2. Enter: `www.emcogma.ai`
3. Click **"Add"**

Vercel will show:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Why add www?**
- Users often type `www.emcogma.ai`
- Vercel will automatically redirect `www` → `emcogma.ai`
- Better SEO and user experience

---

## Step 2: Configure DNS Records

Now you need to update DNS records at your domain registrar.

### 2.1 Find Your Registrar's DNS Settings

**Namecheap:**
1. Log in to [namecheap.com](https://namecheap.com)
2. Go to **"Domain List"**
3. Click **"Manage"** next to `emcogma.ai`
4. Click **"Advanced DNS"** tab

**GoDaddy:**
1. Log in to [godaddy.com](https://godaddy.com)
2. Go to **"My Products"** → **"Domains"**
3. Click **"DNS"** next to `emcogma.ai`
4. Scroll to **"Records"**

**Cloudflare:**
1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Select `emcogma.ai`
3. Click **"DNS"** → **"Records"**

**Google Domains / Squarespace:**
1. Log in to [domains.squarespace.com](https://domains.squarespace.com)
2. Click on `emcogma.ai`
3. Go to **"DNS"** → **"Custom records"**

**Porkbun:**
1. Log in to [porkbun.com](https://porkbun.com)
2. Go to **"Account"** → **"Domain Management"**
3. Click **"DNS"** next to `emcogma.ai`

### 2.2 Add DNS Records

**⚠️ Important:** Delete any existing A or CNAME records for `@` and `www` first.

#### Record 1: Root Domain (A Record)

Add this A record:

```
Type: A
Name: @ (or leave blank, or "emcogma.ai")
Value: 76.76.21.21
TTL: Automatic (or 3600)
```

**Registrar-Specific Notes:**

- **Namecheap**: Name = `@`, Value = `76.76.21.21`
- **GoDaddy**: Name = `@`, Points to = `76.76.21.21`
- **Cloudflare**: Name = `@`, IPv4 address = `76.76.21.21`, Proxy status = DNS only (gray cloud)
- **Squarespace**: Host = `@`, Data = `76.76.21.21`
- **Porkbun**: Host = `(blank)`, Answer = `76.76.21.21`

#### Record 2: www Subdomain (CNAME Record)

Add this CNAME record:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Automatic (or 3600)
```

**Registrar-Specific Notes:**

- **Namecheap**: Name = `www`, Value = `cname.vercel-dns.com`
- **GoDaddy**: Name = `www`, Points to = `cname.vercel-dns.com`
- **Cloudflare**: Name = `www`, Target = `cname.vercel-dns.com`, Proxy status = DNS only (gray cloud)
- **Squarespace**: Host = `www`, Data = `cname.vercel-dns.com`
- **Porkbun**: Host = `www`, Answer = `cname.vercel-dns.com`

### 2.3 Save Changes

1. Click **"Save"** or **"Add Record"**
2. Wait for confirmation message

**⏱️ DNS Propagation Time:** 5 minutes to 48 hours (usually 10-30 minutes)

---

## Step 3: Verify Domain in Vercel

### 3.1 Check DNS Propagation

Wait 10-30 minutes, then check if DNS has propagated:

1. Go to [dnschecker.org](https://dnschecker.org)
2. Enter: `emcogma.ai`
3. Select: **"A"** record type
4. Click **"Search"**

**You should see:**
```
✅ 76.76.21.21 (Vercel's IP)
```

If you see your old hosting provider's IP, wait longer (DNS hasn't propagated yet).

### 3.2 Verify in Vercel Dashboard

1. Go to **Vercel Dashboard** → **Settings** → **Domains**
2. Check status next to `emcogma.ai`:
   - ⏳ **"Pending"** = DNS not propagated yet (wait longer)
   - ✅ **"Valid Configuration"** = Domain connected successfully!
   - ❌ **"Invalid Configuration"** = DNS records incorrect (re-check Step 2)

### 3.3 Test Your Domain

Open your browser and visit:

1. **http://emcogma.ai** → Should redirect to **https://emcogma.ai** ✅
2. **https://emcogma.ai** → Should show your website with 🔒 padlock ✅
3. **https://www.emcogma.ai** → Should redirect to **https://emcogma.ai** ✅

**If you see:**
- ❌ **"This site can't be reached"** → DNS not propagated yet (wait longer)
- ❌ **"522 Connection Timed Out"** (Cloudflare) → Turn off Cloudflare proxy (gray cloud icon)
- ❌ **"Invalid Configuration"** → Re-check DNS records in Step 2

---

## Step 4: Set Primary Domain

Once verified, set `emcogma.ai` as your primary domain:

1. Go to **Vercel Dashboard** → **Settings** → **Domains**
2. Find `emcogma.ai` in the list
3. Click the three dots (⋯) → **"Set as Primary Domain"**
4. Confirm

**What this does:**
- All Vercel preview URLs redirect to `emcogma.ai`
- `www.emcogma.ai` automatically redirects to `emcogma.ai`
- Open Graph metadata uses `emcogma.ai` in social shares

---

## Step 5: Update Environment Variables

Update your Vercel environment variable to reflect the new domain:

1. Go to **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_SITE_URL`
3. Click **"Edit"**
4. Change value to: `https://emcogma.ai`
5. Click **"Save"**
6. Go to **Deployments** tab → **"Redeploy"** latest deployment

**Why this matters:**
- Fixes CORS issues with API routes
- Updates canonical URLs for SEO
- Ensures correct Open Graph URLs for social sharing
- Fixes unsubscribe email links

---

## Step 6: Email Domain Configuration (Optional)

If you want to send emails from `noreply@emcogma.ai` (recommended for newsletter):

### 6.1 Verify Domain in Resend

1. Go to [resend.com/domains](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter: `emcogma.ai`
4. Resend will show DNS records (SPF, DKIM, DMARC)

### 6.2 Add Email DNS Records

Go back to your domain registrar's DNS settings and add these records:

#### SPF Record (Prevents Spam)
```
Type: TXT
Name: @ (or emcogma.ai)
Value: v=spf1 include:amazonses.com ~all
```

#### DKIM Record (Email Authentication)
```
Type: TXT
Name: resend._domainkey
Value: [Unique value provided by Resend - copy exactly]
```

Example DKIM value (yours will be different):
```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
```

#### DMARC Record (Email Policy - Optional but Recommended)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:emcogma@gmail.com
```

**What this does:**
- Tells email providers where to send DMARC reports
- `p=none` = Monitor only (no action taken on failed emails)
- Change `emcogma@gmail.com` to your admin email

### 6.3 Verify Email Domain

1. Wait 10-30 minutes for DNS propagation
2. Go to [resend.com/domains](https://resend.com/domains)
3. Click **"Verify"** next to `emcogma.ai`
4. You should see ✅ green checkmarks for SPF, DKIM, DMARC

### 6.4 Update Vercel Environment Variable

1. Go to **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Find `FROM_EMAIL`
3. Click **"Edit"**
4. Change value to: `noreply@emcogma.ai`
5. Click **"Save"**
6. Redeploy project

**✅ Now your emails will come from `noreply@emcogma.ai` instead of `noreply@resend.dev`**

---

## Step 7: SSL Certificate (Automatic)

Vercel automatically provisions SSL certificates for your domain.

### 7.1 Check SSL Status

1. Go to **Vercel Dashboard** → **Settings** → **Domains**
2. Check SSL status next to `emcogma.ai`:
   - ⏳ **"Provisioning"** = Certificate being issued (wait 5-10 minutes)
   - ✅ **"Valid"** = SSL certificate active (HTTPS working)

### 7.2 Force HTTPS

Vercel automatically redirects HTTP → HTTPS. Verify:

1. Visit: `http://emcogma.ai` (no 's')
2. Should redirect to: `https://emcogma.ai` (with 's' and 🔒 padlock)

**If HTTP doesn't redirect:**
1. Check **Project Settings** → **General**
2. Ensure **"Force HTTPS"** is enabled
3. Redeploy if needed

---

## Step 8: Post-Setup Verification

### 8.1 Test All URLs

Open these URLs in your browser and verify they work:

- [ ] `https://emcogma.ai` → Shows homepage ✅
- [ ] `http://emcogma.ai` → Redirects to HTTPS ✅
- [ ] `https://www.emcogma.ai` → Redirects to `emcogma.ai` ✅
- [ ] `https://emcogma.ai/blog` → Shows blog page ✅
- [ ] `https://emcogma.ai/portfolio` → Shows portfolio page ✅
- [ ] `https://emcogma.ai/contact` → Shows contact form ✅
- [ ] `https://emcogma.ai/admin` → Shows admin login ✅

### 8.2 Test SSL Certificate

1. Visit: `https://emcogma.ai`
2. Click the 🔒 padlock in browser address bar
3. Click **"Certificate"**
4. Verify:
   - Issued to: `emcogma.ai`
   - Issued by: `Let's Encrypt` or `Vercel`
   - Valid until: (future date, certificates auto-renew)

### 8.3 Test Social Sharing

1. Go to [opengraph.xyz](https://opengraph.xyz)
2. Enter: `https://emcogma.ai`
3. Verify:
   - Title: "EMCOGMA - Future-Focused Engineering"
   - Description: Your site description
   - Image: Your Open Graph image
   - URL: `https://emcogma.ai` (not Vercel preview URL)

### 8.4 Test Email Links

1. Subscribe to newsletter from homepage modal
2. Check email inbox for welcome email
3. Click **"Unsubscribe"** link
4. Verify URL is: `https://emcogma.ai/unsubscribe?token=...`
   - ✅ Should use `emcogma.ai` (not `vercel.app`)
   - ✅ Should have HTTPS with 🔒 padlock

---

## Troubleshooting

### Problem 1: "This site can't be reached" after 48 hours

**Cause:** DNS records incorrect or not saved

**Solution:**
1. Go to your domain registrar's DNS settings
2. Verify A record exists:
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`
3. Check for typos (common mistake: extra spaces in value)
4. Save changes and wait 30 minutes
5. Test with [dnschecker.org](https://dnschecker.org)

### Problem 2: Vercel shows "Invalid Configuration"

**Cause:** DNS records not pointing to Vercel

**Solution:**
1. Go to [dnschecker.org](https://dnschecker.org)
2. Enter: `emcogma.ai`
3. Check what IP address is returned
4. If it's not `76.76.21.21`, update your A record
5. Wait 30 minutes and re-check

### Problem 3: Cloudflare 522 Error

**Cause:** Cloudflare proxy enabled (orange cloud icon)

**Solution:**
1. Go to Cloudflare DNS settings
2. Find `emcogma.ai` A record
3. Click the **orange cloud icon** to turn it **gray** (DNS only)
4. Click the **orange cloud icon** next to `www` CNAME record to turn it **gray**
5. Wait 5 minutes and retry

**Note:** You can enable Cloudflare proxy later after Vercel connection is verified.

### Problem 4: www subdomain not redirecting

**Cause:** CNAME record for `www` not added

**Solution:**
1. Go to your domain registrar's DNS settings
2. Add CNAME record:
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`
3. Save and wait 30 minutes
4. Test: `https://www.emcogma.ai` (should redirect)

### Problem 5: Email links still use vercel.app domain

**Cause:** `NEXT_PUBLIC_SITE_URL` not updated

**Solution:**
1. Go to **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Edit `NEXT_PUBLIC_SITE_URL`
3. Change to: `https://emcogma.ai`
4. Save and redeploy project
5. Test by subscribing to newsletter (check unsubscribe link in email)

### Problem 6: SSL certificate not provisioning

**Cause:** DNS not fully propagated yet

**Solution:**
1. Wait 24 hours for full DNS propagation
2. Go to **Vercel Dashboard** → **Settings** → **Domains**
3. Click **"Refresh"** next to `emcogma.ai`
4. If still not working after 48 hours, contact Vercel support

### Problem 7: Old website still showing

**Cause:** Browser cache or DNS cache

**Solution:**
1. Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Clear browser cache: Settings → Privacy → Clear browsing data
3. Try incognito/private browsing mode
4. Test from different device/network

---

## Advanced: Using Cloudflare (Optional)

If you want to use Cloudflare for DNS and CDN:

### Benefits:
- ✅ Free CDN (faster page loads)
- ✅ DDoS protection
- ✅ Web Application Firewall (WAF)
- ✅ Analytics dashboard

### Setup:

1. **Add site to Cloudflare:**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Click **"Add a Site"**
   - Enter: `emcogma.ai`
   - Select **Free Plan**

2. **Update nameservers:**
   - Cloudflare will provide 2 nameservers (e.g., `anna.ns.cloudflare.com`)
   - Go to your domain registrar
   - Replace existing nameservers with Cloudflare's nameservers
   - Wait 24 hours for propagation

3. **Configure DNS in Cloudflare:**
   - Add A record: `@` → `76.76.21.21` (DNS only, gray cloud)
   - Add CNAME record: `www` → `cname.vercel-dns.com` (DNS only, gray cloud)
   - Add TXT records for email (SPF, DKIM, DMARC)

4. **Enable SSL/TLS:**
   - Go to **SSL/TLS** → **Overview**
   - Set mode to: **"Full (strict)"**

5. **Enable proxy (optional):**
   - After Vercel connection verified, turn A and CNAME records to **orange cloud**
   - This enables Cloudflare CDN and DDoS protection

**⚠️ Important:** Keep proxy disabled (gray cloud) until Vercel connection is verified.

---

## DNS Propagation Timeline

| Time | Status |
|------|--------|
| 0 minutes | DNS records updated in registrar |
| 5-10 minutes | Propagation starts (some regions see new IP) |
| 30 minutes | 50% of global DNS servers updated |
| 2 hours | 90% of global DNS servers updated |
| 24 hours | 99% of global DNS servers updated |
| 48 hours | 100% propagation complete |

**Check propagation status:** [dnschecker.org](https://dnschecker.org)

---

## Final Checklist

Before considering setup complete:

- [ ] **Domain resolves** - `emcogma.ai` shows your website
- [ ] **HTTPS enabled** - 🔒 padlock shows in browser
- [ ] **HTTP redirects** - `http://emcogma.ai` redirects to HTTPS
- [ ] **www redirects** - `www.emcogma.ai` redirects to root domain
- [ ] **Vercel shows "Valid"** - Green checkmark in dashboard
- [ ] **SSL certificate active** - Certificate details show in browser
- [ ] **Environment variable updated** - `NEXT_PUBLIC_SITE_URL` = `https://emcogma.ai`
- [ ] **Email domain verified** - Resend shows green checkmarks (if using email)
- [ ] **Social sharing works** - Open Graph preview shows correct domain
- [ ] **All pages accessible** - Homepage, blog, portfolio, contact, admin
- [ ] **Test from multiple devices** - Mobile, desktop, different networks

---

## Post-Setup: Update Hardcoded URLs

After domain is live, update these files to use `emcogma.ai`:

### 1. Sitemap Configuration

Update [next-sitemap.config.js](next-sitemap.config.js):

```javascript
module.exports = {
  siteUrl: 'https://emcogma.ai', // Update this line
  generateRobotsTxt: true,
  // ... rest of config
}
```

### 2. Social Media Profiles

Update your social media profiles with new URL:
- Twitter bio: `https://emcogma.ai`
- LinkedIn profile: `https://emcogma.ai`
- GitHub profile: `https://emcogma.ai`

### 3. README.md

Update [README.md](README.md):

```markdown
🔗 **Live Site:** [emcogma.ai](https://emcogma.ai)
```

### 4. Google Search Console (Optional)

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Click **"Add Property"**
3. Enter: `https://emcogma.ai`
4. Verify ownership (Vercel provides verification file)
5. Submit sitemap: `https://emcogma.ai/sitemap.xml`

### 5. reCAPTCHA Domains (Important!)

1. Go to [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
2. Select your reCAPTCHA site
3. Click **"Settings"**
4. Under **"Domains"**, add:
   - `emcogma.ai`
   - `www.emcogma.ai`
5. Click **"Save"**

**⚠️ Without this, reCAPTCHA will fail on contact form and comments!**

---

## Summary

**✅ What You Accomplished:**

1. Connected `emcogma.ai` to Vercel hosting
2. Configured DNS records (A and CNAME)
3. Enabled automatic SSL/HTTPS
4. Set up www → root domain redirect
5. Verified domain ownership
6. Updated environment variables
7. Configured email domain (optional)
8. Updated reCAPTCHA domains

**🎉 Your website is now live at: https://emcogma.ai**

---

**Need Help?**

- **DNS Issues**: [dnschecker.org](https://dnschecker.org)
- **SSL Issues**: [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Domain Registrar**: Contact your registrar's support team

**Last Updated:** December 2025
