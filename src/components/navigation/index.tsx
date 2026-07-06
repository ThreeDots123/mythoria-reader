"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "@/assets/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PiCoinsThin } from "react-icons/pi";
import {
  account,
  allSeries,
  home,
  purchase,
  reading,
  login,
  announcements,
} from "@/routes/client";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  LogOut,
  User,
  ChevronDown,
  Home as HomeIcon,
  Search,
  MoreHorizontal,
  BookOpen,
  Megaphone,
  Coins,
  MessageCircle,
  Mail,
  UserCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const leftLinks = [
  { title: "Home", href: home },
  { title: "Series", href: allSeries },
  { title: "Announcement", href: announcements },
];

const rightLinks = [{ title: "My Novels", href: reading }];

export default function Navigation() {
  const [coinDropdownOpen, setCoinDropdownOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setCoinDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  if (pathname.startsWith(account)) return null;

  const handleLogout = async () => {
    setMoreOpen(false);
    await logout();
    router.push(home);
    router.refresh();
  };

  const balance = user?.coinBalance ?? 0;
  const chaptersWorth = Math.floor(balance / 20);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const moreDrawerLinks = [
    { title: "My Novels", href: reading, icon: BookOpen },
    { title: "Get Coins", href: purchase, icon: Coins },
    {
      title: "Discord",
      href: "https://discord.gg/HxKaU5j8qU",
      icon: MessageCircle,
      external: true,
    },
    {
      title: "Contact",
      href: "mailto:mythoriatales@outlook.com",
      icon: Mail,
      external: true,
    },
  ];

  return (
    <>
      {/* Top header */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          "bg-[var(--surface-glass)] backdrop-blur-xl",
          scrolled && "border-b border-border/30 shadow-lg shadow-black/10"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          {/* Left: nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            {leftLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors relative py-1",
                  isActive(link.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.title}
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Center: Logo */}
          <Link href={home} className="flex-shrink-0">
            <Logo className="size-12 md:size-14" />
          </Link>

          {/* Right: nav + coin + auth */}
          <div className="flex items-center gap-3">
            {/* Desktop right links */}
            <nav className="hidden md:flex items-center gap-8 mr-4">
              {rightLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors relative py-1",
                    isActive(link.href)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.title}
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Coin Balance Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCoinDropdownOpen(!coinDropdownOpen)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-sm font-semibold",
                  "bg-coin-gold/10 text-coin-gold hover:bg-coin-gold/20 border border-coin-gold/20"
                )}
              >
                <PiCoinsThin className="w-4 h-4" />
                <span>{balance}</span>
                <ChevronDown
                  className={cn(
                    "w-3 h-3 transition-transform hidden sm:block",
                    coinDropdownOpen && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence>
                {coinDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-elevated border border-border/40 shadow-xl shadow-black/20 p-4 z-50"
                  >
                    <div className="text-center mb-3">
                      <div className="flex items-center justify-center gap-2 text-coin-gold">
                        <PiCoinsThin className="w-6 h-6" />
                        <span className="text-2xl font-bold">{balance}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {chaptersWorth > 0
                          ? `Worth ~${chaptersWorth} chapters`
                          : "No coins yet"}
                      </p>
                    </div>
                    <Link
                      href={purchase}
                      onClick={() => setCoinDropdownOpen(false)}
                    >
                      <Button
                        className="w-full bg-linear-to-r from-(--unlock-gradient-from) to-(--unlock-gradient-to) text-black font-semibold hover:opacity-90"
                        size="sm"
                      >
                        Get Coins
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth (desktop) */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="max-w-28 truncate">{user?.username}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link href={login} className="hidden md:block">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        aria-label="Mobile navigation"
      >
        {/* More drawer */}
        <AnimatePresence>
          {moreOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setMoreOpen(false)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="absolute bottom-full left-0 right-0 z-50 mb-0"
              >
                <div className="mx-3 mb-2 rounded-2xl bg-card border border-border/30 shadow-2xl shadow-black/30 overflow-hidden">
                  {/* Drawer header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                    {isAuthenticated ? (
                      <div className="flex items-center gap-2 text-sm">
                        <UserCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium truncate max-w-[160px]">
                          {user?.username}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">
                        Menu
                      </span>
                    )}
                    <button
                      onClick={() => setMoreOpen(false)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Drawer links */}
                  <div className="py-1">
                    {moreDrawerLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.title}
                          href={link.href}
                          target={link.external ? "_blank" : undefined}
                          onClick={() => setMoreOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                            !link.external && isActive(link.href)
                              ? "text-primary bg-primary/5"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                          )}
                        >
                          <Icon className="w-4.5 h-4.5" />
                          {link.title}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Auth action */}
                  <div className="px-4 py-3 border-t border-border/20">
                    {isAuthenticated ? (
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <LogOut className="w-4.5 h-4.5" />
                        Logout
                      </button>
                    ) : (
                      <Link
                        href={login}
                        onClick={() => setMoreOpen(false)}
                        className="flex items-center gap-3 text-sm font-medium text-primary"
                      >
                        <UserCircle className="w-4.5 h-4.5" />
                        Login / Register
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="relative">
          {/* Center floating logo button — My Novels */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-10">
            <Link
              href={reading}
              className={cn(
                "flex items-center justify-center w-14 h-14 rounded-full border-4 shadow-lg transition-colors",
                isActive(reading)
                  ? "bg-card border-background"
                  : "bg-card border-background"
              )}
            >
              <Logo className="size-8 h-full w-full" />
            </Link>
          </div>

          {/* Bar */}
          <div className="bg-card/95 backdrop-blur-xl border-t border-border/30 px-2 pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around h-16">
              {/* Home */}
              <Link
                href={home}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-16 py-1 transition-colors",
                  isActive(home) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <HomeIcon
                  className={cn("w-5 h-5", isActive(home) && "text-primary")}
                />
                <span
                  className={cn(
                    "text-[10px]",
                    isActive(home) ? "font-semibold" : "font-medium"
                  )}
                >
                  Home
                </span>
              </Link>

              {/* Series */}
              <Link
                href={allSeries}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-16 py-1 transition-colors",
                  isActive(allSeries)
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Search
                  className={cn(
                    "w-5 h-5",
                    isActive(allSeries) && "text-primary"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px]",
                    isActive(allSeries) ? "font-semibold" : "font-medium"
                  )}
                >
                  Series
                </span>
              </Link>

              {/* Spacer for center floating button */}
              <div className="w-16" />

              {/* Announcements */}
              <Link
                href={announcements}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-16 py-1 transition-colors",
                  isActive(announcements)
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Megaphone
                  className={cn(
                    "w-5 h-5",
                    isActive(announcements) && "text-primary"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px]",
                    isActive(announcements) ? "font-semibold" : "font-medium"
                  )}
                >
                  Announcement
                </span>
              </Link>

              {/* More */}
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-16 py-1 transition-colors",
                  moreOpen ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <MoreHorizontal
                  className={cn("w-5 h-5", moreOpen && "text-primary")}
                />
                <span
                  className={cn(
                    "text-[10px]",
                    moreOpen ? "font-semibold" : "font-medium"
                  )}
                >
                  More
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
