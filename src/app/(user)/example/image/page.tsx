'use client'

import { useState } from "react";

export default function ImageUploadPage() {
    const [image, setImage] = useState<File | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
        }
    }

    const handleUpload = async () => {
        if (!image) return;

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await fetch('/api/uploadImage', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await response.json();
            console.log('Image uploaded successfully:', data);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    }

    return (
        <div>
            <input type="file" onChange={handleImageChange} accept='image/*' />
            <button onClick={handleUpload}>Upload</button>
        </div>
    )
}