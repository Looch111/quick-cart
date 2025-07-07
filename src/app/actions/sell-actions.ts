'use server';

import { db } from '@/lib/firebase/client';
import { doc, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const sellSchema = z.object({
  userId: z.string().min(1),
  assetSymbol: z.string().min(1),
  cryptoAmount: z.number().positive(),
  nairaAmount: z.number().positive(),
});

export async function sellCryptoForNaira(input: {
  userId: string;
  assetSymbol: string;
  cryptoAmount: number;
  nairaAmount: number;
}) {
  const validation = sellSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, message: 'Invalid input.' };
  }

  const { userId, assetSymbol, cryptoAmount, nairaAmount } = validation.data;

  try {
    await runTransaction(db, async (transaction) => {
      const assetRef = doc(db, `users/${userId}/assets`, assetSymbol);
      const userRef = doc(db, 'users', userId);

      const [assetDoc, userDoc] = await Promise.all([
        transaction.get(assetRef),
        transaction.get(userRef),
      ]);

      if (!assetDoc.exists()) {
        throw new Error(`You do not have any ${assetSymbol}.`);
      }
      if (!userDoc.exists()) {
        throw new Error('User not found.');
      }
      
      const currentBalance = parseFloat(assetDoc.data().balance);
      if (currentBalance < cryptoAmount) {
        throw new Error(`Insufficient balance for ${assetSymbol}.`);
      }

      // 1. Deduct crypto balance
      const newCryptoBalance = currentBalance - cryptoAmount;
      transaction.update(assetRef, { balance: newCryptoBalance.toString() });

      // 2. Credit Naira balance
      const currentNairaBalance = parseFloat(userDoc.data().nairaBalance || '0');
      const newNairaBalance = currentNairaBalance + nairaAmount;
      transaction.update(userRef, { nairaBalance: newNairaBalance.toString() });


      // 3. Log the transaction
      const transactionsCollectionRef = collection(db, `users/${userId}/transactions`);
      transaction.set(doc(transactionsCollectionRef), {
        type: 'Sell',
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
        amount: `-${cryptoAmount.toFixed(5)} ${assetSymbol} for ₦${nairaAmount.toLocaleString()}`,
        timestamp: serverTimestamp(),
      });
    });

    return { success: true, message: 'Sale successful! Your Naira wallet has been credited.' };
  } catch (error: any) {
    console.error('Sell transaction failed: ', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
