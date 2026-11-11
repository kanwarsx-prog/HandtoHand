'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ProfilePhotoUploadProps {
    currentPhotoUrl?: string | null;
    userId: string;
    onPhotoChange: (photoUrl: string | null) => void;
}

export default function ProfilePhotoUpload({ currentPhotoUrl, userId, onPhotoChange }: ProfilePhotoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setError(null);
        setUploading(true);

        try {
            // Create a unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucket', 'profile-photos');
            formData.append('path', filePath);
            const response = await fetch('/api/storage', { method: 'POST', body: formData });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Upload failed');
            const publicUrl = result.publicUrl as string;

            setPreviewUrl(publicUrl);
            onPhotoChange(publicUrl);

            // Delete old photo if exists
            if (currentPhotoUrl) {
                const oldPath = currentPhotoUrl.split('/profile-photos/')[1];
                if (oldPath) {
                    await fetch('/api/storage', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bucket: 'profile-photos', path: oldPath }) });
                }
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!previewUrl) return;

        setUploading(true);
        try {
            const path = previewUrl.split('/profile-photos/')[1];
            if (path) {
                await fetch('/api/storage', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bucket: 'profile-photos', path }) });
            }

            setPreviewUrl(null);
            onPhotoChange(null);
        } catch (err: any) {
            console.error('Delete error:', err);
            setError(err.message || 'Failed to delete photo');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            {/* Photo Preview */}
            <div className="relative">
                <div className="h-32 w-32 rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 border-4 border-white shadow-lg">
                    {previewUrl ? (
                        <Image
                            src={previewUrl}
                            alt="Profile photo"
                            width={128}
                            height={128}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-indigo-600">
                            📷
                        </div>
                    )}
                </div>

                {/* Upload/Delete Overlay */}
                {!uploading && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 flex items-center justify-center"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                )}
            </div>

            {/* Upload Instructions */}
            <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                    {previewUrl ? 'Click to change photo' : 'Add a profile photo'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG or WEBP (max 5MB)
                </p>
            </div>

            {/* Delete Button */}
            {previewUrl && !uploading && (
                <button
                    type="button"
                    onClick={handleDelete}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                    Remove photo
                </button>
            )}

            {/* Error Message */}
            {error && (
                <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                    {error}
                </div>
            )}

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
}
