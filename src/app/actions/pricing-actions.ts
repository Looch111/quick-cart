'use server';

import { getPrices as fetchPrices, type AssetPrice } from '@/services/market-data-service';

/**
 * A server action to safely expose the price fetching service to the client.
 * @param symbols An array of asset symbols.
 * @returns A promise that resolves to an array of AssetPrice objects.
 */
export async function getPrices(symbols: string[]): Promise<AssetPrice[]> {
  // In a real app, you might add caching or other logic here.
  return await fetchPrices(symbols);
}
