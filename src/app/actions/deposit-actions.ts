'use server';

import { db } from '@/lib/firebase/client';
import { doc, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const depositSchema = z.object({
  userId: z.string().min(1),
  assetSymbol: z.string().min(1),
  assetName: z.string().min(1),
  amount: z.number().positive(),
});

export async function depositCrypto(input: {
  userId: string;
  assetSymbol: string;
  assetName: string;
  amount: number;
}) {
  const validation = depositSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, message: 'Invalid input.' };
  }

  const { userId, assetSymbol, assetName, amount } = validation.data;

  try {
    await runTransaction(db, async (transaction) => {
      const assetRef = doc(db, `users/${userId}/assets`, assetSymbol);
      const assetDoc = await transaction.get(assetRef);
      
      let newBalance = amount;
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
        type: 'Deposit',
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
        amount: `+${amount.toFixed(5)} ${assetSymbol}`,
        timestamp: serverTimestamp(),
      });
    });

    return { success: true, message: 'Deposit successful!' };
  } catch (error: any) {
    console.error('Deposit transaction failed: ', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
