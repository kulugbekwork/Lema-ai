# SMTP Provider Comparison for Supabase

## Recommended Providers

### 1. **Mailgun** ⭐ (Best Free Tier)
- **Free Tier**: 5,000 emails/month (3 months), then 1,000/month
- **Best For**: Production apps with moderate email volume
- **Setup Time**: ~10 minutes
- **SMTP Settings**:
  - Host: `smtp.mailgun.org`
  - Port: `587` (TLS) or `465` (SSL)
  - Username: `postmaster@your-domain.mailgun.org`
  - Password: Your Mailgun SMTP password

### 2. **Brevo (Sendinblue)** ⭐ (Easiest Setup)
- **Free Tier**: 300 emails/day
- **Best For**: Small to medium apps
- **Setup Time**: ~5 minutes
- **SMTP Settings**:
  - Host: `smtp-relay.brevo.com`
  - Port: `587`
  - Username: Your SMTP login
  - Password: Your SMTP key

### 3. **AWS SES** (Most Scalable)
- **Free Tier**: 62,000 emails/month (if on EC2)
- **Best For**: Large scale applications
- **Setup Time**: ~15 minutes
- **SMTP Settings**:
  - Host: `email-smtp.us-east-1.amazonaws.com` (or your region)
  - Port: `587`
  - Username: Your SMTP username
  - Password: Your SMTP password

### 4. **Resend** (Modern & Developer-Friendly)
- **Free Tier**: 3,000 emails/month
- **Best For**: Modern apps, great API
- **Setup Time**: ~5 minutes
- **SMTP Settings**:
  - Host: `smtp.resend.com`
  - Port: `587`
  - Username: `resend`
  - Password: Your API key

### 5. **Mailjet**
- **Free Tier**: 6,000 emails/month
- **Best For**: Marketing + transactional emails
- **Setup Time**: ~10 minutes
- **SMTP Settings**:
  - Host: `in-v3.mailjet.com`
  - Port: `587`
  - Username: Your API key
  - Password: Your secret key

### 6. **Postmark**
- **Free Tier**: 100 emails/month
- **Best For**: Small apps, excellent deliverability
- **Setup Time**: ~10 minutes
- **SMTP Settings**:
  - Host: `smtp.postmarkapp.com`
  - Port: `587`
  - Username: Your server API token
  - Password: Your server API token

## How to Configure in Supabase

1. Go to **Supabase Dashboard** → **Settings** → **Auth** → **SMTP Settings**
2. Enable **"Enable Custom SMTP"**
3. Enter the SMTP credentials from your chosen provider
4. Set **Sender Email** to your verified email address
5. Set **Sender Name** to "Lema AI" (or your app name)
6. Click **"Save"**
7. Test by triggering a password reset

## Quick Setup Links

- **Mailgun**: https://www.mailgun.com
- **Brevo**: https://www.brevo.com
- **AWS SES**: https://aws.amazon.com/ses/
- **Resend**: https://resend.com
- **Mailjet**: https://www.mailjet.com
- **Postmark**: https://postmarkapp.com

## Recommendation

For your use case (password reset emails), I recommend:
- **Mailgun** if you want the best free tier
- **Brevo** if you want the easiest setup
- **Resend** if you want a modern developer experience
