# Stripe Subscription Setup Guide

## Overview

Twinpe akin now has a two-tier subscription system:
- **Free**: Basic MBTI type codes only (e.g., "ISFP", "INFP")
- **Pro** ($10.99/month): Full Myers-Briggs insights, personality labels, and archetype information

## Setup Steps

### 1. Create Stripe Product (via Stripe Dashboard)

1. Go to your Stripe Dashboard
2. Navigate to **Products** → **Add Product**
3. Fill in product details:
   - **Name**: Twinpeakin Pro
   - **Description**: Unlock full Myers-Briggs personality insights and detailed MBTI archetype information
   - **Pricing**: Recurring
   - **Price**: $10.99 USD
   - **Billing period**: Monthly

4. Save the product

### 2. Get the Price ID

After creating the product:
1. Click on the product you just created
2. Find the **Price ID** (starts with `price_`)
3. Copy this ID

### 3. Add Price ID to Replit Secrets

1. In your Replit project, go to **Tools** → **Secrets**
2. Add a new secret:
   - **Key**: `STRIPE_PRO_PRICE_ID`
   - **Value**: Paste the price ID from step 2

### 4. Verify Stripe Connection

The Stripe integration is already set up via Replit Connectors. The connection automatically provides:
- `STRIPE_SECRET_KEY` (from connector)
- `STRIPE_PUBLISHABLE_KEY` (from connector)
- `STRIPE_WEBHOOK_SECRET` (from connector)

### 5. Test the Subscription Flow

1. Restart your application
2. Log in to Twinpeakin
3. Complete onboarding (free users will only see MBTI codes)
4. Go to Settings or Profile
5. Click "Upgrade to Pro"
6. Complete Stripe checkout
7. Verify full MBTI insights are now visible

## Feature Gating

### Free Tier Limits:
- ✓ Basic dual-mode AI chat
- ✓ MBTI type codes only (e.g., "ISFP")
- ✗ No personality labels
- ✗ No archetype information
- ✗ No detailed insights

### Pro Tier Benefits:
- ✓ Unlimited dual-mode AI chat
- ✓ Full MBTI type codes
- ✓ Personality labels (e.g., "ISFP (The Adventurer)")
- ✓ Detailed archetype information
- ✓ Complete personality insights
- ✓ Priority support

## Backend Implementation

### Database Schema
- `users.subscriptionTier`: 'free' or 'pro'
- `users.stripeCustomerId`: Stripe customer ID
- `users.stripeSubscriptionId`: Active subscription ID

### API Endpoints
- `GET /api/subscription/status` - Get current subscription status
- `POST /api/subscription/checkout` - Create Stripe checkout session
- `POST /api/subscription/portal` - Open Stripe customer portal
- `POST /api/stripe/webhook` - Handle Stripe webhook events

### Feature Gating
The profile endpoint (`GET /api/profile`) automatically filters data based on subscription tier:
- Free users receive only `coreMbti` and `fieldMbti` fields
- Pro users receive full profile with labels and archetype data

## Troubleshooting

### "Pro price not configured" error
- Ensure `STRIPE_PRO_PRICE_ID` is set in Replit Secrets
- Restart the application after adding the secret

### Webhook events not processing
- Verify Stripe webhook endpoint is registered: `https://your-domain.com/api/stripe/webhook`
- Check that webhook signature verification is passing
- Review Stripe webhook logs in dashboard

### Subscription not activating
- Check Stripe dashboard for subscription status
- Verify webhook events are being received
- Check server logs for errors during webhook processing

## Next Steps

1. Create the Stripe product as described above
2. Add the price ID to secrets
3. Test the checkout flow with Stripe test cards
4. Deploy to production and switch to live Stripe keys
