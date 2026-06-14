import React from "react";
import { Mail, ArrowRight, Sparkles } from "lucide-react";

export default function NewsLetter() {
  return (
    <section className="relative my-16 overflow-hidden rounded-2xl border border-border bg-card">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-primary/6 blur-3xl" />

      {/* Dotted grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 py-16 text-center md:px-16 md:py-20">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Limited offer
          </span>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black tracking-tight text-card-foreground md:text-5xl">
            Get{" "}
            <span className="relative inline-block text-primary">
              20% off
              <span className="absolute -bottom-1 left-0 h-[4px] w-full rounded-full bg-primary/30" />
            </span>{" "}
            your first order
          </h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            Join thousands of subscribers and be the first to hear about new drops, exclusive deals, and more.
          </p>
        </div>

        {/* Input row */}
        <div className="flex w-full max-w-lg flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>

            <input
              type="email"
              id="newsletter-email"
              name="email"
              placeholder="Enter your email address"
              className="h-12 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-0 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95">
            Subscribe
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Trust line */}
        <p className="text-xs text-muted-foreground/60">
          No spam, ever. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}