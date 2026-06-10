// app/(public)/about/page.tsx
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            About Voracart
          </h1>
          <p className="text-xl text-muted-foreground">
            Your trusted shopping destination since 2024
          </p>
        </div>

        {/* Story Card */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-card-foreground mb-4">
            Our Story
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Voracart was founded with a simple mission: to bring quality products 
            directly to customers at fair prices. What started as a small passion 
            project has grown into a trusted marketplace serving thousands of 
            happy customers worldwide.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { value: "10,000+", label: "Happy Customers" },
            { value: "50,000+", label: "Products Sold" },
            { value: "4.9★", label: "Customer Rating" },
          ].map((stat, i) => (
            <div key={i} className="bg-secondary/10 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Quality Guaranteed
            </h3>
            <p className="text-muted-foreground">
              Every product undergoes strict quality checks before reaching you.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Fast Shipping
            </h3>
            <p className="text-muted-foreground">
              Free delivery on orders over $50, with tracking available.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Have Questions?
          </h3>
          <p className="text-muted-foreground mb-4">
            We're here to help you 24/7
          </p>
          <Link
            href="/contact"
            className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg 
                       hover:bg-primary/90 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}