'use server';

import { db } from '@/lib/firebase/client';
import { doc, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const buySchema = z.object({
  userId: z.string().min(1),
  assetSymbol: z.string().min(1),
  assetName: z.string().min(1),
  cryptoAmount: z.number().positive(),
  nairaAmount: z.number().positive(),
});

export async function buyCryptoWithNaira(input: {
  userId: string;
  assetSymbol: string;
  assetName: string;
  cryptoAmount: number;
  nairaAmount: number;
}) {
  const validation = buySchema.safeParse(input);
  if (!validation.success) {
    return { success: false, message: 'Invalid input.' };
  }

  const { userId, assetSymbol, assetName, cryptoAmount, nairaAmount } = validation.data;

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
          value: "0"
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
