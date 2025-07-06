'use server';

import { db } from '@/lib/firebase/client';
import { doc, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import { generateNewDepositAddress } from '@/services/wallet-service';

const getAddressSchema = z.object({
  userId: z.string().min(1),
  assetSymbol: z.string().min(1),
});

/**
 * A server action to get a deposit address for a user.
 * This simulates the first step of a real deposit flow.
 * @param input The user ID and asset symbol.
 * @returns An object with the deposit address or an error message.
 */
export async function getDepositAddress(input: { userId: string; assetSymbol: string; }) {
  const validation = getAddressSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, address: null, message: 'Invalid input.' };
  }

  const { userId, assetSymbol } = validation.data;

  try {
    const address = await generateNewDepositAddress(userId, assetSymbol);
    return { success: true, address: address, message: 'Address generated successfully.' };
  } catch (error: any) {
    console.error('Failed to get deposit address:', error);
    return { success: false, address: null, message: error.message || 'An unexpected error occurred.' };
  }
}


/**
 * NOTE: This function would NOT be called by the user interface.
 * In a real application, this logic would be triggered by a secure webhook from a
 * wallet infrastructure service after a deposit is confirmed on the blockchain.
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
    return { success: false, message: 'Invalid input for crediting account.' };
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
