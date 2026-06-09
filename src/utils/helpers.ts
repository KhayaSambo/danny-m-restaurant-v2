import type { CartItem } from '../types';
import { calculateDiscountedPrice } from './pricing';

/**
 * Safely parse a JSON string, catching errors and returning a default value.
 */
export function safeJsonParse<T>(str: string | null | undefined, defaultValue: T): T {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str) as T;
  } catch (error) {
    console.error('Error parsing JSON string:', str, error);
    return defaultValue;
  }
}

/**
 * Cleans and parses a price string/number to a float representation.
 */
export function parseExtraPrice(priceStr: string | number | undefined): number {
  if (priceStr === undefined || priceStr === null) return 0;
  if (typeof priceStr === 'number') return priceStr;
  
  const cleaned = priceStr.toString().replace(/R/i, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculates the total unit price of a cart item including selected extras and beverages.
 */
export function getItemPrice(cartItem: CartItem): number {
  let price = cartItem.isBundle && cartItem.bundle
    ? cartItem.bundle.price
    : calculateDiscountedPrice(cartItem.item!);
  if (cartItem.selectedExtras) {
    price += cartItem.selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
  }
  if (cartItem.selectedBeverages) {
    price += cartItem.selectedBeverages.reduce((sum, bev) => sum + bev.price, 0);
  }
  return price;
}

/**
 * Computes subtotal and VAT for a given total price using 15% standard rate.
 */
export function calculateVat(totalPrice: number) {
  const vatRate = 0.15;
  const vat = totalPrice * vatRate;
  const subtotal = totalPrice - vat;
  return { subtotal, vat };
}
