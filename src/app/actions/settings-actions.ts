'use server';

import { db } from '@/lib/firebase/client';
import { doc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';

const bankDetailsSchema = z.object({
  userId: z.string().min(1),
  bankName: z.string().min(3, 'Bank name is required.'),
  accountNumber: z.string().length(10, 'Account number must be 10 digits.'),
  accountName: z.string().min(3, 'Account name is required.'),
});

export async function updateBankDetails(input: {
    userId: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
}) {
  const validation = bankDetailsSchema.safeParse(input);
  if (!validation.success) {
    const errorMessages = validation.error.errors.map(e => e.message).join(' ');
    return { success: false, message: errorMessages };
  }

  const { userId, bankName, accountNumber, accountName } = validation.data;
  
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      bankDetails: {
        bankName,
        accountNumber,
        accountName,
      }
    });
    return { success: true, message: 'Bank details saved successfully.' };
  } catch (error: any) {
    console.error('Failed to update bank details:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
