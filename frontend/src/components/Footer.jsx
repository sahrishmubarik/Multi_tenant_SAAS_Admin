export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#f2f5f2] ">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 px-6 py-3 sm:flex-row">
        {/* Logo */}
        <a to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-bold text-white">
            RB
          </div>

          <span className=" text-xl font-bold text-[var(--color-text-primary)]">
            RoleBase
          </span>
        </a>

        {/* Copyright */}
        <p className="text-sm text-[#7a7d84]">
          © 2026 Roll Base. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
