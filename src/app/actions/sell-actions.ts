'use server';

import { db } from '@/lib/firebase/client';
import { doc, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const sellSchema = z.object({
  userId: z.string().min(1),
  assetSymbol: z.string().min(1),
  cryptoAmount: z.number().positive(),
  nairaAmount: z.string().min(1),
});

export async function sellCryptoForNaira(input: {
  userId: string;
  assetSymbol: string;
  cryptoAmount: number;
  nairaAmount: string;
}) {
  const validation = sellSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, message: 'Invalid input.' };
  }

  const { userId, assetSymbol, cryptoAmount, nairaAmount } = validation.data;

  try {
    await runTransaction(db, async (transaction) => {
      const assetRef = doc(db, `users/${userId}/assets`, assetSymbol);
      const assetDoc = await transaction.get(assetRef);

      if (!assetDoc.exists()) {
        throw new Error(`You do not have any ${assetSymbol}.`);
      }
      
      const currentBalance = parseFloat(assetDoc.data().balance);
      if (currentBalance < cryptoAmount) {
        throw new Error(`Insufficient balance for ${assetSymbol}.`);
      }

      const newBalance = currentBalance - cryptoAmount;
      transaction.update(assetRef, { balance: newBalance.toString() });

      const transactionsCollectionRef = collection(db, `users/${userId}/transactions`);
      transaction.set(doc(transactionsCollectionRef), {
        type: 'Sell',
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
        amount: `-${cryptoAmount.toFixed(5)} ${assetSymbol}`,
        timestamp: serverTimestamp(),
      });
    });

    return { success: true, message: 'Sale successful!' };
  } catch (error: any) {
    console.error('Sell transaction failed: ', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
