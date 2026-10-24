import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = 'Product image',
  className = '',
  fallbackText,
  ...props
}) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F4EFEB] text-[#7E726D] p-4 text-center select-none ${className}`}
      >
        <Sparkles className="w-6 h-6 text-[#A45543] mb-2 opacity-60" />
        <span className="font-serif text-sm tracking-wide text-[#2E221F]">STYL IS TIQ</span>
        <span className="text-xs text-[#7E726D] mt-1 line-clamp-1">{fallbackText || alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
      referrerPolicy="no-referrer"
      {...props}
    />
  );
};
