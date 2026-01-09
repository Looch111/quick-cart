'use client';
import { useState } from 'react';
import { FileWarning } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

const DisputeModal = () => {
    const { isDisputeModalOpen, closeDisputeModal, orderForDispute, reportIssue } = useAppContext();
    const [reason, setReason] = useState('');

    if (!isDisputeModalOpen) {
        return null;
    }

    const handleSubmit = () => {
        if (reason.trim()) {
            reportIssue(orderForDispute._id, reason);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 px-4">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <FileWarning className="h-6 w-6 text-red-600" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-gray-900">Report an Issue</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Please describe the issue you're facing with this order. This will pause the order and an admin will review your case.
                    </p>
                </div>
                <div className="mt-4">
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows="4"
                        className="w-full p-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                        placeholder="e.g., Item not received, wrong item, item damaged..."
                    ></textarea>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button
                        onClick={closeDisputeModal}
                        type="button"
                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        type="button"
                        className="px-6 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 disabled:bg-red-300"
                        disabled={!reason.trim()}
                    >
                        Submit Dispute
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DisputeModal;
