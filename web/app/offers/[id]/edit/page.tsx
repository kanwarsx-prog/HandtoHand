'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = [
    { id: 'food', name: 'Food & Cooking', icon: '🍳' },
    { id: 'gardening', name: 'Gardening', icon: '🌱' },
    { id: 'diy', name: 'DIY & Tools', icon: '🔨' },
    { id: 'skills', name: 'Skills & Teaching', icon: '📚' },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'childcare', name: 'Childcare', icon: '👶' },
    { id: 'tech', name: 'Tech & Repair', icon: '💻' },
    { id: 'arts', name: 'Arts & Crafts', icon: '🎨' },
    { id: 'books', name: 'Books', icon: '📖' },
];

export default function EditOfferPage({ params }: { params: { id: string } }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchingOffer, setFetchingOffer] = useState(true);
    const [offerId, setOfferId] = useState<string>('');
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function fetchOffer() {
            const { id } = await params;
            setOfferId(id);

            const { data: offer, error } = await supabase
                .from('offers')
                .select('*, category:categories(slug)')
                .eq('id', id)
                .single();

            if (error || !offer) {
                alert('Offer not found');
                router.push('/');
                return;
            }

            // Pre-fill form
            setTitle(offer.title);
            setDescription(offer.description);
            setCategoryId(offer.category?.slug || '');
            if (offer.image_url) {
                setExistingImageUrl(offer.image_url);
                setImagePreview(offer.image_url);
            }

            setFetchingOffer(false);
        }

        fetchOffer();
    }, [params, router, supabase]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = existingImageUrl;

            // Upload new image if selected
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('offers')
                    .upload(filePath, imageFile);

                if (uploadError) {
                    throw uploadError;
                }

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('offers')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            // Update Offer via API
            const response = await fetch(`/api/offers/${offerId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    categorySlug: categoryId,
                    imageUrl,
                }),
            });

            if (!response.ok) throw new Error('Failed to update offer');

            router.push(`/offers/${offerId}`);
        } catch (error: any) {
            alert('Error updating offer: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetchingOffer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading offer...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-indigo-600 px-8 py-6">
                        <h1 className="text-3xl font-bold text-white">Edit Offer ✏️</h1>
                        <p className="text-indigo-100 mt-2">Update your offer details</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Photo (Optional)
                            </label>
                            <div className="flex items-center space-x-6">
                                <div className="shrink-0">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                                        />
                                    ) : (
                                        <div className="h-32 w-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                                            <span>No Photo</span>
                                        </div>
                                    )}
                                </div>
                                <label className="block">
                                    <span className="sr-only">Choose photo</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100
                      cursor-pointer
                    "
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                What are you offering?
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Sourdough Starter, Guitar Lessons, Power Drill"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-lg"
                                required
                                maxLength={50}
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategoryId(cat.id)}
                                        className={`p-3 rounded-xl border-2 transition-all text-left flex flex-col items-center justify-center space-y-2 ${categoryId === cat.id
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-200 hover:border-indigo-300 text-gray-600'
                                            }`}
                                    >
                                        <span className="text-2xl">{cat.icon}</span>
                                        <span className="text-xs font-medium text-center">{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe what you're offering. Be specific about condition, availability, etc."
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                                rows={5}
                                required
                                maxLength={500}
                            />
                            <p className="text-right text-xs text-gray-500 mt-1">
                                {description.length}/500
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.push(`/offers/${offerId}`)}
                                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl text-lg font-bold hover:bg-gray-300 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-4 bg-indigo-600 text-white rounded-xl text-lg font-bold hover:bg-indigo-700 transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Save Changes ✨'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
