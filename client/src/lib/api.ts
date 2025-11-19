export async function getSubscriptionStatus() {
  const response = await fetch('/api/subscription/status', { credentials: 'include' });
  return await response.json();
}

export async function createCheckoutSession() {
  const response = await fetch('/api/subscription/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  return await response.json();
}
