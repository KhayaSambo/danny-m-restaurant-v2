import type { Category, CMSOrderPayload } from '../types';

const CMS_URL = import.meta.env.VITE_CMS_URL || '';

/**
 * Fetch the active menu categories and items from the CMS API.
 */
export async function fetchMenu(): Promise<Category[]> {
  const res = await fetch(`${CMS_URL}/api/menu`);
  if (!res.ok) {
    throw new Error('Failed to fetch menu items from CMS database.');
  }
  return res.json();
}

/**
 * Submit a completed order payload to the CMS database.
 */
export async function submitCmsOrder(payload: CMSOrderPayload): Promise<{ id: string; [key: string]: unknown }> {
  const res = await fetch(`${CMS_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to submit order to CMS.');
  }
  return res.json() as Promise<{ id: string; [key: string]: unknown }>;
}

/**
 * Retrieve the current tracking status of an order from the CMS API.
 */
export async function fetchOrderStatus(orderId: string): Promise<unknown> {
  const res = await fetch(`${CMS_URL}/api/orders/${orderId}`);
  if (!res.ok) {
    throw new Error('Failed to retrieve order status.');
  }
  return res.json();
}
