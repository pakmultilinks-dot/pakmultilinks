"use client";

import { X, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, type MouseEvent } from "react";

import { cn } from "@/lib/utils";

import { getProductImage } from "@/lib/category-meta";

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const fallback = getProductImage({ name: productName });
  const uniqueImages = [...new Set(images.filter(Boolean))];
  const effectiveImages = uniqueImages.length > 0 ? uniqueImages : [fallback];
  const [selectedImage, setSelectedImage] = useState(effectiveImages[0]);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [fullScreen, setFullScreen] = useState(false);

  useEffect(() => {
    if (!fullScreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullScreen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [fullScreen]);

  function updateZoom(event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100));
    setZoomPosition({ x, y });
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
              onClick={() => {
                setSelectedImage(image);
                setZoomActive(false);
              }}
              className={cn(
                "relative size-[72px] shrink-0 overflow-hidden rounded-xl border bg-surface transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
                selectedImage === image
                  ? "border-focus ring-1 ring-focus"
                  : "border-line hover:border-line-strong",
              )}
              aria-label={`Show image ${index + 1} of ${productName}`}
              aria-pressed={selectedImage === image}
            >
              <Image
                src={image}
                alt=""
                fill
                unoptimized
                sizes="72px"
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative order-1 sm:order-2">
        <div
          className="product-gallery-main relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border border-line bg-surface-soft"
          onMouseEnter={() => setZoomActive(true)}
          onMouseMove={updateZoom}
          onMouseLeave={() => setZoomActive(false)}
          onClick={() => setFullScreen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setFullScreen(true);
            }
          }}
          aria-label={`Zoom ${productName} image`}
        >
          <Image
            key={selectedImage}
            src={selectedImage}
            alt={productName}
            fill
            unoptimized
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-8 sm:p-12"
          />
          {zoomActive && (
            <span
              className="pointer-events-none absolute hidden size-[34%] -translate-x-1/2 -translate-y-1/2 border border-action/60 bg-action/10 shadow-inner lg:block"
              style={{
                left: `${Math.max(17, Math.min(83, zoomPosition.x))}%`,
                top: `${Math.max(17, Math.min(83, zoomPosition.y))}%`,
              }}
              aria-hidden="true"
            />
          )}
          <span className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface/90 px-3 py-1.5 text-xs font-semibold text-accent shadow-sm backdrop-blur">
            <ZoomIn className="size-3.5" aria-hidden="true" />
            <span className="lg:hidden">Tap to zoom</span>
            <span className="hidden lg:inline">Hover to zoom</span>
          </span>
        </div>

        {zoomActive && (
          <div
            className="pointer-events-none absolute left-[calc(100%+1rem)] top-0 z-40 hidden aspect-square w-full overflow-hidden rounded-2xl border-2 border-action bg-white shadow-2xl lg:block"
            style={{
              backgroundImage: `url(${JSON.stringify(selectedImage)})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "250%",
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {fullScreen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} enlarged image`}
          onClick={() => setFullScreen(false)}
        >
          <button
            type="button"
            onClick={() => setFullScreen(false)}
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white text-slate-900 shadow-lg"
            aria-label="Close enlarged image"
          >
            <X className="size-5" />
          </button>
          <div className="relative h-[min(86vh,900px)] w-[min(92vw,1100px)] rounded-2xl bg-white" onClick={(event) => event.stopPropagation()}>
            <Image src={selectedImage} alt={productName} fill unoptimized sizes="92vw" className="object-contain p-4 sm:p-8" />
          </div>
        </div>
      )}
    </div>
  );
}
