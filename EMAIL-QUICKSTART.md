# Email Notifications Quick Start

## 🚀 5-Minute Setup

### 1. Sign Up for Resend (2 minutes)

1. Visit [https://resend.com](https://resend.com)
2. Create free account (100 emails/day)
3. Add domain: `emcogma.com`
4. Add these DNS records to your domain registrar:

```
Type: TXT
Name: @
Value: [provided by Resend]

Type: MX
Name: @
Value: [provided by Resend]

Type: TXT (DKIM)
Name: resend._domainkey
Value: [provided by Resend]
```

5. Wait for verification (usually < 5 minutes)

### 2. Get API Key (1 minute)

1. Resend Dashboard → "API Keys"
2. Click "Create API Key"
3. Name: "Production"
4. Copy the key (starts with `re_`)

### 3. Configure Environment (1 minute)

Add to `.env.local`:

```bash
# Email Notifications (Resend API - Optional but recommended)
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@emcogma.com
# Generate secret with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
UNSUBSCRIBE_TOKEN_SECRET=your_long_random_secret_here
```

Generate secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Deploy to Production (1 minute)

Add environment variables in Vercel:

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all 3 variables from step 3
3. Redeploy your application

### 5. Test (30 seconds)

Start your development server and test the email system:

```bash
npm run dev
```

Then:
1. Navigate to `/admin` and log in
2. Publish test content (blog post, article, etc.)
3. Click "Notify Subscribers" button
4. Check subscriber inboxes for email

Or test via API:
```bash
# Note: Requires admin authentication cookie
curl -X POST http://localhost:3000/api/notify-subscribers \
  -H "Content-Type: application/json" \
  -H "Cookie: your-admin-session-cookie" \
  -d '{
    "contentType": "blog_posts",
    "slug": "test",
    "title": "Test Post",
    "excerpt": "Testing email notifications"
  }'
```

## ✅ You're Done!

Now when you publish content:
1. Go to `/admin`
2. Publish a blog/article/product/demo
3. Click "📧 Notify Subscribers"
4. All subscribers get email with secure unsubscribe link

## 📧 What Your Subscribers Get

### Welcome Email (on subscribe)
![Welcome Email](https://via.placeholder.com/600x400?text=Welcome+Email)

### New Content Email
![Content Email](https://via.placeholder.com/600x400?text=Content+Email)

### Unsubscribe Page
![Unsubscribe](https://via.placeholder.com/600x400?text=Unsubscribe+Page)

## 🔒 Security Features (Already Configured)

✅ Email addresses NEVER in URLs
✅ Secure HMAC tokens for unsubscribe
✅ 90-day token expiration
✅ Rate limiting (100ms between emails)
✅ No PII in logs
✅ HTTPS encryption
✅ GDPR compliant

## 📊 Monitor Performance

Resend Dashboard → "Logs"

Track:
- Delivery rate
- Open rate
- Click rate
- Bounces

## 🆘 Troubleshooting

**Emails not sending?**
- Check Resend domain verification
- Verify `RESEND_API_KEY` is set
- Check `FROM_EMAIL` matches verified domain

**Unsubscribe not working?**
- Verify `UNSUBSCRIBE_TOKEN_SECRET` is set (32+ chars)
- Check `NEXT_PUBLIC_SITE_URL` is correct

## 📖 Full Documentation

- [Setup Guide](EMAIL-NOTIFICATIONS-SETUP.md) - Complete configuration
- [Security Summary](EMAIL-SECURITY-SUMMARY.md) - Security architecture
- [Resend Docs](https://resend.com/docs) - API documentation

## 💰 Pricing

**Free Tier**: 100 emails/day
**Paid**: $20/month for 50,000 emails
**Enterprise**: Custom pricing for >50k/month

Upgrade when you need more: [Resend Pricing](https://resend.com/pricing)

---

**Need Help?** Check [EMAIL-NOTIFICATIONS-SETUP.md](EMAIL-NOTIFICATIONS-SETUP.md) for detailed instructions.
