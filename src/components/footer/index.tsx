"use client";

import Logo from "@/assets/logo";
import { account, allSeries, home, purchase, reading } from "@/routes/client";
import { ArrowUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

const YEAR = new Date().getFullYear();

const quickLinks = [
  { title: "Home", href: home },
  { title: "All Series", href: allSeries },
  { title: "Get Coins", href: purchase },
  { title: "My Novels", href: reading },
];

const communityLinks = [
  {
    title: "Discord",
    href: "https://discord.gg/HxKaU5j8qU",
    external: true,
  },
  {
    title: "Contact Us",
    href: "mailto:mythoriatales@outlook.com",
    external: true,
  },
];

const legalLinks = [
  { title: "Privacy Policy", href: "/privacy-policy" },
  { title: "DMCA", href: "/dmca" },
];

export default function ApplicationFooter() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (pathname.startsWith(account)) return null;

  return (
    <footer className="border-t border-border/30 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Logo className="size-16 mb-3" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Special Vault Edition of Novels. Premium translated novels for
              readers worldwide.
            </p>
            {!isAuthenticated && (
              <Link href="/account/login">
                <Button size="sm" className="mt-4">
                  Start Reading Free
                </Button>
              </Link>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">
              Community
            </h4>
            <ul className="space-y-2.5">
              {communityLinks.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs">
            &copy; {YEAR} mythoriatales.com. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs">
            Made with care for novel lovers everywhere.
          </p>
        </div>
      </div>

      {/* <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-10 h-10 rounded-full bg-accent text-background flex items-center justify-center hover:bg-accent/90 transition-colors shadow-lg z-50"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-4 h-4" />
      </button> */}
    </footer>
  );
}
