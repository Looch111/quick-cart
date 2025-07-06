/**
 * @fileoverview A mock service for fetching market data.
 * In a real application, this service would connect to a live data feed API
 * like CoinGecko, Binance, or a financial data provider.
 */

// A simple mock price list in USD.
const MOCK_PRICES: { [key: string]: number } = {
  'BTC': 67543.21,
  'ETH': 3789.45,
  'USDC': 1.00,
};

export interface AssetPrice {
    symbol: string;
    priceUsd: number;
}

/**
 * Fetches the "live" price for a list of asset symbols.
 * This is a mock implementation.
 * @param symbols - An array of asset symbols (e.g., ['BTC', 'ETH']).
 * @returns A promise that resolves to an array of AssetPrice objects.
 */
export async function getPrices(symbols: string[]): Promise<AssetPrice[]> {    
    const prices = symbols.map(symbol => {
        const price = MOCK_PRICES[symbol.toUpperCase()];
        if (price === undefined) {
            console.warn(`No price found for symbol: ${symbol}`);
            return { symbol: symbol.toUpperCase(), priceUsd: 0 };
        }
        return { symbol: symbol.toUpperCase(), priceUsd: price };
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return prices;
}
