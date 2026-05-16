import Link from "next/link";
import { business } from "@/lib/business";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center gap-6 px-6 py-24">
      <p className="text-sm font-medium text-orange-600">404</p>
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-white">
        We couldn&apos;t find that page.
      </h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        It may have moved, or the link might be wrong. Need a roof? Reach us
        directly or head back to the homepage.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-full bg-orange-600 px-6 font-medium text-white shadow-sm transition-colors hover:bg-orange-700"
        >
          Back to home
        </Link>
        <a
          href={`tel:${business.phoneE164}`}
          className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-6 font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          data-analytics="not-found-phone"
        >
          Call {business.phoneDisplay}
        </a>
      </div>
    </section>
  );
}
