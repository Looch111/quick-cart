'use client';
import { X, ShieldAlert, RotateCw } from 'lucide-react';

const PaymentCancellationModal = ({ onResume, onCancel, show }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 px-4">
            <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                    <ShieldAlert className="h-6 w-6 text-yellow-600" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-gray-900">Payment Not Completed</h2>
                <p className="mt-2 text-sm text-gray-500">
                    It looks like you cancelled the payment process. Would you like to try again or go back?
                </p>
                <div className="mt-6 flex justify-center gap-4">
                    <button
                        onClick={onCancel}
                        type="button"
                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={onResume}
                        type="button"
                        className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700"
                    >
                        <RotateCw className='w-4 h-4' />
                        Resume Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancellationModal;
