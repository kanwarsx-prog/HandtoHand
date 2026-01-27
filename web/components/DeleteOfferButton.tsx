'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteOfferButton({ offerId }: { offerId: string }) {
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this offer? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            const response = await fetch(`/api/offers/${offerId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete offer');
            }

            // Redirect to profile after successful deletion
            router.push('/profile');
            router.refresh();
        } catch (error) {
            alert('Error deleting offer');
            setDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full sm:w-auto px-6 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {deleting ? 'Deleting...' : 'Delete Offer 🗑️'}
        </button>
    );
}
