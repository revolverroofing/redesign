import Link from "next/link";

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#why-us", label: "Why Us" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden
            className="inline-block h-6 w-6 rounded-sm bg-orange-600"
          />
          Revolver Roofing
        </Link>
        <nav aria-label="Primary" className="hidden gap-8 text-sm font-medium text-zinc-700 sm:flex dark:text-zinc-300">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-zinc-950 dark:hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="inline-flex h-9 items-center rounded-full bg-orange-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-700"
        >
          Get a Quote
        </a>
      </div>
    </header>
  );
}
