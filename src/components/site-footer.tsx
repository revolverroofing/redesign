import Link from "next/link";
import { business } from "@/lib/business";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {business.name}. All rights reserved.
        </p>
        <div className="flex flex-wrap gap-6">
          <Link
            href="/contractors"
            className="hover:text-zinc-950 dark:hover:text-white"
          >
            For general contractors
          </Link>
          <a
            href={`tel:${business.phoneE164}`}
            className="hover:text-zinc-950 dark:hover:text-white"
            data-analytics="footer-phone"
          >
            {business.phoneDisplay}
          </a>
          <a
            href={`mailto:${business.email}`}
            className="hover:text-zinc-950 dark:hover:text-white"
          >
            {business.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
