import express from "express";
import session from "express-session";
import passport from "./auth/passport-config";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import chatRoutes from "./routes/chat";
import conversationsRoutes from "./routes/conversations";
import preferencesRoutes from "./routes/preferences";
import analyticsRoutes from "./routes/analytics";
import subscriptionRoutes from "./routes/subscription";
import { TelemetryService } from "./services/telemetry";
import MemoryStore from "memorystore";
import { runMigrations, StripeSync } from 'stripe-replit-sync';
import { getStripeSecretKey, getStripeWebhookSecret, getUncachableStripeClient } from './stripe/stripeClient';
import { WebhookHandlers } from './stripe/webhookHandlers';
import { db } from './db';

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is required for Stripe integration. ' +
      'Please create a PostgreSQL database first.'
    );
  }

  try {
    console.log('Initializing Stripe schema...');
    await runMigrations({ 
      databaseUrl,
      schema: 'stripe'
    });
    console.log('Stripe schema ready');

    console.log('Syncing Stripe data...');
    const secretKey = await getStripeSecretKey();
    const webhookSecret = await getStripeWebhookSecret();
    
    const stripeSync = new StripeSync({
      poolConfig: {
        connectionString: databaseUrl,
        max: 10,
      },
      stripeSecretKey: secretKey,
      stripeWebhookSecret: webhookSecret,
    });
    await stripeSync.syncBackfill();
    console.log('Stripe data synced');
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    throw error;
  }
}

await initStripe();

const app = express();
const PORT = process.env.PORT || 3000;

const MemoryStoreSession = MemoryStore(session);

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature' });
  }
  
  try {
    const sig = Array.isArray(signature) ? signature[0] : signature;
    
    if (!Buffer.isBuffer(req.body)) {
      const errorMsg = 'STRIPE WEBHOOK ERROR: req.body is not a Buffer. ' +
        'This means express.json() ran before this webhook route. ' +
        'FIX: Move this webhook route registration BEFORE app.use(express.json()) in your code.';
      console.error(errorMsg);
      return res.status(500).json({ error: 'Webhook processing error' });
    }
    
    // Process webhook to sync data to database
    await WebhookHandlers.processWebhook(req.body as Buffer, sig);
    
    // Parse webhook event to update user subscription tier
    const stripe = await getUncachableStripeClient();
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      await getStripeWebhookSecret()
    );
    
    // Update user subscription tier based on event type
    if (event.type === 'customer.subscription.created' || 
        event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as any;
      const customerId = subscription.customer as string;
      const subscriptionId = subscription.id;
      const status = subscription.status;
      
      // Find user by Stripe customer ID
      const users = await db.select().from(require('./db/schema').users);
      const user = users.find((u: any) => u.stripeCustomerId === customerId);
      
      if (user) {
        const tier = (status === 'active' || status === 'trialing') ? 'pro' : 'free';
        const { storage } = await import('./stripe/storage');
        await storage.updateUserStripeInfo(user.id, {
          stripeSubscriptionId: subscriptionId,
          subscriptionTier: tier,
        });
        console.log(`✓ Updated user ${user.id} to tier: ${tier}`);
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any;
      const customerId = subscription.customer as string;
      
      const users = await db.select().from(require('./db/schema').users);
      const user = users.find((u: any) => u.stripeCustomerId === customerId);
      
      if (user) {
        const { storage } = await import('./stripe/storage');
        await storage.updateUserStripeInfo(user.id, {
          stripeSubscriptionId: null,
          subscriptionTier: 'free',
        });
        console.log(`✓ Downgraded user ${user.id} to free tier`);
      }
    }
    
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    
    if (error.message && error.message.includes('payload must be provided as a string or a Buffer')) {
      const helpfulMsg = 'STRIPE WEBHOOK ERROR: Payload is not a Buffer. ' +
        'This usually means express.json() parsed the body before the webhook handler. ' +
        'FIX: Ensure the webhook route is registered BEFORE app.use(express.json()).';
      console.error(helpfulMsg);
    }
    
    res.status(400).json({ error: 'Webhook processing error' });
  }
});

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "twinpeaking-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000,
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/conversations", conversationsRoutes);
app.use("/api/preferences", preferencesRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/subscription", subscriptionRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", version: "1.3" });
});

app.get("/api/config", (_req, res) => {
  res.json({
    mbtiQuestions: require("./config/twinpeaking").TwinPeakingConfig.mbtiQuestions,
    archetypes: require("./config/twinpeaking").TwinPeakingConfig.archetypes,
  });
});

app.get("/api/telemetry", async (_req, res) => {
  const count = await TelemetryService.getInstanceCount();
  res.json({ instanceCount: count });
});

app.listen(PORT, async () => {
  console.log(`TwinPeakingOS server running on port ${PORT}`);
  await TelemetryService.incrementRuntimeStart();
  console.log("Telemetry: Runtime start recorded");
});
