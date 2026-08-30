"use client";

import { Expand } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { ProductMediaPlaceholder } from "./product-media-placeholder";

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const uniqueImages = [...new Set(images.filter(Boolean))];
  const [selectedImage, setSelectedImage] = useState(uniqueImages[0]);

  if (!selectedImage) {
    return <div className="aspect-square overflow-hidden rounded-3xl border border-[#dce8df]"><ProductMediaPlaceholder /></div>;
  }

  return (
    <div
      className={cn(
        "grid gap-3",
        uniqueImages.length > 1 && "sm:grid-cols-[78px_minmax(0,1fr)]",
      )}
    >
      {uniqueImages.length > 1 && (
        <div
          className="order-2 flex gap-3 overflow-x-auto pb-1 sm:order-1 sm:flex-col sm:overflow-visible"
          aria-label="Product images"
        >
          {uniqueImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedImage(image)}
              className={cn(
                "relative size-[72px] shrink-0 overflow-hidden rounded-xl border bg-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17643a] focus-visible:ring-offset-2",
                selectedImage === image
                  ? "border-[#17643a] ring-1 ring-[#17643a]"
                  : "border-[#d9e3dc] hover:border-[#7ba68a]",
              )}
              aria-label={`Show image ${index + 1} of ${productName}`}
              aria-pressed={selectedImage === image}
            >
              <Image
                src={image}
                alt=""
                fill
                unoptimized={image.startsWith("https://")}
                sizes="72px"
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative order-1 aspect-square overflow-hidden rounded-3xl border border-[#dce8df] bg-[#f5f8f2] sm:order-2">
        <Image
          key={selectedImage}
          src={selectedImage}
          alt={productName}
          fill
          unoptimized={selectedImage.startsWith("https://")}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-8 sm:p-12"
        />
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-[#d8e4da] bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#52675a] shadow-sm backdrop-blur">
          <Expand className="size-3.5" aria-hidden="true" />
          Product view
        </span>
      </div>
    </div>
  );
}
