'use client';
import { ShieldAlert } from 'lucide-react';

const DeleteConfirmationModal = ({ 
    onConfirm, 
    onCancel,
    title = "Are you sure?",
    message = "Do you really want to delete this item? This process cannot be undone.",
    confirmText = "Delete"
}) => {
    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 px-4">
            <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <ShieldAlert className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-gray-900">{title}</h2>
                <p className="mt-2 text-sm text-gray-500">
                    {message}
                </p>
                <div className="mt-6 flex justify-center gap-4">
                    <button
                        onClick={onCancel}
                        type="button"
                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        type="button"
                        className="px-6 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
