import { Request, Response, NextFunction } from "express";

export function requireProSubscription(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  const user = req.user as any;
  if (user.subscriptionTier !== "pro") {
    return res.status(403).json({ 
      error: "This feature requires Pro subscription",
      upgradeUrl: "/upgrade"
    });
  }
  next();
}
