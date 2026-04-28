export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Revolver Roofing. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="tel:+15555550123" className="hover:text-zinc-950 dark:hover:text-white">
            (555) 555-0123
          </a>
          <a href="mailto:hello@revolverroofing.example" className="hover:text-zinc-950 dark:hover:text-white">
            hello@revolverroofing.example
          </a>
        </div>
      </div>
    </footer>
  );
}
