const DELIVERY_FEE = Number(process.env.DEFAULT_DELIVERY_FEE || 8);
const EXPRESS_FEE = Number(process.env.DEFAULT_EXPRESS_FEE || 10);
const TAX_RATE = Number(process.env.TAX_RATE || 0); // e.g. 0.05 for 5%

/**
 * Computes the estimated pricing breakdown for a new order from its line
 * items. Only "estimated" figures are set here — actual/final pricing is
 * filled in later once the laundry weighs/counts the real items.
 *
 * @param {Array} items - order items, each with unitPrice & estimatedQty
 * @param {Object} opts
 * @param {boolean} opts.isExpress
 * @param {number} [opts.walletDeduction]
 * @param {number} [opts.couponDiscount]
 */
function calculateEstimatedPricing(items, { isExpress = false, walletDeduction = 0, couponDiscount = 0 } = {}) {
  const subtotal = items.reduce((sum, item) => {
    const price = (item.unitPrice || 0) * (item.estimatedQty || 0);
    item.estimatedPrice = round2(price);
    return sum + price;
  }, 0);

  const deliveryFee = DELIVERY_FEE;
  const expressFee = isExpress ? EXPRESS_FEE : 0;
  const discount = couponDiscount || 0;

  const preTax = Math.max(subtotal + deliveryFee + expressFee - discount - walletDeduction, 0);
  const tax = round2(preTax * TAX_RATE);
  const estimatedTotal = round2(preTax + tax);

  return {
    subtotal: round2(subtotal),
    deliveryFee,
    expressFee,
    surgeFee: 0,
    holidayFee: 0,
    discount: 0,
    couponDiscount: round2(discount),
    walletDeduction: round2(walletDeduction),
    rewardPointsUsed: 0,
    rewardPointsValue: 0,
    tax,
    total: 0, // filled in once the order is actually completed/billed
    estimatedTotal,
  };
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

module.exports = { calculateEstimatedPricing, round2 };