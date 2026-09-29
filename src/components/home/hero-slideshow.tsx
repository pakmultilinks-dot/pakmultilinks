"use client";

import { ChevronLeft, ChevronRight, Leaf, PackageCheck, Pause, Play, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";

import styles from "./home-hero.module.css";

const slides = [
  {
    src: "/images/hero-prototype-background.webp",
    alt: "Tissues, dispensers, cleaning products and waste bins arranged in a bright workspace",
    title: "One partner. Every essential.",
    description: "Hygiene supplies for the way you work.",
  },
  {
    src: "/images/hero-products-green.png",
    alt: "Rose Petal tissues, soft packs and jumbo tissue rolls on a green display",
    title: "Everyday comfort. Quality care.",
    description: "Discover our tissue and paper essentials.",
  },
  {
    src: "/images/hero-workspace-hygiene.png",
    alt: "Cleaning sprays, dispensers, tissues, mop and waste bags for facility care",
    title: "A fresh start for every space.",
    description: "Cleaning and facility supplies, all together.",
  },
];

function subscribeToMotionPreference(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [playback, setPlayback] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
  const playing = playback ?? !reducedMotion;
  const rotating = playing && !hovered && !focused;

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setCurrent((index) => (index + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [rotating]);

  function select(index: number) {
    setCurrent((index + slides.length) % slides.length);
    setPlayback(false);
  }

  return (
    <div
      className={styles.showcase}
      role="region"
      aria-roledescription="carousel"
      aria-label="Hygiene product highlights"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div className={styles.image}>
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            className={`${styles.slide} ${index === current ? styles.activeSlide : ""}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
            aria-hidden={index !== current}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              preload={index === 0}
              loading={index === 0 ? undefined : "eager"}
              sizes="(min-width: 1344px) 588px, (min-width: 1000px) 46vw, (min-width: 700px) 80vw, calc(100vw - 32px)"
            />
          </div>
        ))}
        <div className={styles.imageBadge}><ShieldCheck aria-hidden="true" /><span>Cleaner spaces.<strong>Healthier people.</strong></span></div>
        <div className={styles.slideControls}>
          <button type="button" onClick={() => select(current - 1)} aria-label="Previous hero slide"><ChevronLeft aria-hidden="true" /></button>
          <div className={styles.slideDots}>
            {slides.map((slide, index) => (
              <button key={slide.src} type="button" onClick={() => select(index)} aria-label={`Show slide ${index + 1}: ${slide.title}`} aria-current={index === current ? "true" : undefined}><span /></button>
            ))}
          </div>
          <button type="button" onClick={() => select(current + 1)} aria-label="Next hero slide"><ChevronRight aria-hidden="true" /></button>
          <button className={styles.playbackControl} type="button" onClick={() => setPlayback(!playing)} aria-label={playing ? "Pause hero slideshow" : "Play hero slideshow"}>{playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</button>
        </div>
      </div>
      <div className={styles.imageCaption}>
        <span className={styles.captionIcon}><PackageCheck aria-hidden="true" /></span>
        <div aria-live={rotating ? "off" : "polite"} aria-atomic="true"><p>{slides[current].title}</p><span>{slides[current].description}</span></div>
        <Leaf className={styles.captionLeaf} aria-hidden="true" />
      </div>
    </div>
  );
}
