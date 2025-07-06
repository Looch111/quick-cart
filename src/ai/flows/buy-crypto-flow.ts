'use server';
/**
 * @fileOverview A Genkit flow for handling cryptocurrency purchases.
 * - buyCrypto - A function that orchestrates the purchase process.
 * - BuyCryptoInput - The input type for the buyCrypto function.
 * - BuyCryptoOutput - The return type for the buyCrypto function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { getPrices } from '@/services/market-data-service';
import { db } from '@/lib/firebase/client';
import { doc, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Define a tool for getting prices. This is how the AI can access live data.
const getCryptoPricesTool = ai.defineTool(
  {
    name: 'getCryptoPricesTool',
    description: 'Get the current price of one or more cryptocurrencies in USD.',
    inputSchema: z.object({ symbols: z.array(z.string()) }),
    outputSchema: z.array(z.object({ symbol: z.string(), priceUsd: z.number() })),
  },
  async ({ symbols }) => {
    // This is where you would call a real financial data API.
    // For now, it calls our mock service.
    console.log(`Tool is fetching prices for: ${symbols.join(', ')}`);
    return await getPrices(symbols);
  }
);

const BuyCryptoInputSchema = z.object({
  userId: z.string().min(1),
  assetSymbol: z.string().min(1),
  assetName: z.string().min(1),
  nairaAmount: z.number().positive(),
});
export type BuyCryptoInput = z.infer<typeof BuyCryptoInputSchema>;

const BuyCryptoOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type BuyCryptoOutput = z.infer<typeof BuyCryptoOutputSchema>;

// This is the main flow that orchestrates the purchase
const buyCryptoFlow = ai.defineFlow(
  {
    name: 'buyCryptoFlow',
    inputSchema: BuyCryptoInputSchema,
    outputSchema: BuyCryptoOutputSchema,
  },
  async (input) => {
    const { userId, assetSymbol, assetName, nairaAmount } = input;
    // In a real app, this rate would also come from a live price feed.
    const NGN_USD_RATE = 1 / 1450; 

    const nairaInUsd = nairaAmount * NGN_USD_RATE;

    // Use a prompt to determine the amount of crypto to buy.
    const prices = await getCryptoPricesTool({symbols: [assetSymbol]});
    const assetPrice = prices.find(p => p.symbol === assetSymbol)?.priceUsd;

    if (!assetPrice || assetPrice <= 0) {
      return { success: false, message: 'Could not fetch price for asset.' };
    }
    
    const cryptoAmount = nairaInUsd / assetPrice;

    if (isNaN(cryptoAmount) || cryptoAmount <= 0) {
      return { success: false, message: 'Could not calculate crypto amount.' };
    }
    
    console.log(`Flow determined user should receive ${cryptoAmount} ${assetSymbol}`);

    try {
      await runTransaction(db, async (transaction) => {
        const assetRef = doc(db, `users/${userId}/assets`, assetSymbol);
        const assetDoc = await transaction.get(assetRef);
        
        let newBalance = cryptoAmount;
        if (assetDoc.exists()) {
          const currentBalance = parseFloat(assetDoc.data().balance);
          newBalance += currentBalance;
          transaction.update(assetRef, { balance: newBalance.toString() });
        } else {
          transaction.set(assetRef, {
            balance: newBalance.toString(),
            name: assetName,
            value: "0" // Placeholder, should be updated based on new total value
          });
        }
  
        const transactionsCollectionRef = collection(db, `users/${userId}/transactions`);
        transaction.set(doc(transactionsCollectionRef), {
          type: 'Buy',
          status: 'Completed',
          date: new Date().toISOString().split('T')[0],
          amount: `+${cryptoAmount.toFixed(5)} ${assetSymbol}`,
          timestamp: serverTimestamp(),
        });
      });
  
      return { success: true, message: 'Purchase successful!' };
    } catch (error: any) {
      console.error('Buy transaction failed: ', error);
      return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
  }
);

// This is the exported function that the UI will call.
export async function buyCrypto(input: BuyCryptoInput): Promise<BuyCryptoOutput> {
  return await buyCryptoFlow(input);
}
