# reCAPTCHA Setup Guide

This project uses Google reCAPTCHA v2 for contact form protection with **server-side verification** for enhanced security.

## Architecture

### Client-Side (Browser)
- reCAPTCHA widget displays the "I'm not a robot" checkbox
- User completes the CAPTCHA challenge
- Client receives a temporary token (valid for 2 minutes)
- Token is sent to our API route (NOT directly to Formspree)

### Server-Side (Next.js API Route)
- API route receives form data + reCAPTCHA token
- Server verifies token with Google's reCAPTCHA API using the **secret key**
- Only if verification passes, the message is forwarded to Formspree
- Prevents bots from bypassing CAPTCHA by directly calling Formspree

## Security Benefits

1. **Secret Key Never Exposed**: The `RECAPTCHA_SECRET_KEY` stays on the server and is never sent to the client
2. **Server-Side Verification**: Bots cannot bypass the CAPTCHA by manipulating client-side code
3. **Token Validation**: Each token is verified with Google before accepting the form submission
4. **Single Use Tokens**: reCAPTCHA tokens can only be used once

## Environment Variables

### Required Variables

Add these to your `.env.local` file:

```bash
# Public key - safe to expose in client-side code
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key-here

# Private key - NEVER expose to client, used only on server
RECAPTCHA_SECRET_KEY=your-secret-key-here
```

### Getting Your Keys

1. Visit [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click **"Register a new site"** or select your existing site
3. Configure:
   - **Label**: Your site name (e.g., "Emcogma Contact Form")
   - **reCAPTCHA type**: Select **"reCAPTCHA v2"** → **"I'm not a robot" Checkbox**
   - **Domains**: Add your domains
     - For development: `localhost`
     - For production: `emcogma.com`, `www.emcogma.com`
4. Accept Terms of Service
5. Click **Submit**
6. Copy both keys:
   - **Site Key** → `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
   - **Secret Key** → `RECAPTCHA_SECRET_KEY`

## Current Setup

### Your Keys

⚠️ **SECURITY NOTE**: Never commit actual keys to version control. Use environment variables.

```bash
# Add your actual keys to .env.local (gitignored)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-actual-site-key-here
RECAPTCHA_SECRET_KEY=your-actual-secret-key-here
```

## Files Involved

### 1. Environment Configuration
- `.env.local` - Local development keys (gitignored)
- `.env.example` - Template for other developers

### 2. Components
- `components/contact/ReCaptchaWrapper.tsx` - Client-side reCAPTCHA widget
- `components/contact/ContactForm.tsx` - Contact form with API integration

### 3. API Route
- `app/api/contact/route.ts` - Server-side verification and Formspree submission

## How It Works

### Step-by-Step Flow

1. **User fills form** on `/contact` page
2. **User completes reCAPTCHA** challenge
3. **Client receives token** from Google
4. **Form submits** to `/api/contact` with:
   - Name, email, message
   - reCAPTCHA token
5. **Server verifies token** with Google's API:
   ```
   POST https://www.google.com/recaptcha/api/siteverify
   Body: secret=YOUR_SECRET&response=USER_TOKEN
   ```
6. **If verification passes**:
   - Server forwards message to Formspree
   - User sees success message
7. **If verification fails**:
   - User sees error message
   - Form is not submitted

## Testing

### Test Keys (Auto-Pass)

For development, you can use Google's official test keys that automatically pass verification.

**Note**: Google provides official test keys in their documentation at [https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do](https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do)

These test keys always pass. Use your real keys for production.

## Deployment to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add both variables:
   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` → Your site key
   - `RECAPTCHA_SECRET_KEY` → Your secret key
4. Redeploy your application

## Troubleshooting

### reCAPTCHA not showing

**Check**:
- Is `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` set in `.env.local`?
- Did you restart the dev server after adding env vars?
- Check browser console for errors

### "reCAPTCHA verification failed" error

**Possible causes**:
- `RECAPTCHA_SECRET_KEY` not set on server
- Keys don't match the site domain
- Token expired (tokens are valid for 2 minutes)
- Network issue connecting to Google's API

**Fix**:
- Verify both keys are correct
- Add your domain to reCAPTCHA admin console
- Try completing the CAPTCHA again
- Check server logs for specific error codes

### Domain not authorized

**Error**: `"invalid-input-response"` or domain mismatch

**Fix**:
1. Go to [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Select your site
3. Add your domain to the **Domains** list
4. For development, add `localhost`

## Security Best Practices

1. ✅ **Never commit** `.env.local` to git
2. ✅ **Never expose** `RECAPTCHA_SECRET_KEY` in client-side code
3. ✅ **Always verify** tokens on the server, not client
4. ✅ **Use HTTPS** in production
5. ✅ **Rotate keys** if compromised

## API Endpoint

### POST /api/contact

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I'd like to get in touch!",
  "recaptchaToken": "03AGdBq25..."
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Message sent successfully!"
}
```

**Error Response** (400/500):
```json
{
  "error": "reCAPTCHA verification failed",
  "details": ["invalid-input-response"]
}
```

## Additional Resources

- [reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/display)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [Formspree Documentation](https://help.formspree.io/)

## Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify environment variables are set correctly
3. Test with Google's test keys first
4. Check reCAPTCHA domain configuration
