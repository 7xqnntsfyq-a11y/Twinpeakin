import { getUncachableStripeClient } from "../stripe/stripeClient";

async function createStripeProducts() {
  try {
    const stripe = await getUncachableStripeClient();
    
    console.log("Creating Stripe products and prices...");
    
    // Create Pro product
    const proProduct = await stripe.products.create({
      name: "Twinpeakin Pro",
      description: "Full access to Myers-Briggs MBTI personality insights and archetypes",
      metadata: {
        tier: "pro",
        features: "Full MBTI insights, personality archetypes, unlimited chat history"
      }
    });
    
    console.log(`✓ Created product: ${proProduct.name} (${proProduct.id})`);
    
    // Create Pro price ($10.99/month recurring)
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      currency: "usd",
      unit_amount: 1099, // $10.99 in cents
      recurring: {
        interval: "month",
      },
      metadata: {
        tier: "pro"
      }
    });
    
    console.log(`✓ Created price: $${proPrice.unit_amount! / 100}/month (${proPrice.id})`);
    
    console.log("\n✅ Stripe products setup complete!");
    console.log(`\nPro Product ID: ${proProduct.id}`);
    console.log(`Pro Price ID: ${proPrice.id}`);
    console.log("\nThese IDs will be automatically synced to your database via webhooks.");
    console.log("Use the Price ID in your checkout flow.");
    
  } catch (error) {
    console.error("❌ Error creating Stripe products:", error);
    throw error;
  }
}

createStripeProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
