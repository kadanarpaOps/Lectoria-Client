import { useState } from "react";
import Cropper from 'react-easy-crop';

interface Props {
    image: string;
    aspect: number,
    onCropComplete: (croppedImage: Blob) => void;
    onCancel: () => void;
    loading: boolean;
}

interface AreaPixels {
    x: number;
    y: number;
    width: number;
    height: number;
}

const ImageCropperModal = ({ image, onCropComplete, onCancel, loading, aspect }: Props) => {
  const [ crop, setCrop ] = useState({ x: 0, y: 0 });
  const [ zoom, setZoom ] = useState(1);
  const [ croppedAreaPixels, setCroppedAreaPixels ] = useState<AreaPixels | null>(null);

  const handleSave = async () => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = image;
    await new Promise((res) => (img.onload = res));

    canvas.width = croppedAreaPixels?.width as number;
    canvas.height = croppedAreaPixels?.height as number;
    
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(
        img,
        croppedAreaPixels?.x as number, croppedAreaPixels?.y as number,
        croppedAreaPixels?.width as number, croppedAreaPixels?.height as number,
        0, 0,
        croppedAreaPixels?.width as number, croppedAreaPixels?.height as number
    );

    canvas.toBlob((blob) => {
        if (blob) onCropComplete(blob);
    }, 'image/jpeg')
  }

  return (
    <div className="fixed inset-0 z-100 bg-black/90 flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-lg aspect-square bg-search-bg rounded-lg overflow-hidden">
            <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
            />
        </div>
        <div className="mt-6 flex space-x-4 w-full max-w-lg">
            {!loading ? (
                <>
                    <button onClick={onCancel} className="flex-1 py-3 bg-search-bg text-global font-bold rounded-xl cursor-pointer hover:scale-95 transition-transform">Cancelar</button>
                    <button onClick={handleSave} className="flex-1 py-3 bg-high-enfasis text-background-global font-bold rounded-xl cursor-pointer hover:scale-95 transition-transform">
                        Recortar y Guardar
                    </button>
                </>
            ) : (
                <div className="flex items-center py-3 pt-8 justify-center w-full h-full">
                  <div className="loading-button" />
                </div>
            )}
        </div>
    </div>
  )
}

export default ImageCropperModal
