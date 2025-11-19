import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../stripe/storage";
import { stripeService } from "../stripe/stripeService";
import { getSubscriptionFeatures } from "../config/subscriptionTiers";

const router = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}

router.get("/status", requireAuth, async (req, res) => {
  try {
    const user = await storage.getUser(req.user!.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const tier = (user.subscriptionTier as "free" | "pro") || "free";
    const features = getSubscriptionFeatures(tier);

    let subscription = null;
    if (user.stripeSubscriptionId) {
      subscription = await storage.getSubscription(user.stripeSubscriptionId);
    }

    res.json({
      tier,
      features,
      subscription,
      stripeCustomerId: user.stripeCustomerId,
    });
  } catch (error) {
    console.error("Subscription status error:", error);
    res.status(500).json({ error: "Failed to fetch subscription status" });
  }
});

router.post("/checkout", requireAuth, async (req, res) => {
  try {
    const user = await storage.getUser(req.user!.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeService.createCustomer(
        user.username,
        user.id
      );
      await storage.updateUserStripeInfo(user.id, { 
        stripeCustomerId: customer.id 
      });
      customerId = customer.id;
    }

    const priceId = req.body.priceId;
    if (!priceId) {
      return res.status(400).json({ error: "Price ID is required" });
    }

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const baseUrl = `${protocol}://${host}`;

    const session = await stripeService.createCheckoutSession(
      customerId,
      priceId,
      `${baseUrl}/checkout/success`,
      `${baseUrl}/checkout/cancel`
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.post("/portal", requireAuth, async (req, res) => {
  try {
    const user = await storage.getUser(req.user!.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({ 
        error: "No customer ID found. Please subscribe first." 
      });
    }

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const baseUrl = `${protocol}://${host}`;

    const session = await stripeService.createCustomerPortalSession(
      user.stripeCustomerId,
      `${baseUrl}/settings`
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error("Customer portal error:", error);
    res.status(500).json({ error: "Failed to create portal session" });
  }
});

export default router;
