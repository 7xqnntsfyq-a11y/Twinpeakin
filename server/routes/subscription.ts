import express from 'express';
import { storage } from '../stripe/storage';
import { stripeService } from '../stripe/stripeService';
import { SubscriptionTiers } from '../config/subscriptionTiers';

const router = express.Router();

router.get('/status', async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const tier = user.subscriptionTier || 'free';
    const features = SubscriptionTiers[tier as keyof typeof SubscriptionTiers]?.features || SubscriptionTiers.free.features;

    let subscription = null;
    if (user.stripeSubscriptionId) {
      subscription = await storage.getSubscription(user.stripeSubscriptionId);
    }

    res.json({
      tier,
      features,
      subscription,
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ error: "Failed to fetch subscription status" });
  }
});

router.post('/checkout', async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // SECURITY: Always use server-side Pro price ID - never trust client input
    const { StripeConfig } = await import('../config/stripe');
    const priceId = StripeConfig.products.pro.priceId;

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeService.createCustomer(user.username, user.id);
      await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customer.id });
      customerId = customer.id;
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const session = await stripeService.createCheckoutSession(
      customerId,
      priceId,
      `${baseUrl}/checkout/success`,
      `${baseUrl}/checkout/cancel`
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.post('/portal', async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: "No Stripe customer found" });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const session = await stripeService.createCustomerPortalSession(
      user.stripeCustomerId,
      `${baseUrl}/settings`
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: "Failed to create portal session" });
  }
});

export default router;
