import { Request, Response, NextFunction } from 'express';
import { storage } from '../stripe/storage';
import { SUBSCRIPTION_TIERS } from '../config/subscription';

export async function requirePro(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await storage.getUser(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.subscriptionTier !== SUBSCRIPTION_TIERS.PRO) {
      return res.status(403).json({ 
        error: 'Pro subscription required',
        upgradeRequired: true,
        currentTier: user.subscriptionTier || SUBSCRIPTION_TIERS.FREE
      });
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Failed to check subscription status' });
  }
}

export async function attachSubscriptionInfo(req: Request, _res: Response, next: NextFunction) {
  try {
    if (req.user) {
      const user = await storage.getUser(req.user.id);
      if (user) {
        (req as any).subscriptionTier = user.subscriptionTier || SUBSCRIPTION_TIERS.FREE;
      }
    }
    next();
  } catch (error) {
    console.error('Error attaching subscription info:', error);
    next();
  }
}
