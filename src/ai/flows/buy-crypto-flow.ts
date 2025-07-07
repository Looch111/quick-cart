'use server';
/**
 * @fileOverview A Genkit flow for handling cryptocurrency purchases using a user's Naira balance.
 * - buyCrypto - A function that orchestrates the purchase process.
 * - BuyCryptoInput - The input type for the buyCrypto function.
 * - BuyCryptoOutput - The return type for the buyCrypto function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { getPrices } from '@/services/market-data-service';
import { db } from '@/lib/firebase/client';
import { doc, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const getCryptoPricesTool = ai.defineTool(
  {
    name: 'getCryptoPricesTool',
    description: 'Get the current price of one or more cryptocurrencies in USD.',
    inputSchema: z.object({ symbols: z.array(z.string()) }),
    outputSchema: z.array(z.object({ symbol: z.string(), priceUsd: z.number() })),
  },
  async ({ symbols }) => {
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

const buyCryptoFlow = ai.defineFlow(
  {
    name: 'buyCryptoFlow',
    inputSchema: BuyCryptoInputSchema,
    outputSchema: BuyCryptoOutputSchema,
  },
  async (input) => {
    const { userId, assetSymbol, assetName, nairaAmount } = input;
    const NGN_USD_RATE = 1 / 1450;
    const nairaInUsd = nairaAmount * NGN_USD_RATE;

    const prices = await getCryptoPricesTool({symbols: [assetSymbol]});
    const assetPrice = prices.find(p => p.symbol === assetSymbol)?.priceUsd;

    if (!assetPrice || assetPrice <= 0) {
      return { success: false, message: 'Could not fetch price for asset.' };
    }
    
    const cryptoAmount = nairaInUsd / assetPrice;

    if (isNaN(cryptoAmount) || cryptoAmount <= 0) {
      return { success: false, message: 'Could not calculate crypto amount.' };
    }
    
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, `users`, userId);
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) {
          throw new Error("User not found.");
        }

        const currentNairaBalance = parseFloat(userDoc.data().nairaBalance || '0');
        if (currentNairaBalance < nairaAmount) {
          throw new Error('Insufficient Naira balance.');
        }

        // 1. Debit Naira balance
        const newNairaBalance = currentNairaBalance - nairaAmount;
        transaction.update(userRef, { nairaBalance: newNairaBalance.toString() });

        // 2. Credit Crypto balance
        const assetRef = doc(db, `users/${userId}/assets`, assetSymbol);
        const assetDoc = await transaction.get(assetRef);
        
        let newCryptoBalance = cryptoAmount;
        if (assetDoc.exists()) {
          const currentCryptoBalance = parseFloat(assetDoc.data().balance);
          newCryptoBalance += currentCryptoBalance;
          transaction.update(assetRef, { balance: newCryptoBalance.toString() });
        } else {
          transaction.set(assetRef, {
            balance: newCryptoBalance.toString(),
            name: assetName,
            value: "0" 
          });
        }
  
        // 3. Log transaction
        const transactionsCollectionRef = collection(db, `users/${userId}/transactions`);
        transaction.set(doc(transactionsCollectionRef), {
          type: 'Buy',
          status: 'Completed',
          date: new Date().toISOString().split('T')[0],
          amount: `+${cryptoAmount.toFixed(5)} ${assetSymbol}`,
          details: `with ₦${nairaAmount.toLocaleString()}`,
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

export async function buyCrypto(input: BuyCryptoInput): Promise<BuyCryptoOutput> {
  return await buyCryptoFlow(input);
}
