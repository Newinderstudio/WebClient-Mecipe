'use client';

import fetchCompat from '@/util/fetchCompat';
import type { PutBlobResult } from '@vercel/blob';
import { useState, useRef } from 'react';
import useExampleImageScreen from './hooks/useExampleImageScreen';

export default function AvatarUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);

  const hookMember = useExampleImageScreen();
  
  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', width:'100%' }}>
            <div style={{ marginLeft: 240, padding: 20, minWidth: 1100 }}>
      <h1>Upload Your Avatar</h1>

      <form
        onSubmit={async (event) => {
          event.preventDefault();

          if (!inputFileRef.current?.files) {
            throw new Error("No file selected");
          }

          const file = inputFileRef.current.files[0];

          const formData = new FormData();
          formData.append('file', file);

          try {
            const response = await fetchCompat(
                'POST',
                `uploadImage?filename=${file.name}`,
                hookMember.token,
                formData,
                true
              );

              const newBlob = (await response) as PutBlobResult;

              setBlob(newBlob);
          } catch (e) {
            console.error(e);
          }
        }}
      >
        <input name="file" ref={inputFileRef} type="file" accept="image/jpeg, image/png, image/webp" required />
        <button type="submit">Upload</button>
      </form>
      {blob && (
        <div>
          Blob url: <a href={blob.url}>{blob.url}</a>
        </div>
      )}
    </div>
    </div>
  );
}