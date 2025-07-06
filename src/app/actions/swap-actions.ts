'use server';

import { db } from '@/lib/firebase/client';
import { doc, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const swapSchema = z.object({
  userId: z.string().min(1),
  fromCurrency: z.string().min(1),
  toCurrency: z.string().min(1),
  fromAmount: z.number().positive(),
  toAmount: z.number().positive(),
});

export async function swapAssets(input: {
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
}) {
  const validation = swapSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, message: 'Invalid input.' };
  }

  const { userId, fromCurrency, toCurrency, fromAmount, toAmount } = validation.data;

  try {
    await runTransaction(db, async (transaction) => {
      const fromAssetRef = doc(db, `users/${userId}/assets`, fromCurrency);
      const toAssetRef = doc(db, `users/${userId}/assets`, toCurrency);

      const fromAssetDoc = await transaction.get(fromAssetRef);
      const toAssetDoc = await transaction.get(toAssetRef);

      if (!fromAssetDoc.exists()) {
        throw new Error(`You do not have any ${fromCurrency}.`);
      }

      const fromAssetData = fromAssetDoc.data();
      const currentFromBalance = parseFloat(fromAssetData.balance);

      if (currentFromBalance < fromAmount) {
        throw new Error(`Insufficient balance for ${fromCurrency}.`);
      }

      const newFromBalance = currentFromBalance - fromAmount;
      
      const toAssetData = toAssetDoc.exists() ? toAssetDoc.data() : { balance: '0' };
      const currentToBalance = parseFloat(toAssetData.balance);
      const newToBalance = currentToBalance + toAmount;

      transaction.update(fromAssetRef, { balance: newFromBalance.toString() });
      
      if (toAssetDoc.exists()) {
        transaction.update(toAssetRef, { balance: newToBalance.toString() });
      } else {
        transaction.set(toAssetRef, { 
            balance: newToBalance.toString(),
            name: toCurrency, 
            value: "0" // Placeholder, should be updated with a real price feed
        });
      }

      const transactionsCollectionRef = collection(db, `users/${userId}/transactions`);
      transaction.set(doc(transactionsCollectionRef), {
        type: 'Swap',
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
        amount: `${fromAmount.toFixed(5)} ${fromCurrency} -> ${toAmount.toFixed(5)} ${toCurrency}`,
        timestamp: serverTimestamp(),
      });
    });

    return { success: true, message: 'Swap successful!' };
  } catch (error: any) {
    console.error('Swap transaction failed: ', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
