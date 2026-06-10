import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, ArrowUpRight } from "lucide-react";
import { FaXTwitter, FaInstagram, FaFacebookF } from "react-icons/fa6";

const companyLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
];

const supportLinks = [
  { label: "FAQ", href: "/faq" },
  { label: "Shipping Info", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "Track Order", href: "/track" },
  { label: "Terms of Service", href: "/terms" },
];

const socialLinks = [
  { label: "X", href: "#", icon: FaXTwitter },
  { label: "Instagram", href: "#", icon: FaInstagram },
  { label: "Facebook", href: "#", icon: FaFacebookF },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      {/* Main content */}
      <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-12 py-14 md:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="shrink-0 text-xl font-bold text-primary">
              VoraCart
            </Link>

            <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
              Your one-stop destination for premium electronics, gaming gear,
              and everyday tech essentials.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-1">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Company links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
              Company
            </h3>
            <ul className="flex flex-col gap-2.5">
              {companyLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0.5 transition-all group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
              Support
            </h3>
            <ul className="flex flex-col gap-2.5">
              {supportLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0.5 transition-all group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get in touch */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
              Get in Touch
            </h3>
            <div className="flex flex-col gap-3">
              <Link
                href="tel:+1-234-567-890"
                className="group inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border transition-colors group-hover:border-primary group-hover:text-primary">
                  <Phone className="h-3.5 w-3.5" />
                </span>
                1-234-567-890
              </Link>
              <Link
                href="mailto:contact@voracart.com"
                className="group inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border transition-colors group-hover:border-primary group-hover:text-primary">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                contact@voracart.com
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-4 md:flex-row md:px-10 lg:px-16">
          <p className="text-xs text-muted-foreground">
            © 2026 VoraCart — All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/sitemap"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
