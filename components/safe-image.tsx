"use client";

import Image from "next/image";
import { ImageProps } from "next/image";

// Helper function to check if a string is a valid image URL
const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
};

// Wrapper component that safely handles image URLs
export function SafeImage({ src, alt, fill, className, ...props }: ImageProps) {
  // If src is not a valid URL, use HTML img with placeholder
  if (!isValidImageUrl(src as string)) {
    const placeholderSrc = `https://placehold.co/600x400?text=${encodeURIComponent(alt || 'Image')}`;

    if (fill) {
      return (
        <img
          src={placeholderSrc}
          alt={alt}
          className={`${className || ''} absolute inset-0 w-full h-full object-cover`}
          {...(props as any)}
        />
      );
    }

    return <img src={placeholderSrc} alt={alt} className={className} {...(props as any)} />;
  }

  return <Image src={src} alt={alt} fill={fill} className={className} {...props} />;
}
