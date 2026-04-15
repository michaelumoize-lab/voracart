import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";

export default function Banner() {
  return (
    <div className="relative my-16 rounded-2xl overflow-hidden border border-border bg-background min-h-[420px] flex items-center">

      {/* Giant watermark text */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-[clamp(80px,18vw,180px)] font-black uppercase leading-none tracking-tighter text-foreground/[0.03] select-none"
      >
        GAMING
      </span>

      {/* Diagonal primary slash */}
      <div
        className="absolute inset-y-0 left-[38%] w-[340px] bg-primary/10 -skew-x-6 pointer-events-none"
      />

      {/* Floating product images */}
      <div className="absolute right-0 top-0 bottom-0 w-[55%] flex items-end justify-center gap-6 pr-10 pb-0 pointer-events-none">
        {/* Soundbox — elevated card */}
        <div className="relative self-center">
          <div className="absolute -inset-4 rounded-2xl bg-primary/8 blur-xl" />
          <Image
            src={assets.jbl_soundbox_image}
            alt="JBL Soundbox"
            className="relative w-28 md:w-36 drop-shadow-xl"
          />
        </div>

        {/* Controller — taller, bleeds out bottom */}
        <div className="relative translate-y-6 hidden md:block">
          <Image
            src={assets.md_controller_image}
            alt="Controller"
            className="w-56 md:w-72 drop-shadow-2xl"
          />
        </div>
        <div className="relative translate-y-6 md:hidden">
          <Image
            src={assets.sm_controller_image}
            alt="Controller"
            className="w-44 drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-5 px-8 py-14 md:px-14 md:max-w-[50%]">

        {/* Badge */}
        <span className="w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
          New Collection
        </span>

        {/* Heading */}
        <h2 className="text-4xl md:text-6xl font-black leading-[1.0] tracking-tight text-foreground">
          Play <br />
          <span className="relative inline-block">
            Louder.
            {/* Underline accent */}
            <span className="absolute -bottom-1 left-0 h-[5px] w-full rounded-full bg-primary/40" />
          </span>
          <br />
          Win More.
        </h2>

        {/* Body */}
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">
          Immersive audio and precision controls — everything built for those who play to win.
        </p>

        {/* CTA */}
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            Shop Now
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Learn more
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 pt-4 mt-1 border-t border-border">
          {[
            { value: "500+", label: "Products" },
            { value: "4.9★", label: "Rating" },
            { value: "Free", label: "Shipping" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col">
              <span className="text-base font-extrabold text-foreground">{value}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}