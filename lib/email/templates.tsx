/**
 * SECURE EMAIL TEMPLATES
 *
 * All templates use subscriber ID for unsubscribe links, NEVER email addresses.
 * Email addresses are only used in the "To" field (handled by email service).
 */

interface EmailTemplateProps {
  title: string;
  excerpt: string;
  url: string;
  contentType: 'Blog Post' | 'Article' | 'Product' | 'Demo' | 'Project';
  unsubscribeUrl: string; // Contains secure token, no email
}

/**
 * Generate HTML email template for new content notifications
 */
export function generateContentNotificationEmail({
  title,
  excerpt,
  url,
  contentType,
  unsubscribeUrl,
}: EmailTemplateProps): { html: string; text: string; subject: string } {
  const subject = `New ${contentType}: ${title}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #0a0a0f;
      color: #e0e0e0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #00f0ff 0%, #ff00ff 100%);
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      color: #0a0a0f;
      font-size: 28px;
      font-weight: bold;
    }
    .content {
      background-color: #1a1a2e;
      padding: 40px 30px;
      border-radius: 0 0 8px 8px;
    }
    .badge {
      display: inline-block;
      background-color: #00ff41;
      color: #0a0a0f;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 20px;
      text-transform: uppercase;
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      color: #00f0ff;
      margin: 0 0 15px 0;
      line-height: 1.3;
    }
    .excerpt {
      font-size: 16px;
      line-height: 1.6;
      color: #b0b0b0;
      margin: 0 0 30px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #00ff41;
      color: #0a0a0f;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      font-size: 16px;
      margin: 10px 0;
    }
    .cta-button:hover {
      background-color: #00cc34;
    }
    .footer {
      text-align: center;
      padding: 30px 20px;
      color: #666;
      font-size: 13px;
    }
    .footer a {
      color: #00f0ff;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #00f0ff, transparent);
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>EMCOGMA</h1>
    </div>
    <div class="content">
      <div class="badge">${contentType}</div>
      <h2 class="title">${title}</h2>
      <p class="excerpt">${excerpt}</p>
      <a href="${url}" class="cta-button">Read More →</a>
      <div class="divider"></div>
      <p style="color: #888; font-size: 14px; margin: 0;">
        Thanks for subscribing to Emcogma updates! We only send notifications when new content is published.
      </p>
    </div>
    <div class="footer">
      <p>
        Don't want to receive these emails?<br>
        <a href="${unsubscribeUrl}">Unsubscribe from future updates</a>
      </p>
      <p style="margin-top: 20px; color: #444;">
        © ${new Date().getFullYear()} Emcogma. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
${contentType.toUpperCase()}: ${title}

${excerpt}

Read more: ${url}

---

Thanks for subscribing to Emcogma updates!

Don't want to receive these emails? Unsubscribe: ${unsubscribeUrl}

© ${new Date().getFullYear()} Emcogma. All rights reserved.
  `.trim();

  return { html, text, subject };
}

/**
 * Generate welcome email for new subscribers
 */
export function generateWelcomeEmail(unsubscribeUrl: string): {
  html: string;
  text: string;
  subject: string;
} {
  const subject = 'Welcome to Emcogma Updates!';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #0a0a0f;
      color: #e0e0e0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #00f0ff 0%, #ff00ff 100%);
      padding: 40px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      color: #0a0a0f;
      font-size: 32px;
      font-weight: bold;
    }
    .content {
      background-color: #1a1a2e;
      padding: 40px 30px;
      border-radius: 0 0 8px 8px;
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      color: #00ff41;
      margin: 0 0 20px 0;
    }
    .text {
      font-size: 16px;
      line-height: 1.6;
      color: #b0b0b0;
      margin: 0 0 20px 0;
    }
    .footer {
      text-align: center;
      padding: 30px 20px;
      color: #666;
      font-size: 13px;
    }
    .footer a {
      color: #00f0ff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome!</h1>
    </div>
    <div class="content">
      <h2 class="title">Thanks for subscribing!</h2>
      <p class="text">
        You're now subscribed to Emcogma updates. You'll receive notifications when new blog posts, articles, products, demos, and projects are published.
      </p>
      <p class="text">
        We respect your inbox and only send emails when there's something new worth sharing.
      </p>
      <p class="text" style="color: #888; font-size: 14px; margin-top: 30px;">
        Change your mind? You can <a href="${unsubscribeUrl}" style="color: #00f0ff;">unsubscribe</a> at any time.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Emcogma. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Welcome to Emcogma Updates!

Thanks for subscribing! You'll now receive notifications when new blog posts, articles, products, demos, and projects are published.

We respect your inbox and only send emails when there's something new worth sharing.

Change your mind? Unsubscribe: ${unsubscribeUrl}

© ${new Date().getFullYear()} Emcogma. All rights reserved.
  `.trim();

  return { html, text, subject };
}
