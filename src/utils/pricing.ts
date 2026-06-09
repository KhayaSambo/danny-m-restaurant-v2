import type { MenuItem } from '../types';

export function calculateDiscountedPrice(item: MenuItem): number {
  if (!item.specialOffers || item.specialOffers.length === 0) {
    return item.price;
  }

  // Assuming we use the first active special offer
  const offer = item.specialOffers[0];

  if (offer.discountType === 'PERCENTAGE') {
    return item.price * (1 - offer.discountValue / 100);
  } else if (offer.discountType === 'FIXED') {
    return Math.max(0, item.price - offer.discountValue);
  }

  return item.price;
}

export function hasActiveSpecial(item: MenuItem): boolean {
  return !!item.specialOffers && item.specialOffers.length > 0;
}
