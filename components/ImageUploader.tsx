import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { ImageData } from '../types';

interface ImageUploaderProps {
  onImageSelected: (image: ImageData) => void;
  onClear: () => void;
  selectedImage: string | null;
  label?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelected, 
  onClear, 
  selectedImage,
  label = "Upload a photo"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract base64 part only
      const base64 = result.split(',')[1];
      onImageSelected({
        base64,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  if (selectedImage) {
    return (
      <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden border-2 border-gray-700 bg-black/40 group">
        <img 
          src={selectedImage} 
          alt="Preview" 
          className="w-full h-full object-contain" 
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            onClick={onClear}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-200"
          >
            <X size={18} />
            Remove Image
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full h-64 md:h-80 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer overflow-hidden ${
        dragActive 
          ? 'border-primary bg-primary/10' 
          : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-500'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        accept="image/*"
        onChange={handleChange}
      />
      
      <div className="flex flex-col items-center gap-4 text-gray-400">
        <div className={`p-4 rounded-full ${dragActive ? 'bg-primary/20 text-primary' : 'bg-gray-700/50'}`}>
          <Upload size={32} />
        </div>
        <div className="text-center px-4">
          <p className="font-medium text-lg text-gray-300">{label}</p>
          <p className="text-sm mt-1">Drag & drop or click to select</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;