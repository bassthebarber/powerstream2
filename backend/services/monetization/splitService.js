/**
 * Single source of truth for platform / creator revenue split (30% / 70%).
 * @param {number} amountCents — total payment in cents (integer)
 */
export function calculateSplit(amountCents) {
  const amount = Math.max(0, Math.round(Number(amountCents) || 0));
  const platformFee = Math.round(amount * 0.3);
  const creatorEarnings = amount - platformFee;
  return {
    amount,
    amountCents: amount,
    platformFee,
    platformFeeCents: platformFee,
    creatorEarnings,
    creatorEarningsCents: creatorEarnings,
  };
}

export default { calculateSplit };
