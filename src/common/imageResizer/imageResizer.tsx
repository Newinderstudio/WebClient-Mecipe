import imageCompression from 'browser-image-compression';

export async function imageResizer(file: File) {
  const imageFile = file;
  const options = {
    maxSizeMB: 5,
    maxWidthOrHeight: 800,
    useWebWorker: true,
  };
  try {
    const compressedFile = await imageCompression(imageFile, options);
    return compressedFile;
  } catch (error) {
    console.log(error);
  }
}
