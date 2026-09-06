export default function Header() {
  return (
    <header className="border-b border-[var(--color-inherited-border)] bg-[#f2f5f2] shadow-[0_5px_14px_2px_rgba(0,0,0,0.14)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-bold text-white">
            RB
          </div>

          <span className="text-xl font-bold text-[var(--color-text-primary)]">
            RoleBase
          </span>
        </a>

        {/* Navigation */}
        <nav className="flex items-center justify-end gap-2 sm:gap-4">
          <a href="/login" className="btn-secondary text-sm sm:text-base">
            Login
          </a>

          <a
            href="/signup"
            className="btn-primary px-5 py-2 text-sm sm:text-base"
          >
            Get Started
          </a>
        </nav>
      </div>
    </header>
  );
}
