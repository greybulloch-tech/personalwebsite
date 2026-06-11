"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export function ParallaxImage({ src, alt, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const windowH = window.innerHeight;
      const visible = rect.top < windowH && rect.bottom > 0;
      if (!visible) return;

      const progress = (windowH - rect.top) / (windowH + rect.height);
      const shift = (progress - 0.5) * 60;

      if (imgRef.current) {
        imgRef.current.style.transform = `translateY(${shift}px) scale(1.15)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-100 ease-out will-change-transform"
        style={{ transform: "translateY(0) scale(1.15)" }}
      />
    </div>
  );
}
