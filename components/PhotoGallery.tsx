import React from 'react';

interface PhotoGalleryProps {
  images: string[];
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ images }) => {
  return (
    <div className="columns-2 md:columns-3 gap-4 space-y-4">
      {images.map((src, index) => (
        <div 
          key={index} 
          className="break-inside-avoid relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <img
            src={src}
            alt={`Memory ${index + 1}`}
            className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      ))}
    </div>
  );
};