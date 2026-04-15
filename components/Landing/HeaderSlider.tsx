"use client";
import React, { useState, useEffect, useCallback } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";
import { StaticImageData } from "next/image";
import { SliderItem } from "@/types";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface SliderData extends Omit<SliderItem, "imgSrc"> {
  imgSrc: StaticImageData;
}

const sliderData: SliderData[] = [
  {
    id: 1,
    title: "Experience Pure Sound - Your Perfect Headphones Awaits!",
    offer: "Limited Time — 30% Off",
    buttonText1: "Buy now",
    buttonText2: "Find more",
    imgSrc: assets.header_headphone_image,
  },
  {
    id: 2,
    title: "Next-Level Gaming Starts Here - Discover PlayStation 5 Today!",
    offer: "Hurry up — Only a few left!",
    buttonText1: "Shop Now",
    buttonText2: "Explore Deals",
    imgSrc: assets.header_playstation_image,
  },
  {
    id: 3,
    title: "Power Meets Elegance - Apple MacBook Pro is Here for you!",
    offer: "Exclusive Deal — 40% Off",
    buttonText1: "Order Now",
    buttonText2: "Learn More",
    imgSrc: assets.header_macbook_image,
  },
];

export default function HeaderSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = sliderData.length;

  const next = useCallback(() => setCurrent((p) => (p + 1) % total), [total]);
  const prev = () => setCurrent((p) => (p - 1 + total) % total);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [paused, next]);

  return (
    <div
      className="relative mt-6 rounded-2xl overflow-hidden border border-border bg-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {sliderData.map((slide, index) => (
          <div
            key={slide.id}
            className="relative flex min-w-full flex-col-reverse items-center justify-between gap-6 px-6 py-12 md:flex-row md:px-16 md:py-0 md:min-h-[420px]"
            aria-hidden={index !== current}
          >
            {/* Background glow */}
            <div className="pointer-events-none absolute right-1/4 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl" />

            {/* Slide number — decorative */}
            <span
              aria-hidden
              className="pointer-events-none absolute right-6 top-6 text-[80px] font-black leading-none text-foreground/[0.04] select-none md:text-[120px]"
            >
              0{index + 1}
            </span>

            {/* Left — content */}
            <div className="relative z-10 flex flex-col gap-4 md:max-w-[50%]">
              {/* Offer badge */}
              <span className="w-fit rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                {slide.offer}
              </span>

              {/* Title */}
              <h1 className="text-2xl font-black leading-tight tracking-tight text-card-foreground md:text-[2.6rem] md:leading-[1.1]">
                {slide.title}
              </h1>

              {/* CTA row */}
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
                >
                  {slide.buttonText1}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  {slide.buttonText2}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right — image */}
            <div className="relative z-10 flex flex-1 items-center justify-center">
              {/* Ring decoration behind image */}
              <div className="absolute h-56 w-56 rounded-full border border-border md:h-72 md:w-72" />
              <div className="absolute h-40 w-40 rounded-full border border-border/50 md:h-52 md:w-52" />
              <Image
                src={slide.imgSrc}
                alt={slide.title}
                className="relative w-40 drop-shadow-2xl md:w-64"
                priority={index === 0}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground backdrop-blur-sm transition hover:border-primary hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground backdrop-blur-sm transition hover:border-primary hover:text-primary"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Bottom bar — progress + dots */}
      <div className="relative z-10 flex items-center justify-between border-t border-border px-6 py-3 md:px-16">
        {/* Slide counter */}
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          <span className="text-foreground font-bold">
            {String(current + 1).padStart(2, "0")}
          </span>
          {" / "}
          {String(total).padStart(2, "0")}
        </span>

        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {sliderData.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 h-2 bg-primary"
                  : "w-2 h-2 bg-border hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>

        {/* Auto-play indicator */}
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
          {paused ? "Paused" : "Auto"}
        </span>
      </div>
    </div>
  );
}
