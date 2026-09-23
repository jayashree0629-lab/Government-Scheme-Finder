interface HeaderProps {
  onHomeClick: () => void;
  showNav?: boolean;
}

export function Header({ onHomeClick, showNav = false }: HeaderProps) {
  return (
    <header className="border-b border-slate-200/70 surface-glass sticky top-0 z-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
        <button
          onClick={onHomeClick}
          aria-label="Scheme Finder home"
          className="flex items-center gap-2.5 font-semibold text-slate-900 hover:opacity-80 transition rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-white text-sm font-bold">
            SF
          </span>
          <span className="text-base sm:text-lg tracking-tight">Scheme Finder</span>
        </button>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={onHomeClick}
            className="hover:text-slate-900 transition rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            Home
          </button>
          {showNav && (
            <a
              href="#how-it-works"
              className="hover:text-slate-900 transition rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              How it works
            </a>
          )}
        </nav>

        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live search via SerpApi
        </span>
      </div>
    </header>
  );
}
