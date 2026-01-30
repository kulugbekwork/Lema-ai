# Lemon Squeezy Setup Guide

This guide will help you set up Lemon Squeezy payment processing for premium subscriptions.

## Step 1: Create a Lemon Squeezy Account

1. Go to [https://www.lemonsqueezy.com](https://www.lemonsqueezy.com)
2. Sign up for an account
3. Complete the onboarding process

## Step 2: Create a Store

1. In your Lemon Squeezy dashboard, go to **Settings** → **Stores**
2. Create a new store or use an existing one
3. Note your **Store ID** (you'll need this later)

## Step 3: Create Products

1. Go to **Products** in your Lemon Squeezy dashboard
2. Create one product:
   - **Monthly Premium Plan** ($10/month)

3. For the product:
   - Set the price to $10/month
   - Choose "Subscription" as the product type
   - Set billing interval to Monthly
   - Note the **Product ID** (you'll need this later)

## Step 4: Configure Environment Variables

Add these to your `.env` file:

```env
VITE_LEMON_SQUEEZY_STORE_ID=your_store_id_here
VITE_LEMON_SQUEEZY_MONTHLY_PRODUCT_ID=your_monthly_product_id_here
```

## Step 5: Set Up Webhook Secret

1. In Lemon Squeezy dashboard, go to **Settings** → **Webhooks**
2. Click **Create Webhook**
3. Set the webhook URL to:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/lemon-squeezy-webhook
   ```
   Replace `YOUR_PROJECT_REF` with your Supabase project reference.

4. Select these events to listen for:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_payment_success`
   - `subscription_cancelled`

5. Copy the **Webhook Signing Secret** (you'll need this for the Edge Function)

## Step 6: Deploy the Webhook Handler

1. Set the webhook secret in Supabase:
   ```bash
   supabase secrets set LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here
   ```

2. Deploy the webhook function:
   ```bash
   supabase functions deploy lemon-squeezy-webhook
   ```

## Step 7: Test the Integration

1. Go to your Premium page in the app
2. Click "Upgrade to Premium"
3. Complete the checkout process in Lemon Squeezy
4. After payment, the webhook should automatically update the user's `is_premium` status

## How It Works

1. **User clicks upgrade button**: The Premium page redirects to Lemon Squeezy checkout with the user's email and user_id in custom data
2. **User completes payment**: Lemon Squeezy processes the payment
3. **Webhook is triggered**: Lemon Squeezy sends a webhook to your Edge Function
4. **Premium status updated**: The Edge Function updates the user's `is_premium` field in the `profiles` table

## Troubleshooting

### Webhook not receiving events
- Check that the webhook URL is correct in Lemon Squeezy settings
- Verify the function is deployed: `supabase functions list`
- Check Supabase Edge Function logs: `supabase functions logs lemon-squeezy-webhook`

### User not getting premium status
- Check the webhook payload in Supabase logs
- Verify `user_id` is being passed in the checkout URL's `checkout[custom][user_id]` parameter
- Check that the `profiles` table has the `is_premium` column (run migrations if needed)

### Payment succeeds but status doesn't update
- Check Supabase Edge Function logs for errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Supabase secrets
- Ensure the webhook is listening to the correct events

## Security Notes

- The webhook secret is optional but recommended for production
- Always use HTTPS for webhook URLs
- The Edge Function uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS and update user profiles
- Consider adding webhook signature verification for production use
