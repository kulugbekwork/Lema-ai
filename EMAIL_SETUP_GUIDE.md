# Email Setup Guide for Forgot Password

This guide will help you configure email sending for the forgot password functionality in your Lema AI application.

## ✅ Code is Already Set Up

The forgot password functionality is already implemented in your codebase:
- `src/pages/ForgotPasswordPage.tsx` - UI for forgot password
- `src/contexts/AuthContext.tsx` - `resetPassword` function
- `src/App.tsx` - Routing for forgot password page

## 📧 Option 1: Use Supabase Default Email (Quick Setup)

### Step 1: Configure Site URL and Redirect URLs

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://linkexp.xyz`
3. Add to **Redirect URLs**:
   - `https://linkexp.xyz`
   - `https://linkexp.xyz/**`
   - `http://localhost:5173` (for local development)
   - `http://localhost:5173/**`

### Step 2: Enable Email Templates

1. Go to **Authentication** → **Email Templates**
2. Find **"Reset Password"** template
3. Make sure it's **enabled**
4. Optionally customize the email template

### Step 3: Authorize Email Addresses (IMPORTANT)

⚠️ **Supabase default email only sends to authorized addresses!**

1. Go to **Authentication** → **Email Templates**
2. Look for **"Authorized Email Recipients"** or **"Email Auth Settings"**
3. Add email addresses that should receive password reset emails:
   - Your test email
   - Any emails you want to test with

**Note**: For production, you'll need to authorize each user's email, OR use a custom SMTP provider (Option 2).

### Step 4: Test

1. Go to your app's forgot password page
2. Enter an authorized email address
3. Check your inbox (and spam folder)
4. Check **Authentication** → **Logs** in Supabase for any errors

---

## 🚀 Option 2: Use Custom SMTP Provider (Recommended for Production)

### Quick Setup with Brevo (Easiest)

#### Step 1: Create Brevo Account

1. Go to https://www.brevo.com
2. Sign up for a free account (300 emails/day free)
3. Verify your email address

#### Step 2: Get SMTP Credentials

1. Log in to Brevo dashboard
2. Go to **Settings** → **SMTP & API** → **SMTP**
3. Note down:
   - **SMTP Server**: `smtp-relay.brevo.com`
   - **Port**: `587`
   - **Login**: Your SMTP login (shown in dashboard)
   - **Password**: Your SMTP key (shown in dashboard)

#### Step 3: Configure in Supabase

1. Go to **Supabase Dashboard** → **Settings** → **Auth** → **SMTP Settings**
2. Enable **"Enable Custom SMTP"**
3. Fill in the form:
   - **SMTP Host**: `smtp-relay.brevo.com`
   - **SMTP Port**: `587`
   - **SMTP Username**: Your Brevo SMTP login
   - **SMTP Password**: Your Brevo SMTP key
   - **Sender Email**: Your verified email in Brevo
   - **Sender Name**: `Lema AI`
4. Click **"Save"**

#### Step 4: Configure Redirect URLs (Same as Option 1)

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://linkexp.xyz`
3. Add **Redirect URLs** as listed in Option 1

#### Step 5: Test

1. Try forgot password flow
2. Check email inbox
3. Check Supabase logs if emails don't arrive

---

## 🔍 Troubleshooting

### Emails Not Arriving?

1. **Check Supabase Logs**:
   - Go to **Authentication** → **Logs**
   - Look for errors when password reset is triggered

2. **Check Browser Console**:
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for any errors when clicking "Reset password"

3. **Check Spam Folder**:
   - Password reset emails often go to spam initially

4. **Verify Configuration**:
   - Site URL is set correctly
   - Redirect URLs include your domain
   - Email template is enabled
   - If using custom SMTP, credentials are correct

5. **Common Issues**:
   - **"Email not authorized"**: Add email to authorized recipients (Option 1) or use custom SMTP (Option 2)
   - **"Invalid redirect URL"**: Add your domain to Redirect URLs
   - **"SMTP error"**: Check SMTP credentials are correct

---

## 📝 Testing Checklist

- [ ] Site URL configured in Supabase
- [ ] Redirect URLs added
- [ ] Email template enabled
- [ ] Email addresses authorized (if using default email)
- [ ] SMTP configured (if using custom provider)
- [ ] Test forgot password flow
- [ ] Check email inbox
- [ ] Check spam folder
- [ ] Verify reset link works

---

## 🎯 Recommendation

- **For Development/Testing**: Use Option 1 (Supabase default email) - authorize your test emails
- **For Production**: Use Option 2 (Custom SMTP provider) - better deliverability and no authorization needed

---

## 📚 Additional Resources

- [Supabase Email Auth Docs](https://supabase.com/docs/guides/auth/auth-email)
- [Supabase SMTP Setup](https://supabase.com/docs/guides/auth/auth-smtp)
- See `SMTP_PROVIDERS.md` for other provider options
