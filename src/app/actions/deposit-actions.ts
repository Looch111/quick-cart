'use server';

import { db } from '@/lib/firebase/client';
import { doc, runTransaction, collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { z } from 'zod';

const depositNairaSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive("Amount must be positive."),
});

/**
 * Simulates a Naira deposit from a payment gateway like Flutterwave.
 * In a real app, this would be triggered by a webhook after a successful payment.
 */
export async function depositNaira(input: { userId: string, amount: number }) {
  const validation = depositNairaSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, message: 'Invalid input.' };
  }
  const { userId, amount } = validation.data;
  
  try {
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        throw new Error("User document not found.");
      }

      const currentBalance = parseFloat(userDoc.data().nairaBalance || '0');
      const newBalance = currentBalance + amount;
      
      transaction.update(userRef, { nairaBalance: newBalance.toString() });

      const transactionsCollectionRef = collection(db, `users/${userId}/transactions`);
      transaction.set(doc(transactionsCollectionRef), {
        type: 'Deposit',
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
        amount: `+₦${amount.toLocaleString()}`,
        timestamp: serverTimestamp(),
      });
    });
     return { success: true, message: `Successfully deposited ₦${amount.toLocaleString()}` };
  } catch (error: any) {
    console.error("Naira deposit transaction failed: ", error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}


/**
 * NOTE: This function would typically be called by a secure webhook from a
 * wallet infrastructure service after a deposit is confirmed on the blockchain.
 * We are also using it for manual admin credits.
 */
export async function creditUserAccount(input: {
  userId: string;
  assetSymbol: string;
  assetName: string;
  amount: number;
}) {
  const depositSchema = z.object({
    userId: z.string().min(1),
    assetSymbol: z.string().min(1),
    assetName: z.string().min(1),
    amount: z.number().positive(),
  });

  const validation = depositSchema.safeParse(input);
  if (!validation.success) {
    console.error("Invalid creditUserAccount input", validation.error);
    const errorMessages = validation.error.errors.map(e => e.message).join(' ');
    return { success: false, message: `Invalid input: ${errorMessages}` };
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
          value: "0" // Placeholder, should be updated based on new total value
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
