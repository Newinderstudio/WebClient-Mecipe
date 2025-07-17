import imageCompression from 'browser-image-compression';

export async function imageResizer(file: File, option?:{maxSizeMB?:number, maxWidthOrHeight?:number}) {
  const {maxSizeMB, maxWidthOrHeight} = option?? {maxSizeMB: 5, maxWidthOrHeight: 800};

  const imageFile = file;
  const options = {
    maxSizeMB: maxSizeMB ?? 5,
    maxWidthOrHeight: maxWidthOrHeight ?? 800,
    useWebWorker: true,
  };
  try {
    const compressedFile = await imageCompression(imageFile, options);
    return compressedFile;
  } catch (error) {
    console.log(error);
  }
}
