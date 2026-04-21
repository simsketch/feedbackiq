import Link from "next/link";
import LogoMark from "@/components/logo-mark";
import { NavAuthLinks } from "@/components/marketing-auth";

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark className="h-8 w-8" />
          <span className="text-lg font-bold tracking-tight">FeedbackIQ</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/vs"
            className="hidden text-sm text-zinc-400 transition-colors hover:text-white sm:block"
          >
            Compare
          </Link>
          <Link
            href="/blog"
            className="hidden text-sm text-zinc-400 transition-colors hover:text-white sm:block"
          >
            Blog
          </Link>
          <NavAuthLinks />
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <LogoMark className="h-6 w-6" />
            <span className="text-sm font-semibold">FeedbackIQ</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/vs" className="transition-colors hover:text-white">
              Compare
            </Link>
            <Link href="/blog" className="transition-colors hover:text-white">
              Blog
            </Link>
            <Link href="/changelog" className="transition-colors hover:text-white">
              Changelog
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="noise-bg">
      <Nav />
      <main className="grid-bg pt-16">{children}</main>
      <Footer />
    </div>
  );
}
